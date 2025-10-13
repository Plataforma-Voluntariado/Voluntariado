import { IsString, IsNotEmpty, Matches, IsInt } from 'class-validator';

export class VerificacionCorreoDto {

  @IsInt({ message: 'El id debe ser un numero' })
  @IsNotEmpty({ message: 'El campo userID es obligatorio' })
  userId: number

  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo token es obligatorio' })
  token: string;
}
