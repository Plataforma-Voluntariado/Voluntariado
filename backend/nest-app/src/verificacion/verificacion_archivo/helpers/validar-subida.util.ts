import { BadRequestException } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { VerificacionArchivo, EstadoArchivo, TipoDocumento } from '../entity/verificacion-archivo.entity';
import { RolUsuario, Usuario } from 'src/usuario/entity/usuario.entity';
import { Verificacion } from 'src/verificacion/entity/verificacion.entity';
import { mensajesPorTipo } from './mensajes.util';

export async function validarSubidaArchivo(archivoRepo: Repository<VerificacionArchivo>, usuario: Usuario, verificacion: Verificacion, tipoDocumento: TipoDocumento,): Promise<void> {

    // Validaciones por rol
    if (usuario.rol === RolUsuario.VOLUNTARIO) {
        if (tipoDocumento !== TipoDocumento.CEDULA) {
            throw new BadRequestException('Solo puedes subir un archivo de tipo cédula.');
        }
    }

    if (usuario.rol === RolUsuario.CREADOR) {
        const activos = await archivoRepo.count({
            where: {
                verificacion: { idVerificacion: verificacion.idVerificacion },
                estado: Not(EstadoArchivo.RECHAZADO),
            },
        });

        if (activos >= 2) {
            throw new BadRequestException(
                'Ya tienes ambos documentos cargados o en revisión. Solo puedes volver a subir si alguno fue rechazado.',
            );
        }
    }
    
    //Buscar si ya existe un archivo del mismo tipo activo (pendiente o aprobado)
    const existente = await archivoRepo.findOne({
        where: [
            {
                verificacion: { idVerificacion: verificacion.idVerificacion },
                tipoDocumento,
                estado: EstadoArchivo.PENDIENTE,
            },
            {
                verificacion: { idVerificacion: verificacion.idVerificacion },
                tipoDocumento,
                estado: EstadoArchivo.APROBADO,
            },
        ],
    });

    const texto = mensajesPorTipo[tipoDocumento] ?? 'del documento';

    if (existente) {
        if (existente.estado === EstadoArchivo.APROBADO) {
            throw new BadRequestException(`Ya tienes el documento ${texto} aprobado.`);
        }
        if (existente.estado === EstadoArchivo.PENDIENTE) {
            throw new BadRequestException(`Ya tienes el documento ${texto} pendiente de revisión.`);
        }
    }


}
