#!/usr/bin/env python3
import platform
import shutil
import os

print("=== Test de Poppler ===")
print(f"Sistema operativo: {platform.system()}")
print(f"Python: {platform.python_version()}")

# Verificar si pdftoppm está disponible
pdftoppm = shutil.which("pdftoppm")
print(f"pdftoppm encontrado en: {pdftoppm}")

if pdftoppm:
    poppler_dir = os.path.dirname(pdftoppm)
    print(f"Directorio de poppler: {poppler_dir}")
    
    # Listar archivos en el directorio
    if os.path.exists(poppler_dir):
        archivos = os.listdir(poppler_dir)
        print(f"Archivos en {poppler_dir}:")
        for archivo in archivos[:10]:  # Primeros 10
            print(f"  - {archivo}")

# Test de importación
try:
    from pdf2image import convert_from_bytes
    print("\n✅ pdf2image importado correctamente")
except Exception as e:
    print(f"\n❌ Error importando pdf2image: {e}")

print("\n=== Fin del test ===")
