import { MigrationInterface, QueryRunner } from "typeorm";
import * as fs from "fs";
import * as path from "path";

export class SeedDepartamentoCiudad1760391810393 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    
    const existing: any = await queryRunner.query(
      `SELECT COUNT(*) as count FROM Departamento`
    );
    if (existing[0].count > 0) {
      console.log("✅ Departamentos y ciudades ya están cargados.");
      return;
    }
    
    const filePath = path.join(__dirname, "..", "colombia", "colombia.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    for (const departamento of data) {
      // Insertar departamento
      const insertResult: any = await queryRunner.query(
        `INSERT INTO Departamento (departamento) VALUES (?)`,
        [departamento.departamento]
      );

      // Obtener el ID insertado
      const departamentoId =
        insertResult.insertId ??
        (await queryRunner.query(
          `SELECT id_departamento FROM Departamento WHERE departamento = ?`,
          [departamento.departamento]
        ))[0]?.id_departamento;

      // Insertar ciudades asociadas
      for (const ciudad of departamento.ciudades) {
        await queryRunner.query(
          `INSERT INTO Ciudad (ciudad, id_departamento) VALUES (?, ?)`,
          [ciudad, departamentoId]
        );
      }
    }

    console.log("✅ Datos de departamentos y ciudades insertados correctamente.");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM Ciudad`);
    await queryRunner.query(`DELETE FROM Departamento`);
  }
}
