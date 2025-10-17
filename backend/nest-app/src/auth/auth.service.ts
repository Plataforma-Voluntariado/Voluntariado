import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from 'src/usuario/usuario.service';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Creador } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { InicioSesionDto } from './dto/inicio-sesion.dto';
import { TokenService } from 'src/token/token.service';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TipoToken } from 'src/token/entity/token.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EXPIRES_TEMPORAL_IN, FRONTEND_URL, JWT_RECOVERY_SECRET } from 'src/config/constants';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        private readonly usuarioService: UsuarioService,
        private readonly jwtService: JwtService,
        private readonly tokenService: TokenService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService
    ) { }

    async validateUser(InicioSesionDto: InicioSesionDto): Promise<any> {
        const { correo, contrasena } = InicioSesionDto

        //verificar si el correo existe
        const usuario = await this.usuarioService.findUserByEmail(correo);
        if (!usuario) throw new UnauthorizedException('Correo inexistente');

        //comparar contrasenas
        const isPasswordMatching = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isPasswordMatching) throw new UnauthorizedException('Credenciales inválidas');

        return usuario;
    }

    async login(usuario: Usuario) {
        // Obtener información adicional según rol
        let roleData: Creador | Voluntario | Administrador | null | undefined = null;


        switch (usuario.rol) {
            case RolUsuario.CREADOR:
                roleData = usuario.creador;
                break;
            case RolUsuario.VOLUNTARIO:
                roleData = usuario.voluntario;
                break;
            case RolUsuario.ADMIN:
                roleData = usuario.admin;
                break;
        }


        // Payload que se mandara en la cookie
        const payload: any = {
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            rol: usuario.rol,
            verificado: usuario.verificado,
            url_imagen: usuario.url_imagen,
            ciudad: usuario.ciudad,
            roleData,
        };

        // Solo agregar nombre y apellido si el rol NO es CREADOR
        if (usuario.rol !== RolUsuario.CREADOR) {
            payload.nombre = usuario.nombre;
            payload.apellido = usuario.apellido;
        }

        return {
            access_token: this.jwtService.sign(payload),
            user: payload,
        };
    }

    // Generar y enviar token de recuperación
    async solicitarRecuperacion(dto: ForgotPasswordDto) {
        const usuario = await this.usuarioService.findUserByEmail(dto.correo);
        if (!usuario) throw new NotFoundException('No existe un usuario con ese correo.');

        // Generar token corto de verificación
        const token = await this.tokenService.generarToken(usuario, TipoToken.RECUPERAR_CONTRASENA);

        // Crear JWT temporal para identificar al usuario
        const jwtTemporal = this.jwtService.sign(
            { sub: usuario.id_usuario },
            {
                secret: this.configService.get<string>(JWT_RECOVERY_SECRET),
                expiresIn: this.configService.get<string>(EXPIRES_TEMPORAL_IN) || '5m',
            },
        );

        // Construir URL del frontend con el JWT como parámetro
        const frontendUrl = this.configService.get<string>(FRONTEND_URL) || 'https://miapp.com';
        const recoveryUrl = `${frontendUrl}/reset-password?token=${jwtTemporal}`;

        // Enviar correo con el enlace y el código
        try {
            await this.mailService.sendTemplateMail(
                usuario.correo,
                'Recuperación de contraseña',
                'reset-password', // nombre de la plantilla de correo
                {
                    nombre: usuario.nombre,
                    codigo: token.token,
                    enlace: recoveryUrl,
                },
            );
        } catch (error) {
            console.error('Error al enviar correo:', error.message);
            throw new InternalServerErrorException('Error al enviar el correo de recuperación');
        }

        return {
            message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
            // 🔧 El bloque debug se puede eliminar en producción
            debug: {
                jwtTemporal,
                codigo: token.token,
                recoveryUrl,
            },
        };
    }


    async restablecerContrasena(dto: ResetPasswordDto, userId: number) {
        const { token, nuevaContrasena } = dto;

        //Validar token corto
        const tokenValido = await this.tokenService.validarToken(
            token,
            TipoToken.RECUPERAR_CONTRASENA,
            userId,
        );
        const usuario = tokenValido.usuario;

        //Verificar que la nueva contraseña no sea igual a la actual
        const esIgual = await bcrypt.compare(nuevaContrasena, usuario.contrasena);
        if (esIgual) {
            throw new BadRequestException('La nueva contraseña no puede ser igual a la anterior.');
        }

        //Actualizar contraseña
        usuario.contrasena = await this.usuarioService.hashedPassword(nuevaContrasena);
        await this.usuarioRepository.save(usuario);

        //Marcar token como usado
        await this.tokenService.marcarComoUsado(tokenValido);

        return { message: 'Contraseña restablecida correctamente.' };
    }

}
