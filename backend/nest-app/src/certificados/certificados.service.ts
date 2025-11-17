import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from './entity/certificado.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { CertificadoResponseDto, VerificarCertificadoDto } from './dto/certificado.dto';

@Injectable()
export class CertificadosService {
  private readonly fastApiUrl: string;
  private readonly backendUrl: string;

  constructor(
    @InjectRepository(Certificado)
    private readonly certificadoRepository: Repository<Certificado>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {
    this.fastApiUrl = this.configService.get<string>('CERTIFICADOS_FASTAPI_URL') || this.configService.get<string>('FASTAPI_URL') || 'http://localhost:8002';
    this.backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
  }

  /**
   * Genera un certificado para una inscripción validando asistencia
   */
  async generarCertificado(inscripcionId: number, usuarioId: number): Promise<CertificadoResponseDto> {
    // 1. Validar que la inscripción existe y pertenece al usuario
    const inscripcion = await this.inscripcionRepository.findOne({
      where: { id_inscripcion: inscripcionId },
      relations: ['voluntario', 'voluntariado', 'voluntariado.creador'],
    });

    if (!inscripcion) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    if (inscripcion.voluntario.id_usuario !== usuarioId) {
      throw new BadRequestException('No tienes permiso para generar este certificado');
    }

    // 2. Validar que el voluntariado terminó
    if (inscripcion.voluntariado.estado !== 'terminado') {
      throw new BadRequestException('El voluntariado aún no ha terminado');
    }

    // 3. Validar que el voluntario asistió
    if (!inscripcion.asistencia) {
      throw new BadRequestException('No puedes generar un certificado sin haber asistido al voluntariado');
    }

    // 4. Validar que la inscripción está aceptada
    if (inscripcion.estado_inscripcion !== EstadoInscripcion.ACEPTADA && 
        inscripcion.estado_inscripcion !== EstadoInscripcion.TERMINADA) {
      throw new BadRequestException('La inscripción no está aceptada');
    }

    // 5. Verificar si ya existe un certificado
    const certificadoExistente = await this.certificadoRepository.findOne({
      where: { inscripcion: { id_inscripcion: inscripcionId } },
      relations: ['voluntario', 'voluntariado'],
    });

    if (certificadoExistente) {
      return this.mapToResponseDto(certificadoExistente);
    }

    // 6. Generar hash único para verificación
    const hash = this.generarHashVerificacion(inscripcionId, usuarioId);

    // 7. Preparar datos para el PDF
    const voluntario = inscripcion.voluntario;
    const voluntariado = inscripcion.voluntariado;
    
    const nombreCompleto = `${voluntario.nombre || ''} ${voluntario.apellido || ''}`.trim();
    const fechaFormato = this.formatearFecha(voluntariado.fechaHoraInicio);

    const payloadPdf = {
      nombre_voluntario: nombreCompleto,
      voluntariado_titulo: voluntariado.titulo,
      fecha: fechaFormato,
      horas: voluntariado.horas,
      certificado_id: `CERT-${inscripcionId}-${Date.now()}`,
      verificacion_url: `${this.backendUrl}/certificados/verificar/${hash}`,
      organizacion: voluntariado.creador?.nombre || 'Plataforma Voluntariado',
      firmado_por: 'Coordinación General',
    };

    try {
      // 8. Llamar a FastAPI para generar el PDF
      const pdfResponse = await axios.post(
        `${this.fastApiUrl}/certificados/pdf`,
        payloadPdf,
        {
          responseType: 'arraybuffer',
          timeout: 30000,
        },
      );

      const pdfBuffer = Buffer.from(pdfResponse.data);

      // 9. Subir a Cloudinary
      const uploadResult = await this.cloudinaryService.uploadFileFromBuffer(
        pdfBuffer,
        `certificados/certificado_${inscripcionId}_${Date.now()}.pdf`,
        'raw',
      );

      // 10. Guardar en base de datos
      const certificado = this.certificadoRepository.create({
        voluntario: { id_usuario: usuarioId },
        voluntariado: { id_voluntariado: voluntariado.id_voluntariado },
        inscripcion: { id_inscripcion: inscripcionId },
        url_pdf: uploadResult.secure_url,
        hash_verificacion: hash,
      });

      const certificadoGuardado = await this.certificadoRepository.save(certificado);

      // 11. Cargar relaciones completas para el response
      const certificadoCompleto = await this.certificadoRepository.findOne({
        where: { id_certificado: certificadoGuardado.id_certificado },
        relations: ['voluntario', 'voluntariado'],
      });

      if (!certificadoCompleto) {
        throw new InternalServerErrorException('Error cargando el certificado generado');
      }

      return this.mapToResponseDto(certificadoCompleto);
    } catch (error) {
      console.error('Error generando certificado:', error);
      
      if (axios.isAxiosError(error)) {
        throw new InternalServerErrorException(
          `Error comunicándose con el servicio de generación de PDFs: ${error.message}`,
        );
      }

      throw new InternalServerErrorException('Error generando el certificado');
    }
  }

  /**
   * Obtiene certificados de un voluntario
   */
  async obtenerCertificadosVoluntario(usuarioId: number): Promise<CertificadoResponseDto[]> {
    const certificados = await this.certificadoRepository.find({
      where: { voluntario: { id_usuario: usuarioId } },
      relations: ['voluntario', 'voluntariado'],
      order: { emitido_en: 'DESC' },
    });

    return certificados.map((cert) => this.mapToResponseDto(cert));
  }

  /**
   * Verifica un certificado por su hash
   */
  async verificarCertificado(hash: string): Promise<VerificarCertificadoDto> {
    const certificado = await this.certificadoRepository.findOne({
      where: { hash_verificacion: hash },
      relations: ['voluntario', 'voluntariado'],
    });

    if (!certificado) {
      return {
        valido: false,
        mensaje: 'Certificado no encontrado o hash inválido',
      };
    }

    const nombreCompleto = `${certificado.voluntario.nombre || ''} ${certificado.voluntario.apellido || ''}`.trim();

    return {
      valido: true,
      certificado: {
        voluntariado_id: certificado.voluntariado.id_voluntariado,
        id_certificado: certificado.id_certificado,
        url_pdf: certificado.url_pdf,
        emitido_en: certificado.emitido_en,
        voluntario: nombreCompleto,
        voluntariado: certificado.voluntariado.titulo,
        horas: certificado.voluntariado.horas,
      },
    };
  }

  /**
   * Obtiene inscripciones elegibles para certificado de un voluntario
   */
  async obtenerInscripcionesElegibles(usuarioId: number): Promise<Array<{
    id_inscripcion: number;
    voluntariado: {
      id_voluntariado: number;
      titulo: string;
      horas: number;
      fechaHoraInicio: Date;
      fechaHoraFin: Date;
    };
  }>> {
    const inscripciones = await this.inscripcionRepository.find({
      where: {
        voluntario: { id_usuario: usuarioId },
        asistencia: true,
        calificado: true,
      },
      relations: ['voluntariado', 'voluntariado.creador'],
    });

    // Filtrar solo las que tienen voluntariado terminado y aún no tienen certificado
    const elegibles: Array<{
      id_inscripcion: number;
      voluntariado: {
        id_voluntariado: number;
        titulo: string;
        horas: number;
        fechaHoraInicio: Date;
        fechaHoraFin: Date;
      };
    }> = [];
    
    for (const inscripcion of inscripciones) {
      if (inscripcion.voluntariado.estado === 'terminado') {
        const certificadoExiste = await this.certificadoRepository.findOne({
          where: { inscripcion: { id_inscripcion: inscripcion.id_inscripcion } },
        });

        if (!certificadoExiste) {
          elegibles.push({
            id_inscripcion: inscripcion.id_inscripcion,
            voluntariado: {
              id_voluntariado: inscripcion.voluntariado.id_voluntariado,
              titulo: inscripcion.voluntariado.titulo,
              horas: inscripcion.voluntariado.horas,
              fechaHoraInicio: inscripcion.voluntariado.fechaHoraInicio,
              fechaHoraFin: inscripcion.voluntariado.fechaHoraFin,
            },
          });
        }
      }
    }

    return elegibles;
  }

  // Helpers privados
  private generarHashVerificacion(inscripcionId: number, usuarioId: number): string {
    const data = `${inscripcionId}-${usuarioId}-${Date.now()}-${Math.random()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  private mapToResponseDto(certificado: Certificado): CertificadoResponseDto {
    return {
      id_certificado: certificado.id_certificado,
      url_pdf: certificado.url_pdf,
      hash_verificacion: certificado.hash_verificacion,
      emitido_en: certificado.emitido_en,
      voluntario: {
        id_usuario: certificado.voluntario.id_usuario,
        nombre: certificado.voluntario.nombre || '',
        apellido: certificado.voluntario.apellido || '',
      },
      voluntariado: {
        id_voluntariado: certificado.voluntariado.id_voluntariado,
        titulo: certificado.voluntariado.titulo,
        horas: certificado.voluntariado.horas,
        fechaHoraInicio: certificado.voluntariado.fechaHoraInicio,
        fechaHoraFin: certificado.voluntariado.fechaHoraFin,
      },
    };
  }
}
