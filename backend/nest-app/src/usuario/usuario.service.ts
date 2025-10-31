import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, RolUsuario, EstadoUsuario } from './entity/usuario.entity';
import { Creador } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';
import { verificarDominioCorreo } from 'src/utils/email.utils';
import { TokenService } from 'src/token/token.service';
import { TipoToken } from 'src/token/entity/token.entity';
import { MailService } from 'src/mail/mail.service';
import { VerificacionCorreoDto } from './dto/validar-codigo-verificacion.dto';
import { solicitudVerificacionCorreoDto } from './dto/solicitud-verificacion-correo.dto';
import { UsersGateway } from './usuario.gateway';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';
import { TipoNotificacion } from 'src/notificaciones/entity/notificacion.entity';

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
    private tokenService: TokenService,
    private mailService: MailService,
    private readonly userGateway: UsersGateway,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificacionesService: NotificacionesService
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<void> {
    let avatarUrl: string | undefined = undefined;
    const { correo, contrasena, rol, tipo_entidad, nombre_entidad, ...rest } = createUsuarioDto;

    // Verificar que el dominio del correo tenga registros MX válidos
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

    // Generar avatar automático
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

  // Generar y enviar token de verificacion de correo
  async solicitarVerificacionCorreo(dto: solicitudVerificacionCorreoDto) {

    const usuario = await this.findUserByEmail(dto.correo);
    if (!usuario) throw new NotFoundException('No existe un usuario con ese correo.');

    // Generar token corto de verificación
    const token = await this.tokenService.generarToken(usuario, TipoToken.CONFIRMAR_CORREO);

    // Enviar correo con el código
    try {
      await this.mailService.sendTemplateMail(
        usuario.correo,
        'Verificacion de Correo',
        'confirm-email',
        {
          nombre: usuario.nombre,
          codigo: token.token,
        },
      );
    } catch (error) {
      console.error('Error al enviar correo:', error.message);
      throw new InternalServerErrorException('Error al enviar el correo de verificacion');
    }

    return {
      message: 'Se ha enviado un correo con las instrucciones para verificar tu correo!.'
    };
  }

  // Validación de código de verificación de correo
  async validarCodigoVerificacionCorreo(dto: VerificacionCorreoDto, userId: number) {
    const { token } = dto;

    // Validar token del tipo CONFIRMAR_CORREO
    const tokenValido = await this.tokenService.validarToken(
      token,
      TipoToken.CONFIRMAR_CORREO,
      userId,
    );

    const usuario = tokenValido.usuario;

    // Marcar el correo como verificado
    usuario.correo_verificado = true;
    await this.usuarioRepository.save(usuario);

    // Marcar el token como usado
    await this.tokenService.marcarComoUsado(tokenValido);
    //emito novedad al frontend
    this.userGateway.userNovedad(usuario)

    return { message: 'Correo verificado correctamente.' };
  }

  async actualizarImagenPerfil(userId: number, file: Express.Multer.File) {
    const usuario = await this.usuarioRepository.findOne({ where: { id_usuario: userId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    if (!file) {
      throw new BadRequestException('Debe proporcionar una imagen válida.');
    }

    // Si ya tenía una imagen personalizada y pertenece a Cloudinary, eliminarla
    if (usuario.url_imagen && usuario.url_imagen.includes('res.cloudinary.com')) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(usuario.url_imagen);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId).catch(() => { });
      }
    }

    // Subir nueva imagen
    const uploadResult = await this.cloudinaryService.uploadImage(file, 'fotos-perfil');

    usuario.url_imagen = uploadResult.secure_url;
    await this.usuarioRepository.save(usuario);

    // Emitir novedad en tiempo real
    this.userGateway.userNovedad(usuario);

    //emitir notificacion
    await this.notificacionesService.crearYEnviarNotificacion([usuario.id_usuario], {
      tipo: TipoNotificacion.INFO,
      titulo: 'Imagen de perfil actualizada',
      mensaje: 'Tu imagen de perfil ha sido actualizada correctamente.',
      url_redireccion: '/profile',
    });

    return {
      message: 'Imagen de perfil actualizada correctamente.',
      url: uploadResult.secure_url,
    };
  }

  async eliminarImagenPerfil(userId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: userId },
      relations: ['creador'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!usuario.url_imagen) {
      throw new BadRequestException('El usuario no tiene una imagen para eliminar.');
    }

    // Si la imagen actual está en Cloudinary, eliminarla
    if (usuario.url_imagen.includes('res.cloudinary.com')) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(usuario.url_imagen);
      if (publicId) {
        try {
          await this.cloudinaryService.deleteImage(publicId);
        } catch (error) {
          console.error('Error al eliminar la imagen de Cloudinary:', error.message);
          throw new BadRequestException('No se pudo eliminar la imagen de Cloudinary.');
        }
      }
    }

    // Generar avatar automático igual que al crear usuario
    let nameForAvatar = usuario.rol === RolUsuario.CREADOR ? usuario.creador?.nombre_entidad : `${usuario.nombre} ${usuario.apellido}`;
    let avatarUrl: string | undefined = undefined;

    if (nameForAvatar) {
      try {
        avatarUrl = await this.generateAvatar(nameForAvatar);
      } catch (error) {
        console.error('Error generando avatar:', error);
        throw new BadRequestException('No se pudo generar el avatar automático.');
      }
    }

    // Actualizar imagen de perfil
    usuario.url_imagen = avatarUrl;
    await this.usuarioRepository.save(usuario);

    // Emitir novedad a los clientes conectados
    this.userGateway.userNovedad(usuario);

    await this.notificacionesService.crearYEnviarNotificacion([usuario.id_usuario], {
      tipo: TipoNotificacion.INFO,
      titulo: 'Imagen de perfil eliminada',
      mensaje: 'Tu imagen de perfil ha sido eliminada correctamente y se generó un avatar automático.',
      url_redireccion: '/profile'
    });

    return {
      message: 'Imagen de perfil eliminada correctamente.',
      nuevaImagen: avatarUrl,
    };
  }

}
