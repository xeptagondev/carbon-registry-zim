import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CompanyRole } from "../enum/company.role.enum";
import { EntitySubject } from "./entity.subject";

@Entity()
export class Company implements EntitySubject{

    @PrimaryGeneratedColumn()
    companyId: number;

    @Column({ unique: true, nullable: true })
    taxId: string;

    @Column()
    name: string;

    @Column({ unique: true, nullable: true})
    email: string;

    @Column({nullable: true})
    phoneNo: string;

    @Column({nullable: true})
    website: string;

    @Column({nullable: true})
    address: string;

    @Column({nullable: true})
    logo: string;

    @Column({nullable: true})
    country: string;

    @Column({
        type: "enum",
        enum: CompanyRole,
        array: false
    })
    companyRole: CompanyRole;

}