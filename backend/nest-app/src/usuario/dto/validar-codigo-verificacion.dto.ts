import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerificacionCorreoDto {
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo token es obligatorio' })
  @Matches(/^[A-Za-z0-9]{6}$/, {
    message: 'El token debe tener exactamente 6 caracteres alfanuméricos',
  })
  token: string;
}
