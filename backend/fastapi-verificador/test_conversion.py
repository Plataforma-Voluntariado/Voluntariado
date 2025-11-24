#!/usr/bin/env python3
"""Test completo de conversión de PDF"""

import sys
from pdf2image import convert_from_bytes
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO

print("=== Test de Conversión de PDF ===\n")

# Crear un PDF simple de prueba
print("1. Creando PDF de prueba...")
buffer = BytesIO()
c = canvas.Canvas(buffer, pagesize=letter)
c.drawString(100, 750, "Test PDF - Página de Prueba")
c.showPage()
c.save()
pdf_bytes = buffer.getvalue()
print(f"   ✓ PDF creado: {len(pdf_bytes)} bytes\n")

# Intentar convertir sin poppler_path (modo Linux/Docker)
print("2. Intentando conversión sin poppler_path...")
try:
    images = convert_from_bytes(
        pdf_bytes,
        dpi=150,
        fmt='jpeg'
    )
    print(f"   ✓ Conversión exitosa: {len(images)} página(s)")
    if images:
        img = images[0]
        print(f"   ✓ Tamaño imagen: {img.size}")
        print("\n✅ TEST EXITOSO - pdf2image funciona correctamente")
        sys.exit(0)
except Exception as e:
    print(f"   ✗ Error: {e}")
    print("\n❌ TEST FALLIDO")
    sys.exit(1)
