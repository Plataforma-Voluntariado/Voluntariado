import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoVoluntariado } from '../entity/voluntariado.entity';

export class CreateVoluntariadoDto {
  @IsString({ message: 'El título debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(255, { message: 'El título no puede superar los 255 caracteres.' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  descripcion: string;

  @IsNotEmpty({ message: 'La fecha y hora son obligatorias.' })
  fechaHora: Date;

  @IsInt({ message: 'Las horas deben ser un número entero.' })
  @Min(1, { message: 'Las horas deben ser como mínimo 1.' })
  @IsNotEmpty({ message: 'Las horas son obligatorias.' })
  horas: number;

  @IsEnum(EstadoVoluntariado, {
    message:
      'El estado debe ser uno de los siguientes valores: PENDIENTE, REALIZADO, NO_REALIZADO o CANCELADO.',
  })
  @IsOptional()
  estado?: EstadoVoluntariado;

  @IsInt({ message: 'El ID de categoría debe ser un número entero.' })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  categoria_id: number;
}
