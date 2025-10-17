import { BadRequestException } from '@nestjs/common';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { TipoDocumento } from '../entity/verificacion-archivo.entity';

export function determinarTipoDocumento(rol: RolUsuario, tipoDocumento: string,): TipoDocumento {
  const tipoNormalizado = tipoDocumento.toLowerCase().trim();

  //Validar tipo válido antes de evaluar rol
  if (tipoNormalizado !== 'cedula' && tipoNormalizado !== 'rut') {
    throw new BadRequestException(
      `El tipo de documento "${tipoDocumento}" no es válido. Usa "cedula" o "rut".`,
    );
  }

  // VOLUNTARIO
  if (rol === RolUsuario.VOLUNTARIO) {
    if (tipoNormalizado !== 'cedula') {
      throw new BadRequestException(
        `Los voluntarios solo pueden subir documentos de tipo "cedula".`,
      );
    }
    return TipoDocumento.CEDULA;
  }

  // CREADOR
  if (rol === RolUsuario.CREADOR) {
    if (tipoNormalizado === 'cedula') return TipoDocumento.CEDULA;
    if (tipoNormalizado === 'rut') return TipoDocumento.RUT;
  }

  // ADMIN 
  if (rol === RolUsuario.ADMIN) {
    throw new BadRequestException(
      `Tu rol (${rol}) no necesita subir documentos para verificación.`,
    );
  }

  throw new BadRequestException(
    `No se pudo determinar el tipo de documento para el rol "${rol}".`,
  );
}
