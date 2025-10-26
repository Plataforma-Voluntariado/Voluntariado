import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede superar los 255 caracteres.' })
  nombre: string;
}
