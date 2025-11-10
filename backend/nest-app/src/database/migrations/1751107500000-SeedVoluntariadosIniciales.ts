import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedVoluntariadosIniciales1751107500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO voluntariado 
        (titulo, descripcion, fechaHoraInicio, fechaHoraFin, horas, maxParticipantes, estado, creador_id, categoria_id)
      VALUES
        ('Reforestación comunitaria', 'Jornada de reforestación en el parque central.', '2025-12-01 08:00:00', '2025-12-01 12:00:00', 4, 20, 'pendiente', 6, 1),
        ('Limpieza de ríos', 'Actividad de limpieza y concientización ambiental.', '2025-12-05 09:00:00', '2025-12-05 14:00:00', 5, 25, 'pendiente', 7, 2),
        ('Donación de ropa', 'Recolecta y entrega de ropa a comunidades vulnerables.', '2025-12-10 10:00:00', '2025-12-10 15:00:00', 5, 15, 'pendiente', 8, 3),
        ('Pintura de escuelas', 'Voluntariado para pintar y embellecer instituciones educativas.', '2025-12-15 08:00:00', '2025-12-15 13:00:00', 5, 18, 'pendiente', 6, 4),
        ('Apoyo a ancianos', 'Visita y acompañamiento a adultos mayores en el hogar San José.', '2025-12-20 09:00:00', '2025-12-20 12:00:00', 3, 12, 'pendiente', 7, 5),
        ('Jornada de limpieza urbana', 'Campaña para limpiar parques y zonas verdes.', '2026-01-05 08:00:00', '2026-01-05 12:00:00', 4, 30, 'pendiente', 8, 6),
        ('Campaña de vacunación', 'Apoyo logístico en jornada de vacunación gratuita.', '2026-01-10 07:00:00', '2026-01-10 13:00:00', 6, 25, 'pendiente', 6, 7),
        ('Educación ambiental', 'Talleres para niños sobre el cuidado del medio ambiente.', '2026-01-15 09:00:00', '2026-01-15 13:00:00', 4, 20, 'pendiente', 7, 8),
        ('Reciclaje responsable', 'Clasificación de residuos y educación ambiental.', '2026-01-20 08:30:00', '2026-01-20 12:30:00', 4, 20, 'pendiente', 8, 9),
        ('Huertas comunitarias', 'Creación de huertas urbanas en barrios populares.', '2026-01-25 08:00:00', '2026-01-25 12:00:00', 4, 20, 'pendiente', 6, 10),
        ('Ayuda en refugios', 'Colaboración en refugios para animales callejeros.', '2026-02-01 09:00:00', '2026-02-01 14:00:00', 5, 15, 'pendiente', 7, 11),
        ('Apoyo escolar', 'Refuerzo educativo a niños en situación vulnerable.', '2026-02-10 08:00:00', '2026-02-10 12:00:00', 4, 18, 'pendiente', 8, 12);
    `);
  }
  

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM voluntariado;`);
  }
}
