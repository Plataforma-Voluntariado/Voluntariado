import { Injectable, NotFoundException } from "@nestjs/common";
import { Ubicacion } from "./entity/ubicacion.entity";
import { Ciudad } from "src/ciudad/entity/ciudad.entity";
import { Voluntariado } from "src/voluntariado/entity/voluntariado.entity";
import { EntityManager } from "typeorm";

interface UbicacionDto {
  ciudad_id?: number;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  nombre_sector?: string;
}

@Injectable()
export class UbicacionService {
  constructor() { }

  private async getCiudad(id: number, queryRunner: any) {
    const ciudad = await queryRunner.manager.findOne(Ciudad, {
      where: { id_ciudad: id },
    });

    if (!ciudad) {
      throw new NotFoundException("La ciudad indicada no existe.");
    }

    return ciudad;
  }

  async create(dto: UbicacionDto, voluntariado: Voluntariado, queryRunner: any) {
    const ciudad = await this.getCiudad(dto.ciudad_id!, queryRunner);

    const ubicacion = queryRunner.manager.create(Ubicacion, {
      ciudad,
      latitud: dto.latitud,
      longitud: dto.longitud,
      direccion: dto.direccion?.trim(),
      nombre_sector: dto.nombre_sector?.trim(),
      voluntariado,
    });

    return queryRunner.manager.save(Ubicacion, ubicacion);
  }


}
