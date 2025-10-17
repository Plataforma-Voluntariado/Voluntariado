from pdf2image import convert_from_bytes
import os

def pdf_to_images(pdf_bytes):
    try:
        poppler_path = r"C:\poppler\Library\bin"
        images = convert_from_bytes(
            pdf_bytes,
            dpi=300,
            fmt='jpeg',
            poppler_path=poppler_path,
            thread_count=4
        )
        return images
    except Exception as e:
        print(f"❌ Error al convertir PDF: {str(e)}")
        return []
