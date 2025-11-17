import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class GenerarCertificadoDto {
  @IsNumber()
  @IsNotEmpty()
  inscripcionId: number;
}

export class CertificadoResponseDto {
  id_certificado: number;
  url_pdf: string;
  hash_verificacion: string;
  emitido_en: Date;
  voluntario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
  voluntariado: {
    id_voluntariado: number;
    titulo: string;
    horas: number;
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
  };
}

export class VerificarCertificadoDto {
  valido: boolean;
  certificado?: {
    voluntariado_id: number;
    id_certificado: number;
    url_pdf: string;
    emitido_en: Date;
    voluntario: string;
    voluntariado: string;
    horas: number;
  };
  mensaje?: string;
}
