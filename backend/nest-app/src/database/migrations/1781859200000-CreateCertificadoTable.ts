import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificadoTable1781859200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla ya existe
    const tableExists = await queryRunner.hasTable('certificado');
    
    if (tableExists) {
      console.log('✅ Tabla certificado ya existe.');
      return;
    }

    // Crear la tabla certificado
    await queryRunner.query(`
      CREATE TABLE certificado (
        id_certificado BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        voluntario_id BIGINT UNSIGNED NOT NULL,
        voluntariado_id BIGINT UNSIGNED NOT NULL,
        inscripcion_id INT UNSIGNED NOT NULL,
        url_pdf VARCHAR(500) NOT NULL,
        hash_verificacion VARCHAR(64) NOT NULL UNIQUE,
        emitido_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_certificado_voluntario FOREIGN KEY (voluntario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        CONSTRAINT FK_certificado_voluntariado FOREIGN KEY (voluntariado_id) REFERENCES voluntariado(id_voluntariado) ON DELETE CASCADE,
        CONSTRAINT FK_certificado_inscripcion FOREIGN KEY (inscripcion_id) REFERENCES inscripcion(id_inscripcion) ON DELETE CASCADE,
        UNIQUE KEY UK_certificado_inscripcion (inscripcion_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabla certificado creada correctamente.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS certificado`);
  }
}
