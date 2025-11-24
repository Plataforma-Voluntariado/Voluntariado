# 🐳 Guía de Despliegue con Docker

Esta guía te ayudará a levantar todo el backend con Docker Compose.

---

## 📋 **Pre-requisitos**

- ✅ Docker Desktop instalado
- ✅ Las 5 imágenes ya construidas (nest-app, api-sentimiento, api-verificador, api-certificados, redis)
- ✅ Base de datos MySQL en la nube (PlanetScale/Railway/Aiven)

---

## 🚀 **Paso 1: Configurar Variables de Entorno**

### **1.1 Copia el archivo de ejemplo:**

```bash
cd backend
cp .env.example .env
```

### **1.2 Edita el archivo `.env` con tus credenciales:**

```bash
# Obligatorios:
DB_HOST=tu-host.psdb.cloud
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_DATABASE=bd_voluntariado

JWT_SECRET=tu_secreto_super_seguro
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret

MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password

# Opcionales:
ROBOFLOW_API_KEY=tu_key  # Para verificación de documentos
PDFLAYER_ACCESS_KEY=tu_key  # Para generación de certificados
```

---

## 🏃 **Paso 2: Levantar los Servicios**

### **Opción A: Todo en un comando**

```bash
docker-compose up -d
```

### **Opción B: Con logs visibles**

```bash
docker-compose up
```

### **Opción C: Solo algunos servicios**

```bash
# Solo backend principal + Redis
docker-compose up -d nest-app redis

# Solo APIs de Python
docker-compose up -d api-verificador api-sentimiento api-certificados
```

---

## 📊 **Paso 3: Verificar Estado**

### **Ver servicios activos:**

```bash
docker-compose ps
```

Deberías ver algo como:

```
NAME                        STATUS              PORTS
voluntariado-nest           Up 2 minutes        0.0.0.0:5560->5560/tcp
voluntariado-redis          Up 2 minutes        0.0.0.0:6379->6379/tcp
voluntariado-verificador    Up 2 minutes        8001/tcp
voluntariado-sentimiento    Up 2 minutes        8077/tcp
voluntariado-certificados   Up 2 minutes        8002/tcp
```

### **Ver logs:**

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio específico
docker-compose logs -f nest-app
docker-compose logs -f api-sentimiento
```

### **Health checks:**

```bash
# Verificar que todo esté saludable
docker ps
# Busca "(healthy)" en la columna STATUS
```

---

## 🧪 **Paso 4: Probar las APIs**

### **Backend NestJS:**

```bash
# Endpoint de prueba
curl http://localhost:5560

# Health check (si existe)
curl http://localhost:5560/api/health
```

### **APIs de Python (internamente):**

Estas APIs solo son accesibles desde dentro de la red Docker:

```bash
# Entrar al contenedor nest-app
docker exec -it voluntariado-nest sh

# Probar desde dentro
wget -O- http://api-verificador:8001/
wget -O- http://api-sentimiento:8077/
wget -O- http://api-certificados:8002/docs
```

---

## 🛑 **Comandos Útiles**

### **Detener servicios:**

```bash
# Detener sin borrar contenedores
docker-compose stop

# Detener y borrar contenedores
docker-compose down

# Detener, borrar contenedores y volúmenes
docker-compose down -v
```

### **Reiniciar un servicio:**

```bash
docker-compose restart nest-app
docker-compose restart api-sentimiento
```

### **Ver uso de recursos:**

```bash
docker stats
```

### **Limpiar todo:**

```bash
# Detener y limpiar
docker-compose down -v

# Limpiar imágenes no usadas
docker image prune -a
```

---

## 🔧 **Troubleshooting**

### **Problema: "Cannot connect to database"**

**Solución:**
1. Verifica que tu BD en la nube esté activa
2. Revisa las credenciales en `.env`
3. Asegúrate que permita conexiones desde cualquier IP

```bash
# Probar conexión desde el contenedor
docker exec -it voluntariado-nest sh
ping aws.connect.psdb.cloud
```

### **Problema: "api-sentimiento tarda mucho en arrancar"**

**Normal.** PyTorch tarda ~1-2 minutos en cargar los modelos.

```bash
# Ver logs
docker-compose logs -f api-sentimiento
```

### **Problema: "redis connection refused"**

**Solución:**
1. Verifica que Redis esté corriendo:

```bash
docker-compose ps redis
docker-compose logs redis
```

2. Reinicia Redis:

```bash
docker-compose restart redis
```

### **Problema: Contenedor se reinicia constantemente**

**Solución:**

```bash
# Ver por qué falla
docker-compose logs <servicio>

# Inspeccionar health check
docker inspect <contenedor-id>
```

---

## 📦 **Estructura de Red**

Los servicios se comunican dentro de la red `voluntariado-network`:

```
voluntariado-network (172.x.x.x)
├── redis (6379)
├── nest-app (5560) ← Expuesto al host
├── api-verificador (8001) ← Solo interno
├── api-sentimiento (8077) ← Solo interno
└── api-certificados (8002) ← Solo interno
```

**Acceso externo:**
- ✅ `nest-app`: http://localhost:5560
- ✅ `redis`: localhost:6379
- ❌ FastAPIs: Solo accesibles internamente

---

## 🌐 **Conectar Frontend**

En tu `.env` del frontend (React):

```env
REACT_APP_URL_SERVER_VOLUNTARIADO=http://localhost:5560
```

Luego:

```bash
cd ../frontend
npm start
```

---

## 🚀 **Despliegue a Producción (Railway)**

### **1. Instala Railway CLI:**

```bash
npm install -g @railway/cli
railway login
```

### **2. Crea un nuevo proyecto:**

```bash
railway init
```

### **3. Configura variables de entorno:**

En Railway Dashboard > Variables, copia todas las de tu `.env`

### **4. Deploy:**

```bash
railway up
```

Railway automáticamente:
- ✅ Detecta `docker-compose.yml`
- ✅ Crea servicios por cada imagen
- ✅ Configura networking interno
- ✅ Asigna URLs públicas

---

## 📝 **Notas Importantes**

1. **Base de Datos**: Debe estar en la nube (PlanetScale/Railway/Aiven)
2. **Redis**: Se levanta automáticamente con Docker
3. **FastAPIs**: Solo se comunican internamente con NestJS
4. **Uploads**: Se guardan en volumen `./nest-app/uploads`
5. **Memoria**: `api-sentimiento` está limitado a 2GB RAM

---

## 🆘 **Necesitas ayuda?**

```bash
# Ver documentación de un servicio
docker-compose logs <servicio>

# Entrar a un contenedor
docker exec -it <nombre-contenedor> sh

# Ver red
docker network inspect voluntariado-network
```

---

¡Listo! Tu backend debería estar corriendo en **http://localhost:5560** 🎉
