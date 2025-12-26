import { IsString, IsInt, IsBoolean, IsEnum, IsOptional, Min, Max } from 'class-validator';

export enum AttributionMethod {
  ROUND_ROBIN = 'ROUND_ROBIN',
  AI_INTELLIGENT = 'AI_INTELLIGENT',
  MANUAL = 'MANUAL',
}

export class UpdateCalendarConfigDto {
  @IsInt()
  @Min(5)
  @Max(120)
  @IsOptional()
  callDuration?: number;

  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  bufferBefore?: number;

  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  bufferAfter?: number;

  @IsString()
  @IsOptional()
  availabilityJson?: string; // JSON string avec les disponibilités

  @IsString()
  @IsOptional()
  assignedClosersJson?: string; // JSON array of user IDs

  @IsEnum(AttributionMethod)
  @IsOptional()
  attributionMethod?: AttributionMethod;

  @IsBoolean()
  @IsOptional()
  emailConfirmationImmediate?: boolean;

  @IsBoolean()
  @IsOptional()
  emailReminder24h?: boolean;

  @IsBoolean()
  @IsOptional()
  emailReminder1h?: boolean;

  @IsBoolean()
  @IsOptional()
  smsReminder1h?: boolean;
}

