import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verificacion, EstadoVerificacion } from './entity/verificacion.entity';
import { VerificacionArchivo, EstadoArchivo, TipoDocumento } from './verificacion_archivo/entity/verificacion-archivo.entity';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { Creador } from 'src/creador/entity/creador.entity';

@Injectable()
export class VerificacionService {
    constructor(
        @InjectRepository(Verificacion)
        private readonly verificacionRepo: Repository<Verificacion>,
        @InjectRepository(VerificacionArchivo)
        private readonly archivoRepo: Repository<VerificacionArchivo>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) { }

    async validarVerificacionCompleta(usuario: Usuario, admin: Administrador): Promise<Verificacion> {
        //Buscar la verificación asociada al usuario
        const verificacion = await this.verificacionRepo.findOne({
            where: { usuario: { id_usuario: usuario.id_usuario } },
            relations: ['usuario', 'archivos'],
        });

        if (!verificacion) {
            throw new NotFoundException('El usuario no tiene una verificación activa');
        }

        //Determinar documentos requeridos por rol
        const requeridos = this.obtenerDocumentosRequeridos(usuario.rol);

        //Buscar los archivos del usuario
        const archivos = await this.archivoRepo.find({
            where: { verificacion: { idVerificacion: verificacion.idVerificacion } },
        });

        // Filtrar según los tipos requeridos
        const archivosRelevantes = archivos.filter(a =>
            requeridos.includes(a.tipoDocumento),
        );

        //Contar aprobados y rechazados
        const aprobados = archivosRelevantes.filter(a => a.estado === EstadoArchivo.APROBADO);
        const rechazados = archivosRelevantes.filter(a => a.estado === EstadoArchivo.RECHAZADO);

        //Evaluar estado general de la verificación
        if (aprobados.length === requeridos.length) {
            //Todos aprobados → verificado
            verificacion.estado = EstadoVerificacion.VERIFICADO;
            usuario.verificado = true;
        } else if (rechazados.length === requeridos.length) {
            //Todos rechazados → rechazado
            verificacion.estado = EstadoVerificacion.RECHAZADO;
            usuario.verificado = false;
        } else {
            verificacion.estado = EstadoVerificacion.PENDIENTE;
            usuario.verificado = false;
        }

        //Actualizar datos de revisión
        verificacion.fechaRevision = new Date();
        verificacion.admin = admin;

        //Guardar cambios
        await this.usuarioRepository.save(usuario);
        return await this.verificacionRepo.save(verificacion);
    }

    private obtenerDocumentosRequeridos(rol: RolUsuario): TipoDocumento[] {
        switch (rol) {
            case RolUsuario.VOLUNTARIO:
                return [TipoDocumento.CEDULA];
            case RolUsuario.CREADOR:
                return [TipoDocumento.CEDULA, TipoDocumento.RUT];
            default:
                return [];
        }
    }

}
