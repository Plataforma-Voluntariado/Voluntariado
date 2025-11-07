import { IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class MarcarAsistenciaDto {
  @IsOptional() 
  @Transform(({ value }) => {
    if (value === true || value === 1 || value === '1') return true;
    if (value === false || value === 0 || value === '0') return false;
    if (typeof value === 'string') {
      const v = value.toLowerCase().trim();
      if (v === 'true') return true;
      if (v === 'false') return false;
    }
    return null;
  })
  asistencia: boolean | null;
}
