import pytesseract
from PIL import Image
import platform
import shutil

# Solo configurar tesseract_cmd en Windows
if platform.system() == "Windows":
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
# En Linux/Docker, tesseract está en el PATH del sistema

def extract_text(image: Image.Image) -> str:
    """
    Extrae texto desde una imagen usando OCR (Tesseract).
    """
    try:
        texto = pytesseract.image_to_string(image, lang="spa")
        return texto.strip()
    except Exception as e:
        print(f"❌ Error OCR: {e}")
        tesseract_found = shutil.which("tesseract")
        print(f"   Tesseract en PATH: {tesseract_found}")
        print(f"   Sistema: {platform.system()}")
        return ""
