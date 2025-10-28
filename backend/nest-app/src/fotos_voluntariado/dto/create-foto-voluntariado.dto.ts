import { IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFotoVoluntariadoDto {
  @IsOptional()
  @IsUrl({}, { message: 'La URL debe ser válida.' })
  url?: string;

  @IsNotEmpty({ message: 'El voluntariado_id es obligatorio.' })
  @Type(() => Number) 
  @IsNumber({}, { message: 'El voluntariado_id debe ser un número.' })
  voluntariado_id: number;
}
