# ================================
# Dockerfile para Frontend React
# ================================

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Argumentos de build para variables de entorno
ARG REACT_APP_URL_SERVER_VOLUNTARIADO
ARG REACT_APP_MAPBOX_TOKEN

# Setear variables de entorno para el build
ENV REACT_APP_URL_SERVER_VOLUNTARIADO=$REACT_APP_URL_SERVER_VOLUNTARIADO
ENV REACT_APP_MAPBOX_TOKEN=$REACT_APP_MAPBOX_TOKEN
ENV GENERATE_SOURCEMAP=false

# Build de producción
RUN npm run build

# ================================
# Etapa 2: Production con Nginx
# ================================
FROM nginx:alpine

# Copiar build de React
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
