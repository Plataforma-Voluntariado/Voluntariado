import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class MarcarAsistenciaDto {
  @IsNotEmpty({ message: 'El valor de asistencia es obligatorio.' })
  @Transform(({ value }) => value === 1 || value === '1')
  asistencia: boolean;
}
