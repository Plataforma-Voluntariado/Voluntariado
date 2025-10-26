import { BadRequestException } from '@nestjs/common';

export function validarImagen(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('Debe subir una imagen.');
  }

  const formatosPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!formatosPermitidos.includes(file.mimetype)) {
    throw new BadRequestException('Formato de imagen no válido. Solo se permite JPG, PNG o WEBP.');
  }

  const maxSizeInBytes = 3 * 1024 * 1024; // 1MB
  if (file.size > maxSizeInBytes) {
    throw new BadRequestException('La imagen no puede superar los 1MB.');
  }
}
