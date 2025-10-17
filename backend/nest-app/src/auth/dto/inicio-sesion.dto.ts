import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InicioSesionDto {
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString({ message: 'La contraseña debe ser un texto válido' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasena: string;
}
