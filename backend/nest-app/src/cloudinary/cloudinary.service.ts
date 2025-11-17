import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { getCloudinaryConfig } from './cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    getCloudinaryConfig(this.configService);
  }

  async uploadImage(file: Express.Multer.File, folder = 'fotos-perfil'): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo.');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'jpg',
        },
        (error, result) => {
          if (error || !result) {
            return reject(new BadRequestException('Error al subir imagen a Cloudinary'));
          }
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadFileFromBuffer(
    buffer: Buffer,
    filename: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'raw',
  ): Promise<UploadApiResponse> {
    if (!buffer) {
      throw new BadRequestException('No se ha proporcionado ningún buffer.');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: filename.replace(/\.[^/.]+$/, ''), // Remover extensión
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            return reject(new BadRequestException('Error al subir archivo a Cloudinary'));
          }
          resolve(result);
        },
      );

      uploadStream.end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    if (!publicId) {
      throw new BadRequestException('Debe proporcionar el public_id de la imagen.');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result?.result === 'ok';
    } catch (error) {
      throw new BadRequestException('Error al eliminar la imagen de Cloudinary');
    }
  }

  extractPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(p => p === 'upload');
      if (uploadIndex === -1) return null;

      const publicPathParts = parts.slice(uploadIndex + 1);
      if (/^v\d+$/.test(publicPathParts[0])) publicPathParts.shift();

      const publicIdPath = publicPathParts.join('/').replace(/\.[^/.]+$/, '');
      return publicIdPath || null;
    } catch {
      return null;
    }
  }
}
