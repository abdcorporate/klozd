import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum DealStage {
  QUALIFIED = 'QUALIFIED',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export enum DealStatus {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  LOST = 'LOST',
  ARCHIVED = 'ARCHIVED',
}

export class CreateDealDto {
  @IsString()
  leadId: string;

  @IsString()
  title: string;

  @IsNumber()
  value: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @IsNumber()
  @IsOptional()
  closingProbability?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateDealDto extends CreateDealDto {}





