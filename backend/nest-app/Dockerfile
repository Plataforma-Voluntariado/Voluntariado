# ================================
# Dockerfile para NestJS Backend
# ================================

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo dev para el build)
RUN npm ci && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Build de NestJS
RUN npm run build

# ================================
# Etapa 2: Production
# ================================
FROM node:20-alpine

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar build y archivos necesarios
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/Bd ./Bd  # Ya no necesario, BD está en Railway
# COPY --from=builder /app/uploads ./uploads  # Se crea en runtime

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV SERVER_PORT=5560

# Exponer puerto
EXPOSE 5560

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5560/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main.js"]
