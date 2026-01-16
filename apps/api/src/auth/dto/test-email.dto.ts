import { IsEmail, IsString, MaxLength } from 'class-validator';

export class TestEmailDto {
  @IsEmail(
    {},
    {
      message: 'L\'email doit être une adresse email valide',
    },
  )
  @IsString()
  @MaxLength(255, {
    message: 'L\'email ne peut pas dépasser 255 caractères',
  })
  email: string;
}
