# Environment Setup Guide

Este documento explica cómo configurar las variables de entorno para el proyecto Architect.

## Configuración Inicial

1. **Copia el archivo de ejemplo:**

   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env`** con los valores específicos de tu entorno.

## Variables de Entorno

### 🗄️ Base de Datos

```bash
USER_DB=architect_user          # Usuario de la base de datos
HOST_DB=localhost              # Host de la base de datos
PORT_DB=5433                   # Puerto de la base de datos
USER_PASSWORD=your_password    # Contraseña del usuario
NAME_DB=architect_db          # Nombre de la base de datos
```

### 🔐 Seguridad y JWT

```bash
SECRET_KEY=your-secret-key                # Clave secreta para JWT (usar openssl rand -hex 32)
ALGORITHM=HS256                           # Algoritmo de encriptación
ACCESS_TOKEN_EXPIRE_MINUTES=10080         # Duración del token de acceso (minutos)
EMAIL_RESET_TOKEN_EXPIRE_HOURS=48         # Duración del token de reset (horas)
```

### 🏢 Aplicación

```bash
PROJECT_NAME=Architect Project    # Nombre del proyecto
```

### 🔑 Google OAuth

Para configurar Google OAuth:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Crea credenciales OAuth 2.0
5. Configura las URIs de redirección autorizadas

```bash
GOOGLE_CLIENT_ID=your-google-client-id        # ID del cliente OAuth
GOOGLE_CLIENT_SECRET=your-google-client-secret # Secreto del cliente OAuth
```

### 📧 Configuración de Email

```bash
emails_enabled=true                    # Habilitar envío de emails
EMAILS_FROM_NAME="Architect"          # Nombre del remitente
EMAILS_FROM_EMAIL=no-reply@architect.com # Email del remitente

# Configuración SMTP
SMTP_HOST=smtp.gmail.com              # Servidor SMTP
SMTP_PORT=587                         # Puerto SMTP
SMTP_TLS=true                         # Usar TLS
SMTP_SSL=false                        # Usar SSL
SMTP_USER=your-smtp-username          # Usuario SMTP
SMTP_PASSWORD=your-smtp-password      # Contraseña SMTP
```

#### Proveedores de Email Recomendados:

**Gmail:**

- Host: `smtp.gmail.com`
- Puerto: `587`
- Requiere contraseña de aplicación (no la contraseña normal)

**Mailtrap (para testing):**

- Host: `sandbox.smtp.mailtrap.io`
- Puerto: `2525`
- Crear cuenta en [mailtrap.io](https://mailtrap.io/)

### 📁 MinIO (Almacenamiento de Archivos)

```bash
MINIO_ENDPOINT=localhost:9099          # Endpoint de MinIO
MINIO_ACCESS_KEY=minio_user           # Clave de acceso
MINIO_SECRET_KEY=minio_password       # Clave secreta
MINIO_BUCKET_NAME=public-bucket       # Nombre del bucket
MINIO_ROOT_USER=minio_user            # Usuario root
MINIO_ROOT_PASSWORD=minio_password    # Contraseña root
```

## Configuración de Desarrollo vs Producción

### Desarrollo

- Usa `localhost` para servicios locales
- Usa Mailtrap para testing de emails
- Las claves pueden ser valores de ejemplo (pero cámbialas por seguridad)

### Producción

- **NUNCA** uses valores de ejemplo en producción
- Usa servicios en la nube para base de datos y almacenamiento
- Configura un servidor SMTP real
- Genera claves secretas seguras
- Usa HTTPS en todas las URLs

## Generación de Claves Seguras

Para generar una clave secreta segura:

```bash
openssl rand -hex 32
```

## Verificación de Configuración

Para verificar que tu configuración es correcta:

1. **Base de datos:** Verifica que puedas conectarte con los parámetros proporcionados
2. **Email:** Envía un email de prueba
3. **MinIO:** Verifica que puedas subir archivos
4. **Google OAuth:** Prueba el login con Google

## Troubleshooting

### Error de conexión a base de datos

- Verifica que PostgreSQL esté ejecutándose
- Confirma usuario, contraseña y puerto
- Verifica que la base de datos existe

### Error de email

- Confirma credenciales SMTP
- Verifica configuración TLS/SSL
- Para Gmail, usa contraseña de aplicación

### Error de MinIO

- Verifica que MinIO esté ejecutándose
- Confirma endpoint y credenciales
- Verifica que el bucket existe

## Seguridad

⚠️ **Importante:**

- Nunca subas el archivo `.env` al repositorio
- Usa diferentes valores para desarrollo y producción
- Rota las claves regularmente
- Usa servicios seguros en producción
