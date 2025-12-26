import { IsOptional, IsString, IsNumber, IsBoolean, IsObject, IsEmail } from 'class-validator';

export class UpdateOrganizationSettingsDto {
  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @IsOptional()
  @IsNumber()
  monthlyPrice?: number;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsObject()
  billingAddress?: any;

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  maxForms?: number;

  @IsOptional()
  @IsNumber()
  maxLeadsPerMonth?: number;

  @IsOptional()
  @IsNumber()
  maxAppointmentsPerMonth?: number;

  @IsOptional()
  @IsNumber()
  maxSmsPerMonth?: number;

  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsBoolean()
  callRecordingEnabled?: boolean;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

