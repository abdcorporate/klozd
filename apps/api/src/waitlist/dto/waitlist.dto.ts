import { IsEmail, IsOptional, IsString, MaxLength, Matches, Length } from 'class-validator';

export class CreateWaitlistEntryDto {
  @IsEmail({}, { message: 'Email invalide' })
  @Length(5, 254, { message: 'Email doit contenir entre 5 et 254 caractères' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Format d\'email invalide',
  })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  leadVolumeRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmCampaign?: string;

  // Champs de sécurité (non validés, utilisés par PublicEndpointSecurityService)
  @IsOptional()
  @IsString()
  honeypot?: string;

  @IsOptional()
  @IsString()
  formRenderedAt?: string;
}
