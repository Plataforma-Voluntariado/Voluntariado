import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateResenaVoluntariadoDto {
  @IsInt({ message: 'El ID del voluntario debe ser un número entero.' })
  @IsNotEmpty({ message: 'El campo "voluntario_id" es obligatorio.' })
  voluntario_id: number;

  @IsInt({ message: 'El ID del voluntariado debe ser un número entero.' })
  @IsNotEmpty({ message: 'El campo "voluntariado_id" es obligatorio.' })
  voluntariado_id: number;

  @IsString({ message: 'El comentario debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El comentario es obligatorio.' })
  comentario: string;
}
