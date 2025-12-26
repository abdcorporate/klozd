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
}





