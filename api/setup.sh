#!/bin/bash

# Script de configuración inicial para Propus API
# Ejecutar con: ./setup.sh

set -e

echo "🚀 Configurando Propus API..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker Desktop."
    exit 1
fi

# Verificar que Docker Compose esté disponible
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está disponible. Actualiza Docker Desktop."
    exit 1
fi

echo "✅ Docker está disponible"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  Por favor edita el archivo .env con tus configuraciones antes de continuar"
    echo "   Especialmente: SECRET_KEY, configuraciones de email y Google OAuth"
fi

# Levantar servicios Docker
echo "🐳 Levantando servicios Docker..."
docker compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar que los servicios estén corriendo
echo "🔍 Verificando servicios..."
if docker compose ps | grep -q "Up"; then
    echo "✅ Servicios Docker corriendo correctamente"
else
    echo "❌ Algunos servicios no están corriendo. Verifica los logs:"
    docker compose logs
    exit 1
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Servicios disponibles:"
echo "  📊 PostgreSQL:    localhost:5433 (usuario: architect_user, contraseña: 1234)"
echo "  🗂️  MinIO Console: http://localhost:9000 (usuario: minio_user, contraseña: minio_password)"
echo "  🔗 MinIO API:     http://localhost:9099"
echo ""
echo "📁 Buckets configurados automáticamente:"
echo "  🌍 public-bucket  - Acceso público"
echo "  🔒 private-bucket - Acceso privado"
echo ""
echo "📚 Próximos pasos:"
echo "  1. Configura tu archivo .env"
echo "  2. Ejecuta las migraciones: alembic upgrade head"
echo "  3. Inicia la aplicación: uvicorn app.main:app --reload"
echo "  4. Visita la documentación: http://localhost:8000/docs"
echo ""
echo "🔧 Comandos útiles:"
echo "  docker compose logs -f     # Ver logs en tiempo real"
echo "  docker compose down        # Detener servicios"
echo "  docker compose restart     # Reiniciar servicios"
