import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedFotosVoluntariado1761107600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO fotos_voluntariado (url, voluntariado_id) VALUES
      -- Voluntariado 1
      ('https://picsum.photos/id/1011/800/600', 1),
      ('https://picsum.photos/id/1012/800/600', 1),
      ('https://picsum.photos/id/1013/800/600', 1),

      -- Voluntariado 2
      ('https://picsum.photos/id/1014/800/600', 2),
      ('https://picsum.photos/id/1015/800/600', 2),
      ('https://picsum.photos/id/1016/800/600', 2),

      -- Voluntariado 3
      ('https://picsum.photos/id/1057/800/600', 3),
      ('https://picsum.photos/id/1018/800/600', 3),
      ('https://picsum.photos/id/1019/800/600', 3),

      -- Voluntariado 4
      ('https://picsum.photos/id/1020/800/600', 4),
      ('https://picsum.photos/id/1021/800/600', 4),
      ('https://picsum.photos/id/1022/800/600', 4),

      -- Voluntariado 5
      ('https://picsum.photos/id/1023/800/600', 5),
      ('https://picsum.photos/id/1024/800/600', 5),
      ('https://picsum.photos/id/1025/800/600', 5),

      -- Voluntariado 6
      ('https://picsum.photos/id/1026/800/600', 6),
      ('https://picsum.photos/id/1027/800/600', 6),
      ('https://picsum.photos/id/1028/800/600', 6),

      -- Voluntariado 7
      ('https://picsum.photos/id/1029/800/600', 7),
      ('https://picsum.photos/id/1050/800/600', 7),
      ('https://picsum.photos/id/1031/800/600', 7),

      -- Voluntariado 8
      ('https://picsum.photos/id/1032/800/600', 8),
      ('https://picsum.photos/id/1033/800/600', 8),
      ('https://picsum.photos/id/1054/800/600', 8),

      -- Voluntariado 9
      ('https://picsum.photos/id/1035/800/600', 9),
      ('https://picsum.photos/id/1036/800/600', 9),
      ('https://picsum.photos/id/1037/800/600', 9),

      -- Voluntariado 10
      ('https://picsum.photos/id/1038/800/600', 10),
      ('https://picsum.photos/id/1039/800/600', 10),
      ('https://picsum.photos/id/1040/800/600', 10),

      -- Voluntariado 11
      ('https://picsum.photos/id/1041/800/600', 11),
      ('https://picsum.photos/id/1042/800/600', 11),
      ('https://picsum.photos/id/1043/800/600', 11),

      -- Voluntariado 12
      ('https://picsum.photos/id/1044/800/600', 12),
      ('https://picsum.photos/id/1045/800/600', 12),
      ('https://picsum.photos/id/1047/800/600', 12);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM fotos_voluntariado;`);
  }
}
