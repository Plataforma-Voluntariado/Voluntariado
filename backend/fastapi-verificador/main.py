from fastapi import FastAPI, UploadFile, File, HTTPException
from utils.pdf_utils import pdf_to_images
from utils.ocr_utils import extract_text
from utils.model_utils import classify_image_roboflow, ROBOFLOW_AVAILABLE
from collections import Counter

app = FastAPI(title="Verificador de Documentos IA (Roboflow + OCR)")


@app.get("/")
def root():
    return {"mensaje": "✅ API funcionando correctamente"}


@app.get("/salud")
def salud_modelo():
    return {
        "roboflow_disponible": ROBOFLOW_AVAILABLE,
        "estado": "OK" if ROBOFLOW_AVAILABLE else "❌ Roboflow no configurado"
    }


# ====================================================
# 🔹 Endpoint principal: Subir PDF y analizar (OCR + IA)
# ====================================================
@app.post("/analizar-pdf")
async def analizar_pdf(file: UploadFile = File(...)):
    """
    Recibe un PDF, convierte cada página a imagen, aplica OCR y clasificación con IA.
    Luego combina ambos resultados (OCR + Visual) para determinar el tipo de documento.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Debe subir un archivo PDF válido")

    try:
        pdf_bytes = await file.read()
        images = pdf_to_images(pdf_bytes)

        if not images:
            raise HTTPException(status_code=500, detail="No se pudieron convertir páginas del PDF")

        resultados = []

        # ====================================================
        # 🧠 Palabras clave OCR ponderadas
        # ====================================================
        ocr_keywords = {
            "Cedula De Ciudadania": {
                "cedula de ciudadania" : 3,
                "república de colombia": 3,
                "cédula": 2,
                "nuip": 1,
                "nacionalidad": 1
            },
            "Registro Unico Tributario": {
                "numero de identificacion tributaria" : 3,
                "formulario del registro único tributario": 3,
                "dian": 2,
                "rut": 1,
                "nit": 1
            }
        }

        ocr_scores = {k: 0 for k in ocr_keywords.keys()}

        # ====================================================
        # 🔍 Procesar cada página (IA + OCR)
        # ====================================================
        for idx, img in enumerate(images, start=1):
            clase, confianza = classify_image_roboflow(img)
            texto = extract_text(img).lower()
            
            print(f"📄 Página {idx}:")
            print(f"   🎯 Clasificación visual: '{clase}' (confianza: {confianza:.2%})")
            print(f"   📝 Texto extraído (primeros 200 chars): {texto[:200]}")

            # Calcular puntaje OCR ponderado
            palabras_encontradas = []
            for tipo, palabras in ocr_keywords.items():
                for palabra, peso in palabras.items():
                    if palabra in texto:
                        ocr_scores[tipo] += peso
                        palabras_encontradas.append(f"{palabra} ({peso}pts)")
            
            if palabras_encontradas:
                print(f"   🔑 Palabras clave encontradas: {', '.join(palabras_encontradas)}")

            resultados.append({
                "pagina": idx,
                "clase_visual": clase,
                "confianza_visual": round(confianza, 4),
                "texto_extraido": texto[:1200]
            })

        # ====================================================
        # 📊 Resumen de detecciones visuales y OCR
        # ====================================================
        conteo_visual = Counter([r["clase_visual"] for r in resultados])
        clase_visual_predominante = conteo_visual.most_common(1)[0][0]

        clase_ocr_predominante = max(ocr_scores, key=ocr_scores.get)
        puntaje_ocr_max = ocr_scores[clase_ocr_predominante]
        total_ocr_puntaje = sum(ocr_scores.values())

        tipos_detectados = set([r["clase_visual"] for r in resultados])
        
        print(f"\n📊 RESUMEN DE ANÁLISIS:")
        print(f"   📸 Visual predominante: '{clase_visual_predominante}'")
        print(f"   📝 OCR predominante: '{clase_ocr_predominante}' (puntaje: {puntaje_ocr_max})")
        print(f"   📈 Puntajes OCR: {ocr_scores}")
        print(f"   🎯 Tipos detectados: {tipos_detectados}")

        # ====================================================
        # 🧩 Decisión combinada (Visual + OCR)
        # ====================================================
        print(f"\n🧩 LÓGICA DE DECISIÓN:")
        
        if len(tipos_detectados) > 1:
            tipo_final = "mixto"
            confianza_final = "media"
            mensaje = (
                "El PDF contiene múltiples tipos de documentos. "
                "Por favor sube un archivo PDF que contenga únicamente el documento requerido."
            )
            print(f"   ❌ Múltiples tipos detectados → tipo_final: '{tipo_final}'")

        else:
            if clase_visual_predominante == clase_ocr_predominante and puntaje_ocr_max >= 3:
                tipo_final = clase_visual_predominante
                confianza_final = "alta"
                mensaje = None
                print(f"   ✅ Coincidencia perfecta (puntaje >= 3) → tipo_final: '{tipo_final}' (confianza: alta)")

            elif clase_visual_predominante == clase_ocr_predominante:
                tipo_final = clase_visual_predominante
                confianza_final = "media"
                mensaje = "Coincidencia entre OCR y análisis visual, pero con baja evidencia textual."
                print(f"   ⚠️ Coincidencia con bajo puntaje → tipo_final: '{tipo_final}' (confianza: media)")

            elif clase_visual_predominante == "otro" and puntaje_ocr_max > 0:
                tipo_final = clase_ocr_predominante
                confianza_final = "media"
                mensaje = "El tipo de documento fue reconocido principalmente por su contenido textual."
                print(f"   📝 Visual='otro' pero OCR tiene puntaje → tipo_final: '{tipo_final}' (confianza: media)")

            elif clase_visual_predominante != clase_ocr_predominante and puntaje_ocr_max >= 3:
                tipo_final = clase_ocr_predominante
                confianza_final = "media"
                mensaje = (
                    f"El análisis visual sugiere '{clase_visual_predominante}', "
                    f"pero el texto indica claramente '{clase_ocr_predominante}'. "
                    "Se da prioridad al OCR por mayor evidencia textual."
                )
                print(f"   🔄 Conflicto resuelto por OCR (puntaje >= 3) → tipo_final: '{tipo_final}' (confianza: media)")

            else:
                tipo_final = clase_visual_predominante
                confianza_final = "baja"
                mensaje = (
                    "El documento no tiene coincidencias claras. "
                    "Por favor sube un archivo PDF que contenga únicamente el documento requerido."
                )
                print(f"   ⚠️ Sin coincidencias claras → tipo_final: '{tipo_final}' (confianza: baja)")

        # ====================================================
        # 📦 Resultado final
        # ====================================================
        resultado_final = {
            "tipo_documento": tipo_final,
            "confianza": confianza_final,
            **({"mensaje": mensaje} if mensaje else {})
        }
        
        print(f"\n✅ RESULTADO FINAL: {resultado_final}\n")

        return {
            "archivo": file.filename,
            "paginas_procesadas": len(images),
            "resultado_final": resultado_final,
            "analisis_detallado": {
                "por_pagina": resultados,
                "ocr_puntajes": ocr_scores,
                "visual_predominante": clase_visual_predominante
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")
