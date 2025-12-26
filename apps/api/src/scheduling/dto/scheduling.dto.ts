import { IsString, IsDateString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  leadId: string;

  @IsString()
  @IsOptional()
  assignedCloserId?: string;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  visioUrl?: string;

  @IsString()
  @IsOptional()
  visioMeetingId?: string;

  @IsString()
  @IsOptional()
  visioProvider?: string;
}

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  visioUrl?: string;

  @IsEnum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'RESCHEDULED'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  outcome?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedCloserId?: string;
}





