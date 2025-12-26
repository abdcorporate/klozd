import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum FormStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateFormFieldDto {
  @IsString()
  label: string;

  @IsString()
  type: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsInt()
  order: number;

  @IsString()
  @IsOptional()
  scoringRulesJson?: string;

  @IsString()
  @IsOptional()
  optionsJson?: string;
}

export class CreateFormDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FormStatus)
  @IsOptional()
  status?: FormStatus;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  qualificationRulesJson?: string;

  @IsInt()
  @IsOptional()
  minScore?: number;

  @IsString()
  @IsOptional()
  disqualificationMessage?: string;

  @IsString()
  @IsOptional()
  qualifiedRedirectUrl?: string;

  @IsString()
  @IsOptional()
  disqualifiedRedirectUrl?: string;

  @IsBoolean()
  @IsOptional()
  captureAbandons?: boolean;

  @IsInt()
  @IsOptional()
  abandonmentDelay?: number;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  textColor?: string;

  @IsString()
  @IsOptional()
  primaryButtonColor?: string;

  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsString()
  @IsOptional()
  borderRadius?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  @IsOptional()
  formFields?: CreateFormFieldDto[];
}

export class UpdateFormDto extends CreateFormDto {}





