import { IsString, IsOptional, IsObject, IsNumber, Min } from 'class-validator';

/**
 * DTO pour l'évaluation publique d'un formulaire (preview)
 */
export class EvaluateFormDto {
  @IsObject()
  data: Record<string, any>; // Réponses du formulaire

  @IsString()
  @IsOptional()
  formRenderedAt?: string; // Timestamp ISO du rendu du formulaire (pour détection de bots)

  @IsString()
  @IsOptional()
  honeypot?: string; // Champ honeypot (doit être vide)
}

/**
 * DTO pour la soumission publique d'un formulaire
 */
export class SubmitPublicFormDto {
  @IsString()
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
