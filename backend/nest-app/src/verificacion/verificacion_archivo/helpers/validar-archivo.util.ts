import { BadRequestException } from '@nestjs/common';
import { Express } from 'express';

export function validarArchivoPDF(archivo: Express.Multer.File) {

  if (!archivo) {
    throw new BadRequestException('Debes subir un archivo PDF');
  }
  
  if (archivo.mimetype !== 'application/pdf') {
    throw new BadRequestException(`El archivo ${archivo.originalname} no es un PDF válido`);
  }

  if (archivo.size > 1 * 1024 * 1024) {
    throw new BadRequestException(
      `El archivo ${archivo.originalname} excede el tamaño máximo permitido (1 MB)`,
    );
  }
}
