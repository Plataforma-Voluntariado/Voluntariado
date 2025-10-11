import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ResetPasswordDto {

  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo token es obligatorio' })
  token: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo nueva contraseña es obligatorio' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
    {
      message:
        'La nueva contraseña debe tener al menos 8 caracteres e incluir: una letra mayúscula, una letra minúscula, un número y un símbolo (por ejemplo: @, #, $, !, %).',
    },
  )
  nuevaContrasena: string;
}
