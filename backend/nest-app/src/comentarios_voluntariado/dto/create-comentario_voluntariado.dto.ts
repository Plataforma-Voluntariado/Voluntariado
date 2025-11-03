import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateComentarioVoluntariadoDto {
  @IsInt({ message: 'El ID del voluntario debe ser un número entero.' })
  @IsNotEmpty({ message: 'El campo "voluntario_id" es obligatorio.' })
  voluntario_id: number;

  @IsInt({ message: 'El ID del creador debe ser un número entero.' })
  @IsNotEmpty({ message: 'El campo "creador_id" es obligatorio.' })
  creador_id: number;

  @IsInt({ message: 'El ID del voluntariado debe ser un número entero.' })
  @IsNotEmpty({ message: 'El campo "voluntariado_id" es obligatorio.' })
  voluntariado_id: number;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser un texto válido.' })
  comentario?: string;

  @IsInt({ message: 'La calificación debe ser un número entero.' })
  @Min(1, { message: 'La calificación mínima permitida es 1.' })
  @Max(5, { message: 'La calificación máxima permitida es 5.' })
  @IsNotEmpty({ message: 'La calificación es obligatoria.' })
  calificacion: number;
}
