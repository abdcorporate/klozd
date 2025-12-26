import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum SiteStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateSiteDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SiteStatus)
  @IsOptional()
  status?: SiteStatus;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  contentJson?: string; // JSON avec la structure de la page

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

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
  formId?: string; // ID du formulaire à intégrer
}

export class UpdateSiteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SiteStatus)
  @IsOptional()
  status?: SiteStatus;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  contentJson?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

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
  formId?: string;
}

