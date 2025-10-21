import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RechazarArchivoDto {
  @IsNotEmpty({ message: 'Debe ingresar una observación del rechazo.' })
  @IsString({ message: 'Las observaciones deben ser texto.' })
  @MaxLength(500, { message: 'Las observaciones no pueden superar los 500 caracteres.' })
  observaciones: string;
}
