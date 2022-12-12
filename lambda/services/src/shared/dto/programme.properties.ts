import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsPositive, IsInt, IsNumber, IsEnum, MaxLength, IsOptional } from "class-validator";
import { GHGs } from "../enum/ghgs.enum";
import { SourceOfFunding } from "../enum/sourceoffinding.enum";

export class ProgrammeProperties {

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    maxInternationalTransferAmount: string;

    @ApiPropertyOptional()
    @IsPositive()
    @IsInt()
    @IsOptional()
    @IsNotEmpty()
    creditingPeriodInYears: number;

    @ApiProperty()
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    programmeCostUSD: number;
    
    @ApiPropertyOptional({ enum: SourceOfFunding })
    @IsEnum(SourceOfFunding, {
        message: 'Invalid source of funding. Supported following values:' + Object.values(SourceOfFunding)
    })
    @IsNotEmpty()
    sourceOfFunding: SourceOfFunding;

    @ApiPropertyOptional()
    @IsPositive()
    @IsNumber()
    @IsOptional()
    grantEquivalentAmount: number;

    @ApiPropertyOptional()
    @IsPositive()
    @IsNumber()
    @IsOptional()
    carbonPriceUSDPerTon: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    proponentPercentage: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    buyerCountryEligibility: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    geographicalLocation:string;

    @ApiProperty({ enum: GHGs, isArray: true })
    @IsEnum(GHGs, {
        message: 'Invalid green house gas. Supported following values:' + Object.values(GHGs),
        each: true
    })
    @IsNotEmpty()
    greenHouseGasses: GHGs[];

    ITMOYear: number
}