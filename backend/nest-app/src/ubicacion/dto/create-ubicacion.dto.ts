import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUbicacionDto {
  @IsNotEmpty({ message: 'El voluntariado_id es obligatorio.' })
  @IsNumber({}, { message: 'El voluntariado_id debe ser un número.' })
  voluntariado_id: number;

  @IsNotEmpty({ message: 'El ciudad_id es obligatorio.' })
  @IsNumber({}, { message: 'El ciudad_id debe ser un número.' })
  ciudad_id: number;

  @IsNotEmpty({ message: 'La latitud es obligatoria.' })
  @IsNumber(
    { maxDecimalPlaces: 8 },
    { message: 'La latitud debe ser un número decimal con hasta 8 decimales.' },
  )
  latitud: number;

  @IsNotEmpty({ message: 'La longitud es obligatoria.' })
  @IsNumber(
    { maxDecimalPlaces: 8 },
    { message: 'La longitud debe ser un número decimal con hasta 8 decimales.' },
  )
  longitud: number;

  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  direccion: string;

  @IsOptional()
  @IsString({ message: 'El nombre del sector debe ser una cadena de texto.' })
  nombre_sector?: string;
}
