import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, IsDate, IsNumber, Length, ValidateIf, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { RolUsuario } from '../entity/usuario.entity';
import { TipoEntidad } from 'src/creador/entity/creador.entity';
import { IsNotFutureDate } from 'src/validators/is-not-future-date.validator';

export class CreateUsuarioDto {

  // Nombre obligatorio solo si NO es creador
  @ValidateIf(o => o.rol !== RolUsuario.CREADOR)
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
  nombre?: string;

  // Apellido obligatorio solo si NO es creador
  @ValidateIf(o => o.rol !== RolUsuario.CREADOR)
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo apellido es obligatorio' })
  apellido?: string;

  // Nombre de la entidad obligatorio solo si es creador
  @ValidateIf(o => o.rol === RolUsuario.CREADOR)
  @IsString({ message: 'El nombre de la entidad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo nombre_entidad es obligatorio' })
  nombre_entidad?: string;

  // Dirección obligatoria solo si es creador
  @ValidateIf(o => o.rol === RolUsuario.CREADOR)
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo direccion es obligatoria' })
  direccion?: string;

  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty({ message: 'El campo correo es obligatorio' })
  correo: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo contraseña es obligatorio' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
    {
      message:
        'La contraseña debe tener al menos 8 caracteres e incluir: una letra mayúscula, una letra minúscula, un número y un símbolo (por ejemplo: @, #, $, !, %).'
    },
  )
  contrasena: string;


  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo teléfono es obligatorio' })
  @Length(10, 10, { message: 'El teléfono debe tener exactamente 10 dígitos' })
  telefono: string;

  // Fecha de nacimiento obligatoria solo si NO es creador
  @ValidateIf(o => o.rol !== RolUsuario.CREADOR)
  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsNotFutureDate({ message: 'La fecha de nacimiento no puede ser futura' })
  @IsNotEmpty({ message: 'El campo fecha_nacimiento es obligatoria' })
  fecha_nacimiento?: Date;

  // rol siempre oblihatorio
  @IsEnum(RolUsuario, { message: 'El rol no es válido' })
  @IsNotEmpty({ message: 'El campo rol es obligatorio' })
  rol: RolUsuario;

  @IsNumber({}, { message: 'La ciudad debe ser un número válido' })
  @IsNotEmpty({ message: 'El campo id_ciudad es obligatoria' })
  @Type(() => Number)
  id_ciudad: number;

  // Tipo de entidad obligatorio solo si es creador
  @ValidateIf(o => o.rol === RolUsuario.CREADOR)
  @IsEnum(TipoEntidad, { message: 'El tipo de entidad no es válido' })
  @IsNotEmpty({ message: 'El campo tipo_entidad es obligatorio' })
  tipo_entidad?: TipoEntidad;

  // Descripcion obligatoria solo si es creador
  @ValidateIf(o => o.rol === RolUsuario.CREADOR)
  @IsString({ message: 'La descripcion debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo descripcion es obligatoria' })
  descripcion?: string;


  // Sitio Web opcional solo si es creador
  @ValidateIf(o => o.rol === RolUsuario.CREADOR)
  @IsString({ message: 'El sitio web debe ser una cadena de texto' })
  @IsOptional()
  sitio_web?: string;


}
