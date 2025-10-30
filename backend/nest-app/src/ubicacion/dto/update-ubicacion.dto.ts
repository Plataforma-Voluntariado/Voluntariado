import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUbicacionDto {
  @IsOptional()
  @IsNumber({}, { message: 'El voluntariado_id debe ser un número.' })
  voluntariado_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ciudad_id debe ser un número.' })
  ciudad_id?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 8 },
    { message: 'La latitud debe ser un número decimal con hasta 8 decimales.' },
  )
  latitud?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 8 },
    { message: 'La longitud debe ser un número decimal con hasta 8 decimales.' },
  )
  longitud?: number;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'El nombre del sector debe ser una cadena de texto.' })
  nombre_sector?: string;
}
