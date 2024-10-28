import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";

export class ValidationAgreementContentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  dateOfIssue: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  climateFundDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  projectParticipantDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  definitions: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  whereasConditions: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  settlementFee: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  climateFundSignature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  projectParticipantSignature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  projectParticipantSignatory: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  witness1Signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  witness1Name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  witness1Designation: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  witness2Label: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  witness2Signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  witness2Name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  witness2Designation: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  annexureAComment: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  annexureADoc: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  annexureBComment: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  annexureBDoc: string;
}
