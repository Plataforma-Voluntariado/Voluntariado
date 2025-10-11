import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, RolUsuario, EstadoUsuario } from './entity/usuario.entity';
import { Creador, TipoEntidad } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { verificarDominioCorreo } from 'src/utils/email.utils';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Creador)
    private creadorRepository: Repository<Creador>,

    @InjectRepository(Voluntario)
    private voluntarioRepository: Repository<Voluntario>,

    @InjectRepository(Administrador)
    private adminRepository: Repository<Administrador>,

    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<void> {
    let avatarUrl: string | undefined = undefined;
    const { correo, contrasena, rol, tipo_entidad, nombre_entidad, ...rest } = createUsuarioDto;

    // 🔹 Verificar que el dominio del correo tenga registros MX válidos
    const dominioValido = await verificarDominioCorreo(createUsuarioDto.correo);
    if (!dominioValido) {
      throw new BadRequestException('El dominio del correo no es válido o no puede recibir correos.');
    }

    // Validar correo único
    if (await this.usuarioRepository.findOne({ where: { correo } })) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Validaciones previas a crear usuario base
    if (rol === RolUsuario.CREADOR) {
      if (!tipo_entidad || !nombre_entidad) {
        throw new BadRequestException('Para creadores, tipo_entidad y nombre_entidad son obligatorios');
      }

      const existEntidad = await this.creadorRepository.findOne({ where: { nombre_entidad } });
      if (existEntidad) {
        throw new BadRequestException('El nombre de la entidad ya se encuentra registrado');
      }
    }


    // Hashear la contraseña
    const hashedPassword = await this.hashedPassword(contrasena);

    // Generar avatar automático y subir a Cloudinary
    let nameForAvatar = rol === RolUsuario.CREADOR ? nombre_entidad : `${createUsuarioDto.nombre} ${createUsuarioDto.apellido}`;


    if (nameForAvatar) {
      try {
        avatarUrl = await this.generateAvatar(nameForAvatar);
      } catch (error) {
        console.error('Error generando avatar:', error);
        throw new BadRequestException('No se pudo generar el avatar automático');
      }
    }

    // Crear usuario base
    const usuario = this.usuarioRepository.create({
      ...rest,
      correo,
      contrasena: hashedPassword,
      rol,
      estado: EstadoUsuario.ACTIVO,
      verificado: false,
      ciudad: { id_ciudad: createUsuarioDto.id_ciudad } as Partial<Ciudad>,
      url_imagen: avatarUrl
    });

    await this.usuarioRepository.save(usuario);

    // Delegar creación de la tabla hija según el rol
    switch (rol) {
      case RolUsuario.CREADOR:
        await this.createCreador(usuario, createUsuarioDto);
        break;

      case RolUsuario.VOLUNTARIO:
        await this.createVoluntario(usuario);
        break;

      case RolUsuario.ADMIN:
        await this.createAdmin(usuario);
        break;

      default:
        throw new BadRequestException(`El rol ${rol} no existe o no es válido`);
    }
  }

  // Generar avatar con iniciales
  private async generateAvatar(name: string): Promise<string> {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('');

    const avatarApiUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&size=256`;
    return avatarApiUrl;
  }

  private async createCreador(usuario: Usuario, dto: CreateUsuarioDto) {
    const { tipo_entidad, nombre_entidad, direccion, descripcion, sitio_web } = dto;

    const creador = this.creadorRepository.create({
      id_usuario: usuario.id_usuario,
      tipo_entidad,
      nombre_entidad,
      direccion,
      descripcion,
      sitio_web,
    });
    await this.creadorRepository.save(creador);
  }

  private async createVoluntario(usuario: Usuario) {
    const voluntario = this.voluntarioRepository.create({
      id_usuario: usuario.id_usuario,
    });
    await this.voluntarioRepository.save(voluntario);
  }

  private async createAdmin(usuario: Usuario) {
    const admin = this.adminRepository.create({
      id_usuario: usuario.id_usuario,
    });
    await this.adminRepository.save(admin);
  }

  async findUserByEmail(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correo },
      relations: ['ciudad', 'creador', 'voluntario', 'admin', 'ciudad.departamento'],
    });
  }

  async hashedPassword(contrasena: string): Promise<string> {
    return bcrypt.hash(contrasena, 10);
  }

}
