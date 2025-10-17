import * as fs from 'fs';
import * as path from 'path';

export function asegurarCarpetaUsuario(basePath: string, userId: number): string {
  //Verificar y crear carpeta base si no existe
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  //Crear carpeta específica del usuario
  const userFolder = path.join(basePath, String(userId));
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder, { recursive: true });
  }

  return userFolder;
}
