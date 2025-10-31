import { 
  IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, Max, 
  ValidateNested, IsNumber, IsArray, ArrayUnique, MinLength 
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoVoluntariado } from '../entity/voluntariado.entity';

class UpdateUbicacionAnidadaDto {
  @IsInt({ message: 'El ID de la ciudad debe ser un número entero.' })
  @IsOptional()
  @Type(() => Number)
  ciudad_id?: number;

  @IsNumber({ maxDecimalPlaces: 8 }, { message: 'La latitud debe tener un formato decimal válido (máx 8 decimales).' })
  @Min(-90, { message: 'La latitud mínima es -90.' })
  @Max(90, { message: 'La latitud máxima es 90.' })
  @IsOptional()
  @Type(() => Number)
  latitud?: number;

  @IsNumber({ maxDecimalPlaces: 8 }, { message: 'La longitud debe tener un formato decimal válido (máx 8 decimales).' })
  @Min(-180, { message: 'La longitud mínima es -180.' })
  @Max(180, { message: 'La longitud máxima es 180.' })
  @IsOptional()
  @Type(() => Number)
  longitud?: number;

  @IsString({ message: 'La dirección debe ser texto.' })
  @IsOptional()
  direccion?: string;

  @IsString({ message: 'El nombre del sector debe ser texto.' })
  @IsOptional()
  nombre_sector?: string;
}

export class UpdateVoluntariadoDto {
  @IsString({ message: 'El título debe ser un texto válido.' })
  @MaxLength(255, { message: 'El título no puede superar los 255 caracteres.' })
  @IsOptional()
  titulo?: string;

  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsOptional()
  descripcion?: string;

  @IsOptional()
  @Type(() => Date)
  fechaHora?: Date;

  @IsInt({ message: 'Las horas deben ser un número entero.' })
  @Min(1, { message: 'Las horas deben ser como mínimo 1.' })
  @IsOptional()
  @Type(() => Number)
  horas?: number;

  @IsInt({ message: 'El número máximo de participantes debe ser un número entero.' })
  @Min(1, { message: 'El número máximo de participantes debe ser como mínimo 1.' })
  @Max(100, { message: 'El número máximo de participantes no puede superar 100.' })
  @IsOptional()
  @Type(() => Number)
  maxParticipantes?: number;

  @IsEnum(EstadoVoluntariado, {
    message: 'Estado inválido. Valores permitidos: PENDIENTE, REALIZADO, NO_REALIZADO, CANCELADO.',
  })
  @IsOptional()
  estado?: EstadoVoluntariado;

  @IsInt({ message: 'El ID de categoría debe ser un número entero.' })
  @IsOptional()
  @Type(() => Number)
  categoria_id?: number;

  @ValidateNested()
  @Type(() => UpdateUbicacionAnidadaDto)
  @IsOptional()
  ubicacion?: UpdateUbicacionAnidadaDto;

  @IsOptional()
  @IsArray({ message: 'fotosMantener debe ser un arreglo' })
  @ArrayUnique()
  @MinLength(1, { message: 'Debe mantener mínimo una foto si se envía este arreglo.' })
  @IsInt({ each: true, message: 'Cada valor en fotosMantener debe ser un número entero' })
  @Type(() => Number) // ✅ convierte strings a números
  fotosMantener?: number[];
}
