import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateEstadisticasVoluntarioDto {
  @IsInt({ message: 'El ID del voluntario debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID del voluntario es obligatorio.' })
  voluntario_id: number;

  @IsNumber({}, { message: 'Las horas trabajadas deben ser un número.' })
  @Min(0, { message: 'Las horas trabajadas no pueden ser negativas.' })
  horas_trabajadas: number;

  @IsInt({ message: 'Las participaciones deben ser un número entero.' })
  @Min(0, { message: 'Las participaciones no pueden ser negativas.' })
  participaciones: number;

  @IsNumber({}, { message: 'El porcentaje de asistencia debe ser un número.' })
  @Min(0, { message: 'El porcentaje de asistencia no puede ser negativo.' })
  porcentaje_asistencia: number;
}
