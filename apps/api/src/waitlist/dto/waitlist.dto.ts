import { IsEmail, IsOptional, IsString, MaxLength, Matches, Length, MinLength, ValidateBy } from 'class-validator';
import { Transform } from 'class-transformer';

/** Accepte string | number pour formRenderedAt (timestamp ms ou ISO string) — évite "must be a string" en prod */
function IsStringOrNumber() {
  return ValidateBy({
    name: 'isStringOrNumber',
    validator: {
      validate(value: unknown) {
        return value === undefined || value === null || typeof value === 'string' || typeof value === 'number';
      },
      defaultMessage() {
        return 'formRenderedAt must be a string or number';
      },
    },
  });
}

export class CreateWaitlistEntryDto {
  @IsEmail({}, { message: 'Email invalide' })
  @Length(5, 254, { message: 'Email doit contenir entre 5 et 254 caractères' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Format d\'email invalide',
  })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  /** Alias front: leadVolumeRange (DB) ou leadsVolume (front) */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  leadVolumeRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  leadsVolume?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  teamSize?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  revenue?: string;

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

  /** UTM en snake_case (envoyé par le front) */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  utm_source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utm_medium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utm_campaign?: string;

  @IsOptional()
  @IsString()
  honeypot?: string;

  /** Accepte number (timestamp ms) ou string ; conversion dans le controller pour validateSecurity */
  @IsOptional()
  @IsStringOrNumber()
  @Transform(({ value }) => (value != null && typeof value === 'number' ? String(value) : value) as string | undefined)
  formRenderedAt?: string | number;
}
