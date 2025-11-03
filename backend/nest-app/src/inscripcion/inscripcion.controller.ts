import { Controller, Post, Put, Param, Req, UseGuards, BadRequestException, Get, Body } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';

@Controller('inscripciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InscripcionController {
    constructor(private readonly inscripcionService: InscripcionService) { }

    @Roles(RolUsuario.VOLUNTARIO)
    @Post(':voluntariadoId')
    inscribirse(@Param('voluntariadoId') voluntariadoId: string, @Req() req: any) {
        return this.inscripcionService.inscribirse(req.user.id_usuario, +voluntariadoId);
    }

    @Roles(RolUsuario.CREADOR)
    @Put('aceptar/:id')
    aceptarInscripcion(@Param('id') id: string, @Req() req: any) {
        return this.inscripcionService.aceptarInscripcion(req.user, +id);
    }

    @Roles(RolUsuario.CREADOR)
    @Put('rechazar/:id')
    rechazarInscripcion(@Param('id') id: string, @Req() req: any) {
        return this.inscripcionService.rechazarInscripcion(req.user, +id);
    }

    @Roles(RolUsuario.VOLUNTARIO)
    @Put('cancelar/:id')
    cancelar(@Param('id') id: string, @Req() req: any) {
        return this.inscripcionService.cancelar(req.user, +id);
    }

    @Roles(RolUsuario.VOLUNTARIO)
    @Get('mis-inscripciones')
    misInscripciones(@Req() req: any) {
        return this.inscripcionService.misInscripciones(req.user.id_usuario);
    }

    @Roles(RolUsuario.CREADOR)
    @Get('voluntariado/:id')
    inscripcionesDeVoluntariado(@Param('id') id: string, @Req() req: any) {
        return this.inscripcionService.inscripcionesDeVoluntariado(req.user, +id);
    }

    @Roles(RolUsuario.CREADOR)
    @Put('asistencia/:id')
    marcarAsistencia(@Param('id') id: string,@Body() dto: MarcarAsistenciaDto,@Req() req: any,) {
        return this.inscripcionService.marcarAsistencia(req.user, +id, dto.asistencia);
    }


}
