import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedCategorias1720000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const categorias = [
            { nombre: "Medio Ambiente" },
            { nombre: "Social y Comunitario" },
            { nombre: "Educación y Capacitación" },
            { nombre: "Salud y Bienestar" },
            { nombre: "Protección Animal" },
            { nombre: "Arte, Cultura y Recreación" },
            { nombre: "Voluntariado Profesional" },
            { nombre: "Construcción y Desarrollo Comunitario" },
            { nombre: "Voluntariado Digital" },
            { nombre: "Emergencias y Gestión del Riesgo" },
            { nombre: "Internacional y Derechos Humanos" },
            { nombre: "Innovación, Ciencia y Tecnología" }
        ]
        for (const categoria of categorias) {
            await queryRunner.query(
                `INSERT INTO categoria (nombre) VALUES (?)`,
                [categoria.nombre],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM categoria`);
    }
}
