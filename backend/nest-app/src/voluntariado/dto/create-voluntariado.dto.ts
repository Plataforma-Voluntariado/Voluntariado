import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested, Max, IsNumber, } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoVoluntariado } from '../entity/voluntariado.entity';

/**
 * DTO para la creación de la ubicación del voluntariado.
 */
class CreateUbicacionAnidadaDto {
  @IsInt({ message: 'El ID de la ciudad debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID de la ciudad es obligatorio.' })
  @Type(() => Number)
  ciudad_id: number;

  @IsNumber(
    { maxDecimalPlaces: 8 },
    { message: 'La latitud debe tener un formato decimal válido (máx 8 decimales).' },
  )
  @Min(-90, { message: 'La latitud mínima es -90.' })
  @Max(90, { message: 'La latitud máxima es 90.' })
  @IsNotEmpty({ message: 'La latitud es obligatoria.' })
  @Type(() => Number)
  latitud: number;

  @IsNumber(
    { maxDecimalPlaces: 8 },
    { message: 'La longitud debe tener un formato decimal válido (máx 8 decimales).' },
  )
  @Min(-180, { message: 'La longitud mínima es -180.' })
  @Max(180, { message: 'La longitud máxima es 180.' })
  @IsNotEmpty({ message: 'La longitud es obligatoria.' })
  @Type(() => Number)
  longitud: number;

  @IsString({ message: 'La dirección debe ser texto.' })
  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  direccion: string;

  @IsString({ message: 'El nombre del sector debe ser texto.' })
  @IsOptional()
  nombre_sector?: string;
}

/**
 * DTO principal para crear un voluntariado con ubicación y archivos de fotos.
 */
export class CreateVoluntariadoDto {
  @IsString({ message: 'El título debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(255, { message: 'El título no puede superar los 255 caracteres.' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  descripcion: string;

  @IsNotEmpty({ message: 'La fecha y hora son obligatorias.' })
  @Type(() => Date)
  fechaHora: Date;

  @IsNotEmpty({ message: 'Las horas son obligatorias.' })
  @Type(() => Number)
  @IsInt({ message: 'Las horas deben ser un número entero.' })
  @Min(1, { message: 'Las horas deben ser como mínimo 1.' })
  horas: number;

  @IsNotEmpty({ message: 'El número máximo de participantes es obligatorio.' })
  @Type(() => Number)
  @IsInt({ message: 'El número máximo de participantes debe ser un número entero.' })
  @Min(1, { message: 'El número máximo de participantes debe ser como mínimo 1.' })
  @Max(100, { message: 'El número máximo de participantes no puede superar 100.' })
  maxParticipantes: number;

  @IsOptional()
  @IsEnum(EstadoVoluntariado, {
    message:
      'El estado debe ser uno de los siguientes valores: PENDIENTE, REALIZADO, NO_REALIZADO o CANCELADO.',
  })
  estado?: EstadoVoluntariado;

  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @Type(() => Number)
  @IsInt({ message: 'El ID de categoría debe ser un número entero.' })
  categoria_id: number;

  /**
   * Ubicación del voluntariado (anidada en el cuerpo).
   */
  @ValidateNested()
  @Type(() => CreateUbicacionAnidadaDto)
  @IsNotEmpty({ message: 'La ubicación es obligatoria.' })
  ubicacion: CreateUbicacionAnidadaDto;
}