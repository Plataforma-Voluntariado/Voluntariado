import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoVoluntariado } from '../entity/voluntariado.entity';

export class UpdateVoluntariadoDto {
  @IsString({ message: 'El título debe ser un texto válido.' })
  @MaxLength(255, { message: 'El título no puede superar los 255 caracteres.' })
  @IsOptional()
  titulo?: string;

  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsOptional()
  descripcion?: string;

  @IsOptional({ message: 'La fecha y hora deben ser válidas.' })
  fechaHora?: Date;

  @IsInt({ message: 'Las horas deben ser un número entero.' })
  @Min(1, { message: 'Las horas deben ser como mínimo 1.' })
  @IsOptional()
  horas?: number;

  @IsEnum(EstadoVoluntariado, {
    message:
      'El estado debe ser uno de los siguientes valores: PENDIENTE, REALIZADO, NO_REALIZADO o CANCELADO.',
  })
  @IsOptional()
  estado?: EstadoVoluntariado;

  @IsInt({ message: 'El ID de categoría debe ser un número entero.' })
  @IsOptional()
  categoria_id?: number;
}
