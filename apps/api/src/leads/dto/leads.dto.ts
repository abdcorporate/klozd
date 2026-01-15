import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';

export class SubmitFormDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsObject()
  data: Record<string, any>; // Réponses du formulaire

  @IsString()
  @IsOptional()
  formRenderedAt?: string; // Timestamp ISO du rendu du formulaire (pour détection de bots)

  @IsString()
  @IsOptional()
  honeypot?: string; // Champ honeypot (doit être vide)
}





