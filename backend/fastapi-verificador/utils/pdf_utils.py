from pdf2image import convert_from_bytes
from pdf2image.exceptions import PDFInfoNotInstalledError, PDFPageCountError, PDFSyntaxError
import os
import platform
import shutil

def pdf_to_images(pdf_bytes):
    try:
        print(f"🔍 Iniciando conversión de PDF ({len(pdf_bytes)} bytes)")
        print(f"🔍 Sistema: {platform.system()}")
        
        # Verificar que pdftoppm esté disponible
        pdftoppm_path = shutil.which("pdftoppm")
        pdfinfo_path = shutil.which("pdfinfo")
        print(f"🔍 pdftoppm: {pdftoppm_path}")
        print(f"🔍 pdfinfo: {pdfinfo_path}")
        
        # En Windows, necesitamos especificar poppler_path
        # En Linux/Docker, poppler está en el PATH del sistema
        kwargs = {
            'dpi': 300,
            'fmt': 'jpeg',
            'thread_count': 2
        }
        
        # Solo en Windows agregamos poppler_path
        if platform.system() == "Windows":
            windows_poppler = r"C:\poppler\Library\bin"
            if os.path.exists(windows_poppler):
                kwargs['poppler_path'] = windows_poppler
                print(f"🔍 Usando poppler_path: {windows_poppler}")
        
        print(f"🔍 Llamando convert_from_bytes con kwargs: {kwargs}")
        
        # Convertir PDF a imágenes
        images = convert_from_bytes(pdf_bytes, **kwargs)
        
        if not images:
            print("⚠️ No se generaron imágenes del PDF")
        else:
            print(f"✅ Conversión exitosa: {len(images)} página(s)")
        
        return images
        
    except (PDFInfoNotInstalledError, PDFPageCountError) as e:
        print(f"❌ Error de Poppler: {str(e)}")
        print(f"   Sistema: {platform.system()}")
        print(f"   pdftoppm disponible: {shutil.which('pdftoppm')}")
        print(f"   pdfinfo disponible: {shutil.which('pdfinfo')}")
        return []
    except Exception as e:
        print(f"❌ Error al convertir PDF: {str(e)}")
        print(f"   Sistema: {platform.system()}")
        print(f"   Tipo de error: {type(e).__name__}")
        return []
