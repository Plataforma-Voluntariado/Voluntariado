import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { VerificacionArchivo, EstadoArchivo, TipoDocumento, } from './entity/verificacion-archivo.entity';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Verificacion, EstadoVerificacion, } from 'src/verificacion/entity/verificacion.entity';
import { validarArchivoPDF } from './helpers/validar-archivo.util';
import { determinarTipoDocumento } from './helpers/determinar-tipo.util';
import { asegurarCarpetaUsuario } from './helpers/rutas.util';
import { validarSubidaArchivo } from './helpers/validar-subida.util';
import { desencriptarArchivo, encriptarArchivo } from './helpers/aes.util';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FASTAPI_URL } from 'src/config/constants';
import { VerificacionService } from '../verificacion.service';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { RechazarArchivoDto } from './dto/rechazar-archivo.dto';
import { VerificacionArchivoGateway } from './verificacion-archivo.gateway';
import { VerificacionArchivoAdminGateway } from './verificacion-archivo-admin.gateway';
import { TipoNotificacion } from 'src/notificaciones/entity/notificacion.entity';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';

@Injectable()
export class VerificacionArchivoService {
  private readonly basePath = path.resolve(
    process.cwd(),
    'uploads/Verificaciones',
  );

  constructor(
    @InjectRepository(VerificacionArchivo)
    private readonly archivoRepo: Repository<VerificacionArchivo>,
    @InjectRepository(Verificacion)
    private readonly verificacionRepo: Repository<Verificacion>,
    private readonly configService: ConfigService,
    private readonly verificacionService: VerificacionService,
    private readonly gateway: VerificacionArchivoGateway,
    private readonly gatewayadmin: VerificacionArchivoAdminGateway,
    private readonly notificacionesService: NotificacionesService
  ) { }

  private notificarCambioArchivo(userId: number, tipo: 'subido' | 'aprobado' | 'rechazado', archivo: VerificacionArchivo,) {
    this.gateway.notificarUsuario(userId, tipo, archivo,);
    this.gatewayadmin.notificarAdmins(tipo, {
      userId,
      archivo: {
        idArchivo: archivo.idVerificacionArchivo,
        tipoDocumento: archivo.tipoDocumento,
        estado: archivo.estado,
        fechaRevision: archivo.fechaRevision,
      },
    });
  }

  //Validación inicial del archivo y tipo esperado
  async validarArchivoInicial(usuario: Usuario, archivo: Express.Multer.File, tipo_Documento: string,): Promise<TipoDocumento> {
    validarArchivoPDF(archivo);
    return determinarTipoDocumento(usuario.rol, tipo_Documento);
  }

  //Subir archivo
  async subirArchivo(usuario: Usuario, archivo: Express.Multer.File, tipo_Documento: string,): Promise<{ archivo: VerificacionArchivo; verificacion: Verificacion }> {
    const tipoDocumentoEsperado = await this.validarArchivoInicial(
      usuario,
      archivo,
      tipo_Documento,
    );

    //Buscar o crear verificación temporal
    // Buscar o crear verificación
    let verificacion = await this.verificacionRepo.findOne({
      where: { usuario: { id_usuario: usuario.id_usuario } },
      relations: ['archivos'],
    });

    if (!verificacion) {
      // Si no existe, crearla nueva
      verificacion = this.verificacionRepo.create({
        usuario,
        estado: EstadoVerificacion.PENDIENTE,
        fechaCreacion: new Date(),
      });
    } else if (verificacion.estado === EstadoVerificacion.RECHAZADO) {
      // 🔹 Si estaba rechazada, la volvemos a dejar pendiente
      verificacion.estado = EstadoVerificacion.PENDIENTE;
      verificacion.fechaRevision = new Date();
      verificacion.observaciones = "";
      await this.verificacionRepo.save(verificacion);
    }

    //Validar duplicados, límites y permisos antes de llamar FastAPI
    await validarSubidaArchivo(
      this.archivoRepo,
      usuario,
      verificacion,
      tipoDocumentoEsperado,
    );

    //Enviar a FastAPI para detectar tipo de documento
    const resultadoFast = await this.enviarAFastAPI(archivo);
    const tipoDetectado = resultadoFast?.resultado_final?.tipo_documento;

    if (tipoDetectado?.toLowerCase() !== tipoDocumentoEsperado.toLowerCase()) {
      throw new BadRequestException(
        `El tipo de documento detectado no coincide con el documento esperado`,
      );
    }

    //Guardar verificación en BD solo si hay archivo válido
    if (!verificacion.idVerificacion) {
      verificacion = await this.verificacionRepo.save(verificacion);
    }

    //Procesar y guardar el archivo
    const archivoGuardado = await this.procesarArchivo(
      usuario,
      verificacion,
      archivo,
      tipoDocumentoEsperado,
    );

    // Notificar al usuario (archivo subido)
    this.notificarCambioArchivo(usuario.id_usuario, 'subido', archivoGuardado);

    return { archivo: archivoGuardado, verificacion };
  }

  //Procesamiento final del archivo (carpeta + encriptado + BD)
  private async procesarArchivo(usuario: Usuario,verificacion: Verificacion,archivo: Express.Multer.File,tipoDocumento: TipoDocumento,): Promise<VerificacionArchivo> {
    const userFolder = asegurarCarpetaUsuario(
      this.basePath,
      usuario.id_usuario,
    );

    const nombreFinal = `${tipoDocumento}-${Date.now()}.pdf`;
    const rutaFinal = path.join(userFolder, nombreFinal);

    const bufferEncriptado = encriptarArchivo(
      archivo.buffer,
      usuario.id_usuario,
    );
    fs.writeFileSync(rutaFinal, bufferEncriptado);

    const registro = this.archivoRepo.create({
      verificacion,
      tipoDocumento,
      rutaArchivo: rutaFinal,
      estado: EstadoArchivo.PENDIENTE,
    });

    return await this.archivoRepo.save(registro);
  }

  //Obtener archivo encriptado
  async obtenerArchivo(
    usuarioActual: Usuario,
    archivoId: number,
  ): Promise<Buffer> {
    const archivo = await this.archivoRepo.findOne({
      where: { idVerificacionArchivo: archivoId },
      relations: ['verificacion', 'verificacion.usuario'],
    });

    if (!archivo) throw new NotFoundException('Archivo no encontrado');

    const ownerId = archivo.verificacion.usuario.id_usuario;
    if (
      usuarioActual.id_usuario !== ownerId &&
      usuarioActual.rol !== RolUsuario.ADMIN
    ) {
      throw new ForbiddenException('No tienes permiso para ver este archivo');
    }

    const bufferEncriptado = fs.readFileSync(archivo.rutaArchivo);
    return desencriptarArchivo(bufferEncriptado, ownerId);
  }

  //Comunicación con FastAPI
  private async enviarAFastAPI(archivo: Express.Multer.File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', archivo.buffer, {
        filename: archivo.originalname,
        contentType: archivo.mimetype,
      });

      const fastApiUrl = this.configService.get<string>(FASTAPI_URL);
      if (!fastApiUrl) throw new Error(' No se encontró FASTAPI_URL en .env');

      // Construir endpoint correcto del verificador
      const baseUrl = (fastApiUrl || '').replace(/\/$/, '');
      const endpoint = baseUrl.includes('/analizar-pdf') ? baseUrl : `${baseUrl}/analizar-pdf`;
      const response = await axios.post(endpoint, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error) {
      console.error(
        'Error al comunicar con FastAPI:',
        error?.response?.data || error,
      );
      throw new BadRequestException(
        error?.response?.data?.detail ||
        'Error al analizar el documento con la IA (FastAPI).',
      );
    }
  }

  async aceptarArchivo(idArchivo: number,admin: Administrador,): Promise<VerificacionArchivo> {
    const archivo = await this.archivoRepo.findOne({
      where: { idVerificacionArchivo: idArchivo },
      relations: ['verificacion', 'verificacion.usuario'],
    });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Validar estados actuales
    switch (archivo.estado) {
      case EstadoArchivo.APROBADO:
        throw new BadRequestException('El archivo ya fue aprobado previamente');
      case EstadoArchivo.RECHAZADO:
        throw new BadRequestException(
          'El archivo fue rechazado y no puede aprobarse',
        );
    }

    // Actualizar estado y fecha
    archivo.estado = EstadoArchivo.APROBADO;
    archivo.fechaRevision = new Date();
    const archivoActualizado = await this.archivoRepo.save(archivo);

    // 🔔 Notificar al usuario (archivo aprobado)
    this.notificarCambioArchivo(archivo.verificacion.usuario.id_usuario, 'aprobado', archivoActualizado);


    // Recalcular el estado general de la verificación
    await this.verificacionService.validarVerificacionCompleta(
      archivo.verificacion.usuario,
      admin,
    );

    return archivoActualizado;
  }

  async rechazarArchivo(idArchivo: number,admin: Administrador,dto: RechazarArchivoDto,): Promise<VerificacionArchivo> {
    if (!dto.observaciones || dto.observaciones.trim() === '') {
      throw new BadRequestException(
        'Debe ingresar una observación del rechazo.',
      );
    }

    const archivo = await this.archivoRepo.findOne({
      where: { idVerificacionArchivo: idArchivo },
      relations: ['verificacion', 'verificacion.usuario'],
    });

    if (!archivo) {
      throw new NotFoundException('No se encontró el archivo especificado.');
    }

    if (archivo.estado === EstadoArchivo.APROBADO) {
      throw new BadRequestException(
        'No se puede rechazar un archivo que ya fue aprobado.',
      );
    }

    // Actualizar estado y observaciones
    archivo.estado = EstadoArchivo.RECHAZADO;
    archivo.comentarioAdmin = dto.observaciones;
    archivo.fechaRevision = new Date();
    const archivoActualizado = await this.archivoRepo.save(archivo);

    this.notificarCambioArchivo(archivo.verificacion.usuario.id_usuario, 'rechazado', archivoActualizado);

    await this.notificacionesService.crearYEnviarNotificacion(
      [archivo.verificacion.usuario.id_usuario],
      {
        tipo: TipoNotificacion.ALERTA,
        titulo: 'Archivo rechazado',
        mensaje: `Tu archivo ${archivo.tipoDocumento} ha sido rechazado.`,
        url_redireccion: '/profile',
      }
    );


    // Recalcular el estado general de la verificación
    await this.verificacionService.validarVerificacionCompleta(
      archivo.verificacion.usuario,
      admin,
    );

    return archivoActualizado;
  }
}
