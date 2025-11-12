const fs = require("fs");
const path = require("path");

const src = path.join("src", "database", "colombia");
const dest = path.join("dist", "database", "colombia");

if (fs.existsSync(src)) {
  fs.mkdirSync(dest, { recursive: true });

  const copyRecursive = (srcDir, destDir) => {
    for (const file of fs.readdirSync(srcDir)) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);

      if (fs.lstatSync(srcPath).isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyRecursive(src, dest);
  console.log("✅ Carpeta 'src/database/colombia' copiada correctamente.");
} else {
  console.log("⚠️ Carpeta 'src/database/colombia' no encontrada, omitiendo copia.");
}
