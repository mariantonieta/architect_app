# Troubleshooting - Propus API

## Problemas Comunes y Soluciones

### 🐳 Docker

#### Los contenedores no inician
```bash
# Ver logs detallados
docker compose logs

# Verificar si hay conflictos de puertos
lsof -i :5433  # PostgreSQL
lsof -i :9000  # MinIO Console  
lsof -i :9099  # MinIO API

# Si hay conflictos, detener servicios y reiniciar
docker compose down
docker compose up -d
```

#### Error: "bind source path does not exist"
Este error ya fue corregido en el docker-compose.yaml actual. Si persiste:
```bash
docker compose down -v
docker compose up -d
```

#### MinIO setup container no ejecuta
```bash
# Verificar logs del setup
docker logs minio_setup

# Reiniciar solo el setup
docker compose restart minio-setup
```

### 🗄️ Base de Datos

#### No puedo conectar a PostgreSQL
```bash
# Verificar que el contenedor esté corriendo
docker ps | grep architect_container

# Conectar directamente al contenedor
docker exec -it architect_container psql -U architect_user -d architect_db

# Si no funciona, verificar logs
docker logs architect_container
```

#### Error de migraciones de Alembic
```bash
# Verificar estado de migraciones
alembic current

# Ejecutar migraciones
alembic upgrade head

# Si hay errores, revisar la conexión a la DB en alembic.ini
```

### 🗂️ MinIO

#### No puedo acceder a la consola web
1. Verificar que el contenedor esté corriendo: `docker ps`
2. Intentar acceder a: http://localhost:9000
3. Credenciales: `minio_user` / `minio_password`

```bash
# Reiniciar MinIO
docker compose restart s3
```

#### Los buckets no se crearon automáticamente
```bash
# Verificar logs del setup
docker logs minio_setup

# Ejecutar setup manualmente
docker compose run --rm minio-setup
```

#### Error: "The Access Key Id you provided does not exist"
Verificar credenciales en:
- docker-compose.yaml (MINIO_ROOT_USER/PASSWORD)
- .env (MINIO_ACCESS_KEY/SECRET_KEY)
- Cliente MinIO (mc alias)

### 🔧 Aplicación FastAPI

#### Error: "could not connect to server"
La aplicación no puede conectar a la base de datos:
1. Verificar que PostgreSQL esté corriendo: `docker compose ps`
2. Verificar DATABASE_URL en .env
3. Verificar que el puerto 5433 esté disponible

#### Error de importación de módulos
```bash
# Verificar que estés en el directorio correcto
cd propus-api

# Activar el entorno virtual
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### Error: "GOOGLE_CLIENT_ID not found"
Configurar las variables de Google OAuth en .env:
```
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### 🌐 Problemas de Red

#### Puertos ya en uso
```bash
# Encontrar qué proceso usa el puerto
lsof -i :5433
lsof -i :9000
lsof -i :9099

# Matar proceso si es necesario
kill -9 PID

# O cambiar puertos en docker-compose.yaml
```

#### CORS errors en el frontend
Agregar la URL del frontend a BACKEND_CORS_ORIGINS en .env:
```
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

### 🔄 Reset Completo

Si nada funciona, reset completo:
```bash
# Detener y eliminar todo (¡CUIDADO: borra datos!)
docker compose down -v

# Eliminar imágenes (opcional)
docker system prune -a

# Volver a crear todo
docker compose up -d

# Ejecutar migraciones
alembic upgrade head
```

### 📞 Obtener Ayuda

1. **Logs detallados:**
   ```bash
   docker compose logs -f
   ```

2. **Estado de servicios:**
   ```bash
   docker compose ps
   docker stats
   ```

3. **Información del sistema:**
   ```bash
   docker version
   docker compose version
   ```

4. **Variables de entorno:**
   ```bash
   cat .env
   ```
