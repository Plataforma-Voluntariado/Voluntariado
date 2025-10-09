import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { getCloudinaryConfig } from './cloudinary.config';

@Injectable()
export class CloudinaryService {
  private cloudinaryInstance;

  constructor(private configService: ConfigService) {
    this.cloudinaryInstance = getCloudinaryConfig(this.configService);
  }

}
