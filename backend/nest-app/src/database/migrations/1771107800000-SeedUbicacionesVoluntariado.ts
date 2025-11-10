import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedUbicacionesVoluntariados1771107800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO ubicacion (latitud, longitud, direccion, nombre_sector, voluntariado_id, ciudad_id) VALUES
      (1.1483693, -76.6456889, 'Carrera 3 #5-21', 'Centro', 1, 83),
      (1.1490201, -76.6462211, 'Calle 6 #4-18', 'Centro', 2, 83),
      (1.1478254, -76.6449725, 'Carrera 2 #7-12', 'San Agustín', 3, 83),
      (1.1501137, -76.6469876, 'Calle 8 #6-20', 'El Pepino', 4, 83),
      (1.1474019, -76.6439522, 'Carrera 1 #9-15', 'San Miguel', 5, 83),
      (1.1497895, -76.6475303, 'Calle 10 #7-14', 'La Esmeralda', 6, 83),
      (1.1489152, -76.6451208, 'Carrera 5 #11-10', 'Pinos Oriente', 7, 83),
      (1.1472127, -76.6468752, 'Calle 12 #3-17', 'El Carmen', 8, 83),
      (1.1505239, -76.6455006, 'Carrera 4 #13-08', 'Rumiyaco', 9, 83),
      (1.1493256, -76.6447104, 'Calle 14 #5-22', 'El Progreso', 10, 83),
      (1.1486123, -76.6466549, 'Carrera 6 #15-16', 'Villa Rosa', 11, 83),
      (1.1479358, -76.6477892, 'Calle 16 #2-11', 'El Bosque', 12, 83);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM ubicacion;`);
  }
}
