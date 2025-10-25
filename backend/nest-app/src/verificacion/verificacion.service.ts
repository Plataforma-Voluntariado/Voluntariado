import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verificacion, EstadoVerificacion } from './entity/verificacion.entity';
import { VerificacionArchivo, EstadoArchivo, TipoDocumento } from './verificacion_archivo/entity/verificacion-archivo.entity';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { Creador } from '../creador/entity/creador.entity'; // 👈 Importación añadida

@Injectable()
export class VerificacionService {
    constructor(
        @InjectRepository(Verificacion)
        private readonly verificacionRepo: Repository<Verificacion>,
        @InjectRepository(VerificacionArchivo)
        private readonly archivoRepo: Repository<VerificacionArchivo>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        @InjectRepository(Creador)
        private readonly creadorRepo: Repository<Creador>, // 👈 Nuevo repositorio
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
    // 🟢 1️⃣ Obtener lista de verificaciones pendientes
    async obtenerVerificacionesPendientes() {
        const verificaciones = await this.verificacionRepo.find({
            where: { estado: EstadoVerificacion.PENDIENTE },
            relations: ['usuario'],
            select: {
                idVerificacion: true,
                usuario: {
                    id_usuario: true,
                    nombre: true,
                    apellido: true,
                },
            },
        });

        if (!verificaciones.length) {
            throw new NotFoundException('No hay verificaciones pendientes.');
        }

        // 🔄 Mapeo con verificación de si es creador
        const resultados = await Promise.all(
            verificaciones.map(async (v) => {
                const creador = await this.creadorRepo.findOne({
                    where: { id_usuario: v.usuario.id_usuario },
                    select: ['nombre_entidad'],
                });

                return {
                    idVerificacion: v.idVerificacion,
                    nombre:
                        creador?.nombre_entidad ??
                        `${v.usuario?.nombre ?? 'Sin nombre'} ${v.usuario?.apellido ?? ''}`.trim(),
                    rol: creador ? 'CREADOR' : 'VOLUNTARIO',
                };
            }),
        );

        return resultados

            ;
    }

    // 🟢 2️⃣ Obtener el último archivo por tipo de documento dentro de una verificación
    async obtenerArchivosPendientesPorVerificacion(idVerificacion: number) {
        // Traemos todos los archivos de esa verificación
        const archivos = await this.archivoRepo.find({
            where: {
                verificacion: { idVerificacion },
            },
            select: [
                'idVerificacionArchivo',
                'tipoDocumento',
                'estado',
                'rutaArchivo',
            ],
            order: {
                idVerificacionArchivo: 'DESC', // 🔹 Ordenamos de más reciente a más antiguo
            },
        });

        if (!archivos.length) {
            throw new NotFoundException('No hay archivos para esta verificación.');
        }

        // 🔹 Usamos un mapa para quedarnos solo con el último archivo de cada tipoDocumento
        const ultimosPorTipo = new Map<string, typeof archivos[0]>();

        for (const archivo of archivos) {
            if (!ultimosPorTipo.has(archivo.tipoDocumento)) {
                ultimosPorTipo.set(archivo.tipoDocumento, archivo);
            }
        }

        // 🔹 Devolvemos solo los más recientes por tipo
        return Array.from(ultimosPorTipo.values());
    }

}
