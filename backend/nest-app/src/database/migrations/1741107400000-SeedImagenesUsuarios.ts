import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedImagenesUsuarios1741107400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // === ADMIN ===
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1005/400/400'
      WHERE correo = 'admin@app.com';
    `);

    // === VOLUNTARIOS ===
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1011/400/400'
      WHERE correo = 'vol1@app.com';
    `);
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1012/400/400'
      WHERE correo = 'vol2@app.com';
    `);
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1015/400/400'
      WHERE correo = 'vol3@app.com';
    `);
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1021/400/400'
      WHERE correo = 'vol4@app.com';
    `);

    // === CREADORES ===
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1033/400/400'
      WHERE correo = 'creador1@app.com';
    `);
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1035/400/400'
      WHERE correo = 'creador2@app.com';
    `);
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = 'https://picsum.photos/id/1038/400/400'
      WHERE correo = 'creador3@app.com';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE usuario 
      SET url_imagen = NULL
      WHERE correo IN (
        'admin@app.com',
        'vol1@app.com',
        'vol2@app.com',
        'vol3@app.com',
        'vol4@app.com',
        'creador1@app.com',
        'creador2@app.com',
        'creador3@app.com'
      );
    `);
  }
}
