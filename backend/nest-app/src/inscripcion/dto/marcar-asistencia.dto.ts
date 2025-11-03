import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class MarcarAsistenciaDto {
  @IsNotEmpty({ message: 'El valor de asistencia es obligatorio.' })
  @Transform(({ value }) => {
    if (value === true || value === 1) return true;
    if (value === '1') return true;
    if (typeof value === 'string') {
      const v = value.toLowerCase().trim();
      if (v === 'true') return true;
      if (v === 'false') return false;
    }
    return false;
  })
  asistencia: boolean;
}
