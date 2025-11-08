import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResenaVoluntariadoDto {
  @IsString({ message: 'El comentario debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El comentario es obligatorio.' })
  comentario: string;
}
