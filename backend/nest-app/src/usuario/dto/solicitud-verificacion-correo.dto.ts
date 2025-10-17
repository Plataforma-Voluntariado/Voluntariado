import { IsEmail } from 'class-validator';

export class solicitudVerificacionCorreoDto {
  @IsEmail()
  correo: string;
}
