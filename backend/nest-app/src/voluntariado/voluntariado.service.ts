import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { EstadoVoluntariado, Voluntariado } from './entity/voluntariado.entity';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario, RolUsuario } from '../usuario/entity/usuario.entity';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';
import { FotosVoluntariadoService } from '../fotos_voluntariado/fotos_voluntariado.service';
import { UbicacionService } from 'src/ubicacion/ubicacion.service';
import { Ubicacion } from 'src/ubicacion/entity/ubicacion.entity';
import { FotosVoluntariado } from 'src/fotos_voluntariado/entity/fotos_voluntariado.entity';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';
import { VoluntariadoSchedulerService } from './VoluntariadoSchedulerService';
import { InscripcionService } from 'src/inscripcion/inscripcion.service';

@Injectable()
export class VoluntariadoService {
  private readonly logger = new Logger(VoluntariadoService.name);
  private readonly commonRelations = ['categoria', 'creador', 'fotos', 'ubicacion', 'ubicacion.ciudad', 'creador.creador', 'inscripciones'] as const;
  constructor(
    @InjectRepository(Voluntariado) private readonly voluntariadoRepo: Repository<Voluntariado>,
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
    private readonly fotosVoluntariadoService: FotosVoluntariadoService,
    private readonly ubicacionService: UbicacionService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => VoluntariadoSchedulerService))
    private readonly voluntariadoSchedulerService: VoluntariadoSchedulerService,
    private readonly inscripcionService: InscripcionService
  ) { }

  // ====================== CREATE ======================
  async create(dto: CreateVoluntariadoDto, creadorId: number, files?: Express.Multer.File[]) {
    return this.executeTransaction(async (qr) => {
      const [categoria, creador] = await Promise.all([
        this.findCategoria(dto.categoria_id, qr),
        this.findUsuario(creadorId, qr),
      ]);

      if (!creador.verificado) throw new BadRequestException('Tu cuenta debe estar verificada para crear voluntariados.');

      const fechaFin = new Date(dto.fechaHoraInicio);
      fechaFin.setHours(fechaFin.getHours() + dto.horas);

      const voluntariado = await qr.manager.save(Voluntariado, {
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        fechaHoraInicio: dto.fechaHoraInicio,
        fechaHoraFin: fechaFin,
        horas: dto.horas,
        maxParticipantes: dto.maxParticipantes,
        categoria,
        creador,
      });

      await this.voluntariadoSchedulerService.scheduleVoluntariado(
        voluntariado.id_voluntariado,
        voluntariado.fechaHoraInicio,
        voluntariado.fechaHoraFin,
      );


      const voluntariadoDb = await qr.manager.findOne(Voluntariado, {
        where: { id_voluntariado: voluntariado.id_voluntariado },
        relations: ['ubicacion'],
      });

      if (!voluntariadoDb) throw new BadRequestException('Error al cargar voluntariado en la transacción');

      if (dto.ubicacion) await this.ubicacionService.create(dto.ubicacion, voluntariadoDb, qr);
      if (files?.length) await this.fotosVoluntariadoService.uploadFotos(files, voluntariadoDb, qr);

      const completo = await this.findVoluntariadoById(voluntariado.id_voluntariado, qr);

      return {
        message: 'Voluntariado creado exitosamente.',
        voluntariado: completo,
      };
    });
  }

  // ====================== LIST ======================
  async findAll() {
    return this.voluntariadoRepo.find({
      relations: this.commonRelations as any,
      order: { id_voluntariado: 'DESC' },
    });
  }

  async findAllByCreator(idUsuario: number) {
    const voluntariados = await this.voluntariadoRepo.find({
      where: { creador: { id_usuario: idUsuario } },
      relations: this.commonRelations as any,
      order: { id_voluntariado: 'DESC' },
    });

    // Clasificar por estado
    const agrupados = {
      pendientes: voluntariados.filter(v => v.estado === 'pendiente'),
      en_proceso: voluntariados.filter(v => v.estado === 'en_proceso'),
      terminados: voluntariados.filter(v => v.estado === 'terminado'),
      cancelados: voluntariados.filter(v => v.estado === 'cancelado'),
    };

    return agrupados;
  }


  async findOne(id: number, user: Usuario) {
    const voluntariado = await this.findVoluntariadoById(id);
    this.validarPermiso(voluntariado, user, 'ver');
    return voluntariado;
  }

  // ====================== UPDATE ======================
  async update(id: number, dto: UpdateVoluntariadoDto, creadorId: number, nuevasFotos?: Express.Multer.File[],) {
    return this.executeTransaction(async (qr) => {
      const [user, voluntariado] = await Promise.all([
        this.findUsuario(creadorId, qr),
        this.findVoluntariadoById(id, qr),
      ]);

      if (!user.verificado) {
        throw new BadRequestException('Tu cuenta debe estar verificada para editar voluntariados.');
      }

      this.validarPermiso(voluntariado, user, 'actualizar');

      // Categoria
      if (dto.categoria_id) {
        voluntariado.categoria = await this.findCategoria(dto.categoria_id, qr);
      }

      // Ubicación
      if (dto.ubicacion) {
        if (voluntariado.ubicacion) {
          voluntariado.ubicacion.latitud = dto.ubicacion.latitud ?? voluntariado.ubicacion.latitud;
          voluntariado.ubicacion.longitud = dto.ubicacion.longitud ?? voluntariado.ubicacion.longitud;
          voluntariado.ubicacion.direccion = dto.ubicacion.direccion?.trim() ?? voluntariado.ubicacion.direccion;
          voluntariado.ubicacion.nombre_sector = dto.ubicacion.nombre_sector?.trim() ?? voluntariado.ubicacion.nombre_sector;

          if (dto.ubicacion.ciudad_id) {
            voluntariado.ubicacion.ciudad = { id_ciudad: Number(dto.ubicacion.ciudad_id) } as Ciudad;
          }

          await qr.manager.save(Ubicacion, voluntariado.ubicacion);
        } else {
          await this.ubicacionService.create(dto.ubicacion, voluntariado, qr);
        }
      }

      // Fotos
      const fotosActuales = voluntariado.fotos ?? [];
      const idsMantener = (dto.fotosMantener ?? []).map(Number).filter(v => !isNaN(v));
      const fotosAEliminar = fotosActuales.filter(f => !idsMantener.includes(Number(f.id_foto)));

      if (fotosAEliminar.length > 0) {
        await this.fotosVoluntariadoService.deleteFotosCloudinary(fotosAEliminar);
        await qr.manager.delete(FotosVoluntariado, {
          id_foto: In(fotosAEliminar.map(f => Number(f.id_foto))),
        });
      }

      if (nuevasFotos?.length) {
        await this.fotosVoluntariadoService.uploadFotos(
          nuevasFotos,
          { id_voluntariado: voluntariado.id_voluntariado } as Voluntariado,
          qr
        );
      }

      // calclo fechafin
      const nuevaFechaInicio = dto.fechaHoraInicio ?? voluntariado.fechaHoraInicio;
      const nuevasHoras = dto.horas ?? voluntariado.horas;

      const nuevaFechaFin = new Date(nuevaFechaInicio);
      nuevaFechaFin.setHours(nuevaFechaFin.getHours() + nuevasHoras);

      Object.assign(voluntariado, {
        titulo: dto.titulo?.trim() ?? voluntariado.titulo,
        descripcion: dto.descripcion?.trim() ?? voluntariado.descripcion,
        fechaHoraInicio: nuevaFechaInicio,
        horas: nuevasHoras,
        fechaHoraFin: nuevaFechaFin,
        maxParticipantes: dto.maxParticipantes ?? voluntariado.maxParticipantes,
        estado: dto.estado ?? voluntariado.estado,
      });

      // Reload fotos desde DB
      voluntariado.fotos = await qr.manager.find(FotosVoluntariado, {
        where: { voluntariado: { id_voluntariado: voluntariado.id_voluntariado } },
      });

      const actualizado = await qr.manager.save(Voluntariado, voluntariado);

      await this.voluntariadoSchedulerService.scheduleVoluntariado(
        actualizado.id_voluntariado,
        actualizado.fechaHoraInicio,
        actualizado.fechaHoraFin,
      );

      return {
        message: 'Voluntariado actualizado correctamente.',
        voluntariado: actualizado,
      };
    });
  }

  // ====================== DELETE ======================
  async remove(id: number, user: Usuario) {
    const voluntariado = await this.findVoluntariadoById(id);

    if (user.rol === RolUsuario.CREADOR && voluntariado.creador.id_usuario !== user.id_usuario) {
      throw new ForbiddenException('No tiene permiso para cancelar este voluntariado.');
    }

    // Soft delete: solo cambiar el estado
    voluntariado.estado = EstadoVoluntariado.CANCELADO;
    await this.voluntariadoRepo.save(voluntariado);

    // No borrar fotos de Cloudinary
    return { message: `Voluntariado "${voluntariado.titulo}" cancelado correctamente.` };
  }


  // ====================== HELPERS ======================
  private async executeTransaction<T>(operation: (qr: any) => Promise<T>): Promise<T> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const result = await operation(qr);
      await qr.commitTransaction();
      return result;
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    } finally {
      await qr.release();
    }
  }

  private async findCategoria(id: number, qr?: any) {
    const repo = qr ? qr.manager.getRepository(Categoria) : this.categoriaRepo;
    const categoria = await repo.findOne({ where: { id_categoria: id } });
    if (!categoria) throw new NotFoundException('La categoría no existe.');
    return categoria;
  }

  private async findUsuario(id: number, qr?: any) {
    const repo = qr ? qr.manager.getRepository(Usuario) : this.voluntariadoRepo.manager.getRepository(Usuario);
    const usuario = await repo.findOne({ where: { id_usuario: id } });
    if (!usuario) throw new NotFoundException('El usuario no existe.');
    return usuario;
  }

  private validarPermiso(v: Voluntariado, user: Usuario, accion: string) {
    if (user.rol === RolUsuario.CREADOR && v.creador.id_usuario !== user.id_usuario)
      throw new ForbiddenException('No tiene permiso para ${accion} este voluntariado.');
  }

  private async findVoluntariadoById(id: number, qr?: any) {
    const repo = qr ? qr.manager.getRepository(Voluntariado) : this.voluntariadoRepo;
    const v = await repo.findOne({ where: { id_voluntariado: id }, relations: this.commonRelations as any });
    if (!v) throw new NotFoundException('Voluntariado no encontrado.');
    return v;
  }

  async updateEstado(id: number, estado: EstadoVoluntariado) {
    const voluntariado = await this.findVoluntariadoById(id);
    voluntariado.estado = estado;

    if (estado === EstadoVoluntariado.EN_PROCESO) {
      await this.inscripcionService.rechazarPendientesPorVoluntariado(id);
    }

    return this.voluntariadoRepo.save(voluntariado);
  }


}