import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Silencia logs de TensorFlow

from fastapi import FastAPI
from pydantic import BaseModel
from pysentimiento import create_analyzer
import uvicorn  # Importar uvicorn para poder usar uvicorn.run()

# Crear el analizador de sentimientos en español
analyzer = create_analyzer(task="sentiment", lang="es")

app = FastAPI(title="API de Sentimientos")


@app.get("/")
def root():
    return {"mensaje": "✅ API SENTIMIENTO funcionando correctamente"}


class ComentarioRequest(BaseModel):
    comentario: str

LABEL_MAP = {
    "NEG": "Comentario negativo",
    "POS": "Comentario positivo",
    "NEU": "Comentario neutro"
}

def calculate_stars(probas):
    pos = probas.get("POS", 0)
    neg = probas.get("NEG", 0)
    neu = probas.get("NEU", 0)
    stars = (1*neg + 3*neu + 5*pos)
    total = neg + neu + pos
    if total > 0:
        stars /= total
    return int(round(stars))

@app.post("/upload-comment")
async def upload_comment(data: ComentarioRequest):
    comentario = data.comentario
    result = analyzer.predict(comentario)
    sentimiento_texto = LABEL_MAP.get(result.output, "Sentimiento desconocido")
    estrellas = calculate_stars(result.probas)
    
    return {
        "comentario": comentario,
        "sentimiento": sentimiento_texto,
        "codigo": result.output,
        "probabilidades": {
            "positivo": round(float(result.probas.get("POS", 0.0)), 3),
            "negativo": round(float(result.probas.get("NEG", 0.0)), 3),
            "neutro": round(float(result.probas.get("NEU", 0.0)), 3)
        },
        "estrellas": estrellas
    }

# Bloque para ejecutar uvicorn directamente desde el código
if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8077, reload=True)
