import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UserDto } from '../../shared/dto/user.dto';
import { Connection, EntityManager, QueryFailedError, Repository } from 'typeorm';
import { User } from '../../shared/entities/user.entity';
import { EmailService } from '../../shared/email/email.service';
import { QueryDto } from '../../shared/dto/query.dto';
import { EmailTemplates } from '../../shared/email/email.template';
import { PG_UNIQUE_VIOLATION } from '@drdgvhbh/postgres-error-codes';
import { UserUpdateDto } from '../../shared/dto/user.update.dto';
import { PasswordUpdateDto } from '../../shared/dto/password.update.dto';
import { BasicResponseDto } from '../../shared/dto/basic.response.dto';
import { Role } from '../../shared/casl/role.enum';
import { nanoid } from 'nanoid';
import { API_KEY_SEPARATOR } from '../../shared/constants';
import { DataResponseDto } from '../../shared/dto/data.response.dto';
import { DataListResponseDto } from '../../shared/dto/data.list.response';
import { ConfigService } from '@nestjs/config';
import { CompanyRole } from '../../shared/enum/company.role.enum';
import { plainToClass } from 'class-transformer';
import { Company } from '../../shared/entities/company.entity';
import { CompanyService } from '../company/company.service';

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepo: Repository<User>,
        private emailService: EmailService,
        private logger: Logger,
        private configService: ConfigService,
        @InjectEntityManager() private entityManger: EntityManager,
        private companyService: CompanyService
    ) { }

    private generateRandomPassword() {
        var pass = '';
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz0123456789@#$';

        for (let i = 1; i <= 8; i++) {
            var char = Math.floor(Math.random()
                * str.length + 1);

            pass += str.charAt(char)
        }

        return pass;
    }

    private async generateApiKey(email) {
        return Buffer.from(`${email}${API_KEY_SEPARATOR}${await nanoid()}`).toString('base64')
    }

    async getUserCredentials(username: string): Promise<User | undefined> {
        const users = await this.userRepo.find({
            select: ['id', 'email', 'password', 'role', 'apiKey', 'companyId', 'companyRole'],
            where: {
                email: username,
            }
        });
        return (users && users.length > 0) ? users[0] : undefined;
    }

    async findOne(username: string): Promise<User | undefined> {
        const users = await this.userRepo.find({
            where: {
                email: username,
            }
        });
        return (users && users.length > 0) ? users[0] : undefined;
    }

    async findById(id: number): Promise<User | undefined> {
        return await this.userRepo.findOneBy({
            id: id,
        });
    }

    async update(userDto: UserUpdateDto, abilityCondition: string): Promise<DataResponseDto | undefined> {
        this.logger.verbose('User update received', abilityCondition)
        const { id, ...update } = userDto;

        const result = await this.userRepo.createQueryBuilder()
            .update(User)
            .set(update)
            .where(`id = ${id} ${abilityCondition ? (' AND ' + abilityCondition) : ""}`)
            .execute().catch((err: any) => {
                this.logger.error(err)
                return err;
            });
        if (result.affected) {
            return new DataResponseDto(HttpStatus.OK, await this.findById(id));
        }
        throw new HttpException("No visible user found", HttpStatus.NOT_FOUND)
    }

    async resetPassword(id: number, passwordResetDto: PasswordUpdateDto, abilityCondition: string) {
        this.logger.verbose('User password reset received', id)

        const user = await this.userRepo.createQueryBuilder().where(`id = '${id}' ${abilityCondition ? ' AND ' + abilityCondition : ""}`).addSelect(["User.password"]).getOne()
        if (!user || user.password != passwordResetDto.oldPassword) {
            throw new HttpException("Password mismatched", HttpStatus.UNAUTHORIZED)
        }
        const result = await this.userRepo.update({
            id: id
        }, {
            password: passwordResetDto.newPassword
        }).catch((err: any) => {
            this.logger.error(err)
            return err;
        });
        if (result.affected > 0) {
            return new BasicResponseDto(HttpStatus.OK, "Successfully updated");
        }
        throw new HttpException("Password update failed. Please try again", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    async regenerateApiKey(email, abilityCondition) {
        this.logger.verbose('Regenerated api key received', email)
        const user = await this.userRepo.createQueryBuilder().where(`email = '${email}' ${abilityCondition ? ' AND ' + abilityCondition : ""}`).getOne()
        if (!user) {
            throw new HttpException("No visible user found", HttpStatus.UNAUTHORIZED)
        }
        const apiKey = await this.generateApiKey(email)
        const result = await this.userRepo.update({
            id: user.id
        }, {
            apiKey: apiKey
        }).catch((err: any) => {
            this.logger.error(err)
            return err;
        });

        if (result.affected > 0) {
            await this.emailService.sendEmail(
                user.email,
                EmailTemplates.API_KEY_EMAIL,
                {
                    "name": user.name,
                    "apiKey": apiKey
                });

            return new BasicResponseDto(HttpStatus.OK, "Successfully updated");
        }
        throw new HttpException("Password update failed. Please try again", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async create(userDto: UserDto, companyId: number, companyRole: CompanyRole): Promise<User | undefined> {
        this.logger.verbose(`User create received  ${userDto.email} ${companyId}`)

        const user = await this.findOne(userDto.email)
        if (user) {
            throw new HttpException("User already exist in the system", HttpStatus.BAD_REQUEST)
        }

        const { company, ...userFields } = userDto
        if (company) {
            if (company.companyRole != CompanyRole.CERTIFIER || !company.country) {
                company.country = this.configService.get('systemCountry')
            }
            
            if (company.companyRole == CompanyRole.GOVERNMENT) {
                const companyGov = await this.companyService.findGovByCountry(company.country);
                if (companyGov) {
                    throw new HttpException(`Government already exist for the country code ${company.country}`, HttpStatus.BAD_REQUEST);
                }
            }
        }
        
        const u = plainToClass(User, userFields);
        if (userDto.company) {
            u.companyRole = userDto.company.companyRole
        } else if (u.companyId){
            const company = await this.companyService.findByCompanyId(u.companyId);
            u.companyRole = company.companyRole
        } else {
            u.companyId = companyId
            u.companyRole = companyRole
        }

        if (u.companyRole != CompanyRole.CERTIFIER || !u.country) {
            u.country = this.configService.get('systemCountry');
        }

        u.password = this.generateRandomPassword()   
        if (userDto.role == Role.Admin && u.companyRole == CompanyRole.MRV) {
            u.apiKey = await this.generateApiKey(userDto.email)
        }

        if (this.configService.get('stage') != 'local') {
            await this.emailService.sendEmail(
                u.email,
                EmailTemplates.REGISTER_EMAIL,
                {
                    "name": u.name,
                    "countryName": this.configService.get('systemCountry'),
                    "password": u.password,
                    "apiKeyText":u.apiKey? `<br>Api Key: ${u.apiKey}`: ""
                });
        }

        
        const usr = await this.entityManger.transaction(async (em) => {
            if (company) {
                const c = await em.save<Company>(plainToClass(Company, company));
                u.companyId = c.companyId
                u.companyRole = c.companyRole
            }
            const user = await em.save<User>(u);
            return user;
        }).catch((err: any) => {
            if (err instanceof QueryFailedError) {
                console.log(err)
                switch (err.driverError.code) {
                    case PG_UNIQUE_VIOLATION:
                        if (err.driverError.detail.includes('email')) {
                            throw new HttpException(`${err.driverError.table == 'company' ? 'Company email' : 'Email'} already exist`, HttpStatus.BAD_REQUEST);
                        } else if (err.driverError.detail.includes('taxId')) {
                            throw new HttpException('Company tax id already exist', HttpStatus.BAD_REQUEST);
                        } 
                }
                this.logger.error(`User add error ${err}`)
            } else {
                this.logger.error(`User add error ${err}`)
            }
            return err;
        })

        const { apiKey, password, ...resp } = usr
        return this.configService.get('stage') != 'local' ? resp : usr;
    }

    async query(query: QueryDto, abilityCondition: string): Promise<any> {
        const resp = (await this.userRepo.createQueryBuilder()
            .where(abilityCondition ? abilityCondition : "")
            .skip((query.size * query.page) - query.size)
            .take(query.size)
            .getManyAndCount())

        return new DataListResponseDto(
            resp.length > 0 ? resp[0] : undefined,
            resp.length > 1 ? resp[1] : undefined
        );
    }

    async delete(username: string, ability: string): Promise<BasicResponseDto> {
        this.logger.verbose('User delete received', username)
        const result = await this.userRepo.createQueryBuilder().where(`email = '${username}'`).andWhere(ability ? ability : "").getMany()
        if (result.length <= 0) {
            throw new HttpException("No visible user found", HttpStatus.NOT_FOUND)
        }
        const result2 = await this.userRepo.delete({ email: username });
        if (result2.affected > 0) {
            return new BasicResponseDto(HttpStatus.OK, "Successfully deleted");
        }
        throw new HttpException("Delete failed. Please try again", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}