# ================================
# Dockerfile para API Sentimiento (FastAPI + ML)
# ================================

FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Crear requirements.txt si no existe
RUN echo "fastapi" > requirements.txt && \
    echo "uvicorn[standard]" >> requirements.txt && \
    echo "pysentimiento" >> requirements.txt && \
    echo "torch" >> requirements.txt && \
    echo "transformers" >> requirements.txt

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Variables de entorno
ENV PYTHONUNBUFFERED=1
ENV TF_CPP_MIN_LOG_LEVEL=3

# Exponer puerto
EXPOSE 8077

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8077').getcode()"

# Comando de inicio con menos workers para ahorrar RAM
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8077", "--workers", "1"]
