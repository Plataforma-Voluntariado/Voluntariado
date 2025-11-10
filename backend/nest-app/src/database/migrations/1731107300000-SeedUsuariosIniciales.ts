import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedUsuariosIniciales1731107300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // === ADMIN ===
    await queryRunner.query(`
      INSERT INTO usuario (nombre, apellido, correo, contrasena, telefono, fecha_nacimiento, rol, estado, verificado, url_imagen, id_ciudad, fecha_registro, correo_verificado)
      VALUES
      ('Ana', 'García', 'admin@app.com', '$2b$10$x9K8xccvelUBibJ8L/snFOH1R63L4ziGgXzkL5LNg30fY1v5NZRly', '3000000000', '1990-05-10', 'ADMIN', 'ACTIVO', 1, 'https://res.cloudinary.com/dkkb0nx3l/image/upload/v1762651762/tigre_vixlkk.jpg', 1, NOW(), 1);
    `);

    // id_usuario del admin
    const adminId = await queryRunner.query(`SELECT id_usuario FROM usuario WHERE correo = 'admin@app.com';`);
    await queryRunner.query(`
      INSERT INTO administrador (id_usuario)
      VALUES (${adminId[0].id_usuario});
    `);

    // === VOLUNTARIOS ===
    const voluntarios = [
      { nombre: 'Carlos', apellido: 'Lopez', correo: 'vol1@app.com', telefono: '3000000001' },
      { nombre: 'María', apellido: 'Perez', correo: 'vol2@app.com', telefono: '3000000002' },
      { nombre: 'Juan', apellido: 'Rojas', correo: 'vol3@app.com', telefono: '3000000003' },
      { nombre: 'Sofia', apellido: 'Mendez', correo: 'vol4@app.com', telefono: '3000000004' },
    ];

    for (const v of voluntarios) {
      await queryRunner.query(`
        INSERT INTO usuario (nombre, apellido, correo, contrasena, telefono, fecha_nacimiento, rol, estado, verificado, url_imagen, id_ciudad, fecha_registro, correo_verificado)
        VALUES
        ('${v.nombre}', '${v.apellido}', '${v.correo}', '$2b$10$x9K8xccvelUBibJ8L/snFOH1R63L4ziGgXzkL5LNg30fY1v5NZRly', '${v.telefono}', '2000-01-01', 'VOLUNTARIO', 'ACTIVO', 1, NULL, ${Math.floor(Math.random() * 100) + 1}, NOW(), 1);
      `);
      const idVol = await queryRunner.query(`SELECT id_usuario FROM usuario WHERE correo = '${v.correo}';`);
      await queryRunner.query(`
        INSERT INTO voluntario (id_usuario)
        VALUES (${idVol[0].id_usuario});
      `);
    }

    // === CREADORES ===
    const creadores = [
      { nombre: 'Fundación Vida', tipo: 'COMUNITARIA', correo: 'creador1@app.com', direccion: 'Calle 10 #5-20', descripcion: 'Apoya comunidades rurales' },
      { nombre: 'EcoPlanet', tipo: 'PRIVADA', correo: 'creador2@app.com', direccion: 'Av. Ambiental 23-45', descripcion: 'Cuidado ambiental y reciclaje' },
      { nombre: 'Gobernación Putumayo', tipo: 'PUBLICA', correo: 'creador3@app.com', direccion: 'Carrera 8 #12-34', descripcion: 'Programas sociales y voluntariado' },
    ];

    for (const c of creadores) {
      await queryRunner.query(`
        INSERT INTO usuario (nombre, apellido, correo, contrasena, telefono, fecha_nacimiento, rol, estado, verificado, url_imagen, id_ciudad, fecha_registro, correo_verificado)
        VALUES
        (NULL, NULL, '${c.correo}', '$2b$10$x9K8xccvelUBibJ8L/snFOH1R63L4ziGgXzkL5LNg30fY1v5NZRly', '3100000000', NULL, 'CREADOR', 'ACTIVO', 1, NULL, ${Math.floor(Math.random() * 100) + 1}, NOW(), 1);
      `);
      const idCreador = await queryRunner.query(`SELECT id_usuario FROM usuario WHERE correo = '${c.correo}';`);
      await queryRunner.query(`
        INSERT INTO creador (id_usuario, tipo_entidad, nombre_entidad, direccion, descripcion, sitio_web)
        VALUES (${idCreador[0].id_usuario}, '${c.tipo}', '${c.nombre}', '${c.direccion}', '${c.descripcion}', NULL);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM creador WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE correo LIKE 'creador%@app.com');
    `);
    await queryRunner.query(`
      DELETE FROM voluntario WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE correo LIKE 'vol%@app.com');
    `);
    await queryRunner.query(`
      DELETE FROM administrador WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE correo = 'admin@app.com');
    `);
    await queryRunner.query(`
      DELETE FROM usuario WHERE correo IN ('admin@app.com', 'vol1@app.com', 'vol2@app.com', 'vol3@app.com', 'vol4@app.com', 'creador1@app.com', 'creador2@app.com', 'creador3@app.com');
    `);
  }
}
