import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Voluntariado } from './entity/voluntariado.entity';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario, RolUsuario } from '../usuario/entity/usuario.entity';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';
import { FotosVoluntariadoService } from '../fotos_voluntariado/fotos_voluntariado.service';
import { UbicacionService } from 'src/ubicacion/ubicacion.service';
import { Ubicacion } from 'src/ubicacion/entity/ubicacion.entity';
import { FotosVoluntariado } from 'src/fotos_voluntariado/entity/fotos_voluntariado.entity';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';

@Injectable()
export class VoluntariadoService {
  private readonly logger = new Logger(VoluntariadoService.name);
  private readonly commonRelations = ['categoria', 'creador', 'fotos', 'ubicacion', 'ubicacion.ciudad'] as const;

  constructor(
    @InjectRepository(Voluntariado) private readonly voluntariadoRepo: Repository<Voluntariado>,
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
    private readonly fotosVoluntariadoService: FotosVoluntariadoService,
    private readonly ubicacionService: UbicacionService,
    private readonly dataSource: DataSource,
  ) { }

  // ====================== CREATE ======================
  async create(dto: CreateVoluntariadoDto, creadorId: number, files?: Express.Multer.File[]) {
    return this.executeTransaction(async (qr) => {
      const [categoria, creador] = await Promise.all([
        this.findCategoria(dto.categoria_id, qr),
        this.findUsuario(creadorId, qr),
      ]);

      if (!creador.verificado)
        throw new BadRequestException('Tu cuenta debe estar verificada para crear voluntariados.');

      const voluntariado = await qr.manager.save(Voluntariado, {
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        fechaHora: dto.fechaHora,
        horas: dto.horas,
        maxParticipantes: dto.maxParticipantes,
        estado: dto.estado,
        categoria,
        creador,
      });

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
    return this.voluntariadoRepo.find({
      where: { creador: { id_usuario: idUsuario } },
      relations: this.commonRelations as any,
      order: { id_voluntariado: 'DESC' },
    });
  }

  async findOne(id: number, user: Usuario) {
    const voluntariado = await this.findVoluntariadoById(id);
    this.validarPermiso(voluntariado, user, 'ver');
    return voluntariado;
  }

  // ====================== UPDATE ======================
  async update(id: number, dto: UpdateVoluntariadoDto, user: Usuario, nuevasFotos?: Express.Multer.File[],) {
    return this.executeTransaction(async (qr) => {
      if (!user.verificado)
        throw new BadRequestException('Tu cuenta debe estar verificada para editar voluntariados.');

      const voluntariado = await this.findVoluntariadoById(id, qr);
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

      // Campos
      Object.assign(voluntariado, {
        titulo: dto.titulo?.trim() ?? voluntariado.titulo,
        descripcion: dto.descripcion?.trim() ?? voluntariado.descripcion,
        fechaHora: dto.fechaHora ?? voluntariado.fechaHora,
        horas: dto.horas ?? voluntariado.horas,
        maxParticipantes: dto.maxParticipantes ?? voluntariado.maxParticipantes,
        estado: dto.estado ?? voluntariado.estado,
      });

      // Reload fotos real desde DB
      voluntariado.fotos = await qr.manager.find(FotosVoluntariado, {
        where: { voluntariado: { id_voluntariado: voluntariado.id_voluntariado } },
      });

      const actualizado = await qr.manager.save(Voluntariado, voluntariado);

      return {
        message: 'Voluntariado actualizado correctamente.',
        voluntariado: actualizado,
      };
    });
  }

  // ====================== DELETE ======================
  async remove(id: number, user: Usuario) {
    const voluntariado = await this.findVoluntariadoById(id);

    if (user.rol === RolUsuario.CREADOR && voluntariado.creador.id_usuario !== user.id_usuario)
      throw new ForbiddenException('No tiene permiso para eliminar este voluntariado.');

    await this.fotosVoluntariadoService.deleteFotosCloudinary(voluntariado.fotos);
    await this.voluntariadoRepo.remove(voluntariado);

    return { message: `Voluntariado "${voluntariado.titulo}" eliminado.` };
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
      throw new ForbiddenException(`No tiene permiso para ${accion} este voluntariado.`);
  }

  private async findVoluntariadoById(id: number, qr?: any) {
    const repo = qr ? qr.manager.getRepository(Voluntariado) : this.voluntariadoRepo;
    const v = await repo.findOne({ where: { id_voluntariado: id }, relations: this.commonRelations as any });
    if (!v) throw new NotFoundException('Voluntariado no encontrado.');
    return v;
  }
}
