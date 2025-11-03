import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FotosVoluntariado } from "./entity/fotos_voluntariado.entity";
import { Repository } from "typeorm";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { Voluntariado } from "src/voluntariado/entity/voluntariado.entity";

@Injectable()
export class FotosVoluntariadoService {
  constructor(
    @InjectRepository(FotosVoluntariado)
    private readonly fotosRepo: Repository<FotosVoluntariado>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFotos(
    files: Express.Multer.File[],
    voluntariado: Voluntariado,
    queryRunner: any
  ) {
    if (!files?.length) return [];

    if (!voluntariado?.id_voluntariado) {
      throw new BadRequestException("Voluntariado inválido para agregar fotos.");
    }

    try {
      const fotos = await Promise.all(
        files.map(async (file) => {
          const upload = await this.cloudinaryService.uploadImage(
            file,
            "fotos-voluntariado"
          );

          const foto = this.fotosRepo.create({
            url: upload.secure_url,
            voluntariado: { id_voluntariado: voluntariado.id_voluntariado } as Voluntariado,
          });

          return queryRunner.manager.save(FotosVoluntariado, foto);
        })
      );

      return fotos;
    } catch {
      throw new BadRequestException("Error al subir las imágenes.");
    }
  }

  async deleteFotosCloudinary(fotos: FotosVoluntariado[]) {
    if (!fotos?.length) return;
    
    await Promise.allSettled(
      fotos.map(async (foto) => {
        const publicId = this.cloudinaryService.extractPublicIdFromUrl(foto.url);
        if (!publicId) return;

        try {
          await this.cloudinaryService.deleteImage(publicId);
        } catch {
          /* No lanzamos error para no romper la transacción principal */
        }
      })
    );
  }
}
