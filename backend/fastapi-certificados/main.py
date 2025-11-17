from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
import requests
import os
import io
import base64
import qrcode
from dotenv import load_dotenv

# Load env
load_dotenv()

TEMPLATES_DIR = Path(__file__).parent / "templates" / "certificados"

app = FastAPI(title="Generador de Certificados (FastAPI - Microservicio)")

class CertificadoRequest(BaseModel):
    nombre_voluntario: str
    voluntariado_titulo: str
    fecha: str
    horas: int
    certificado_id: str
    verificacion_url: HttpUrl
    organizacion: Optional[str] = None
    firmado_por: Optional[str] = None
    logo_url: Optional[HttpUrl] = None
    firma_url: Optional[HttpUrl] = None


def _build_qr_data_uri(url: str) -> str:
    buf = io.BytesIO()
    img = qrcode.make(url)
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def _render_html_certificado(data: CertificadoRequest) -> str:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    template = env.get_template("certificado.html")
    hoy = datetime.utcnow().strftime("%Y-%m-%d")
    qr_data_uri = _build_qr_data_uri(str(data.verificacion_url))
    html = template.render(
        nombre_voluntario=data.nombre_voluntario,
        voluntariado_titulo=data.voluntariado_titulo,
        fecha=data.fecha,
        horas=data.horas,
        certificado_id=data.certificado_id,
        verificacion_url=str(data.verificacion_url),
        organizacion=data.organizacion,
        firmado_por=data.firmado_por,
        logo_url=str(data.logo_url) if data.logo_url else None,
        firma_url=str(data.firma_url) if data.firma_url else None,
        qr_data_uri=qr_data_uri,
        hoy=hoy,
    )
    return html


def _pdflayer_convert_html(html: str, test: bool = False) -> bytes:
    access_key = os.environ.get("PDFLAYER_ACCESS_KEY")
    if not access_key:
        raise HTTPException(status_code=500, detail="Falta la variable de entorno PDFLAYER_ACCESS_KEY")

    url = "https://api.pdflayer.com/api/convert"
    params = {"access_key": access_key}
    payload = {
        "document_html": html,
        "page_size": "A4",
        "margin_top": "15",
        "margin_bottom": "15",
        "margin_left": "15",
        "margin_right": "15",
    }
    if test:
        payload["test"] = 1

    try:
        resp = requests.post(url, params=params, data=payload, timeout=60)
        content_type = resp.headers.get('Content-Type', '')
        if 'application/json' in content_type:
            try:
                err = resp.json()
                raise HTTPException(status_code=502, detail={"message": "Error en pdflayer", "error": err})
            except ValueError:
                pass

        if resp.status_code != 200 or not resp.content:
            raise HTTPException(status_code=502, detail={"message": "Error en pdflayer", "status": resp.status_code})
        return resp.content
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Fallo al contactar pdflayer: {str(e)}")


@app.post("/certificados/pdf", response_description="Devuelve el PDF del certificado")
def generar_certificado_pdf(payload: CertificadoRequest = Body(...), modo_prueba: bool = False):
    html = _render_html_certificado(payload)
    pdf_bytes = _pdflayer_convert_html(html, test=modo_prueba)

    filename = f"certificado_{payload.certificado_id}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""},
    )
