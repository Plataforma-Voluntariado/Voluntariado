import requests, io
from PIL import Image, ImageOps

ROBOFLOW_AVAILABLE = True

def classify_image_roboflow(image: Image.Image):
    """
    Envía una imagen a Roboflow y devuelve la clase y confianza.
    """
    try:
        image = ImageOps.exif_transpose(image)
        if image.mode != "RGB":
            image = image.convert("RGB")
        image = ImageOps.contain(image, (640, 640))

        img_bytes = io.BytesIO()
        image.save(img_bytes, format="JPEG", quality=95)
        img_bytes.seek(0)

        response = requests.post(
            "https://classify.roboflow.com/verificador-documentos-p1t7m/1",
            params={"api_key": "voBwqId9so3ANHW7nMlj"},
            files={"file": ("image.jpg", img_bytes, "image/jpeg")},
            timeout=30
        )

        if response.status_code == 200:
            prediction = response.json()
            if prediction.get("predictions"):
                clase = prediction["predictions"][0]["class"]
                confianza = prediction["predictions"][0]["confidence"]
                return clase, confianza
            else:
                return "desconocido", 0.0
        else:
            print(f"❌ Error HTTP {response.status_code}: {response.text}")
            return "desconocido", 0.0

    except Exception as e:
        print(f"❌ Error clasificando imagen: {str(e)}")
        return "desconocido", 0.0
