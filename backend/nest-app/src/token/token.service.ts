import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token, TipoToken, EstadoToken } from './entity/token.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EXPIRES_CODE } from 'src/config/constants';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
        private readonly configService: ConfigService
    ) { }

    async generarToken(usuario: Usuario, tipo: TipoToken): Promise<Token> {
        try {
            // Expirar tokens previos activos del mismo tipo
            await this.tokenRepository.update(
                { usuario: { id_usuario: usuario.id_usuario }, tipo, estado: EstadoToken.ACTIVO },
                { estado: EstadoToken.EXPIRADO }
            );

            const tokenValue = randomBytes(3).toString('hex').toUpperCase();
            const tokenExpires = this.configService.get<number>(EXPIRES_CODE) ?? 10;

            // Crear fecha actual
            const fechaCreacion = new Date();

            // Sumar milisegundos directamente 
            const fechaExpiracion = new Date(fechaCreacion.getTime() + tokenExpires * 60 * 1000);

            const token = this.tokenRepository.create({
                usuario,
                token: tokenValue,
                tipo,
                estado: EstadoToken.ACTIVO,
                fechaExpiracion,
            });

            return await this.tokenRepository.save(token);
        } catch (error) {
            console.error('Error al generar token:', error);
            throw new InternalServerErrorException('Error al generar el token, inténtalo nuevamente.');
        }
    }

    async validarToken(tokenIngresado: string, tipo: TipoToken, userId: number): Promise<Token> {
        // Buscar el token activo del usuario para ese tipo
        const tokenEntity = await this.tokenRepository.findOne({
            where: { usuario: { id_usuario: userId }, tipo, estado: EstadoToken.ACTIVO },
            relations: ['usuario'],
        });

        if (!tokenEntity) {
            throw new NotFoundException('No existe un código activo para este usuario.');
        }

        // Verificar si el token expiró
        if (new Date() > tokenEntity.fechaExpiracion) {
            tokenEntity.estado = EstadoToken.EXPIRADO;
            await this.tokenRepository.save(tokenEntity);
            throw new BadRequestException('El código ha expirado.');
        }

        // Comparar el token ingresado con el token real
        if (tokenEntity.token !== tokenIngresado) {
            tokenEntity.intentosRestantes -= 1;

            // Si se acabaron los intentos, marcarlo como expirado
            if (tokenEntity.intentosRestantes <= 0) {
                tokenEntity.estado = EstadoToken.EXPIRADO;
            }

            await this.tokenRepository.save(tokenEntity);

            throw new BadRequestException(
                tokenEntity.estado === EstadoToken.EXPIRADO
                    ? 'Has agotado los intentos, el código ha sido bloqueado.'
                    : `Código incorrecto. Te quedan ${tokenEntity.intentosRestantes} intentos.`,
            );
        }

        // Si el token es válido
        return tokenEntity;
    }

    async marcarComoUsado(token: Token): Promise<void> {
        try {
            token.estado = EstadoToken.USADO;
            await this.tokenRepository.save(token);
        } catch (error) {
            console.error('Error al marcar token como usado:', error);
            throw new InternalServerErrorException('Error al actualizar el token, inténtalo nuevamente.');
        }
    }
}
