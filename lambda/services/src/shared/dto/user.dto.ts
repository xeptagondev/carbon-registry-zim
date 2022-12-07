import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, isNotEmpty, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { Role } from "../casl/role.enum";
import MutuallyExclusive from "../util/mutualexclusive.decorator";
import { CompanyDto } from "./company.dto";

export class UserDto {

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsNotEmpty()
    @ApiProperty({ enum: Role })
    @IsEnum(Role, {
        message: 'Invalid role. Supported following roles:' + Object.values(Role)
    })
    role: Role;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    phoneNo: string;

    @IsNotEmptyObject()
    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => CompanyDto)
    @MutuallyExclusive('company')
    company: CompanyDto;

    @IsNumber()
    @ApiProperty()
    @IsOptional()
    @MutuallyExclusive('company')
    companyId: number;

    password: string;

    apiKey?: string;
}