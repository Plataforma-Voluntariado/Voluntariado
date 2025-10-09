import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from 'src/usuario/usuario.service';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Creador } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { InicioSesionDto } from './dto/inicio-sesion.dto';

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
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
}
