import pytesseract
from PIL import Image

# Ajusta esta ruta a donde tengas tesseract.exe
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text(image: Image.Image) -> str:
    """
    Extrae texto desde una imagen usando OCR (Tesseract).
    """
    try:
        texto = pytesseract.image_to_string(image, lang="spa")
        return texto.strip()
    except Exception as e:
        print(f"❌ Error OCR: {e}")
        return ""
