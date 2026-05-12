# Architect App demo

## Overview

**Architect App** is a web platform designed to connect architects, customers, engineers, and suppliers. It provides a secure registration and authentication system, project management features, and role-based access for different user types.

## Features

- **User Registration & Authentication**

  - Register as Architect, Customer, Engineer, or Supplier
  - Google OAuth login and registration ([Login with Google](http://localhost:8000/auth/google/login))
  - Password reset via email
  - JWT-based authentication

- **Role-Based Access**

  - Only architects can create and manage projects
  - Customers and suppliers have dedicated profile information

- **Project Management**

  - Architects can create, update, and list projects
  - Projects support multiple types, currencies, and statuses

- **File Management**
  - Projects can have associated files (BIM models, renders, etc.)

## Tech Stack

- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (asyncpg, SQLAlchemy)
- **ORM:** SQLAlchemy (async)
- **Authentication:** JWT, OAuth2, Google OAuth
- **Email:** SMTP (for password reset)
- **Templating:** Jinja2

## Project Structure

```
app/
  core/         # Configuration, database, security
  models/       # SQLAlchemy models
  routers/      # FastAPI routers (auth, project, etc.)
  schemas/      # Pydantic schemas
  services/     # Business logic (CRUD)
  templates/    # Jinja2 HTML templates
  utils/        # Utility functions (email, tokens, etc.)
main.py         # FastAPI app entrypoint
```

## Setup

### Opción 1: Docker (Recomendado para desarrollo)

1. **Prerrequisitos**

   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
   - Git instalado

2. **Levantar servicios de base de datos y almacenamiento**

   ```sh
   docker compose up -d
   ```

3. **Verificar que los servicios estén corriendo**

   ```sh
   docker compose ps
   ```

4. **Acceso a los servicios:**

   - **PostgreSQL**: `localhost:5433` (usuario: `architect_user`, contraseña: `1234`)
   - **MinIO Console**: http://localhost:9000 (usuario: `minio_user`, contraseña: `minio_password`)
   - **MinIO API**: http://localhost:9099

5. **Buckets configurados automáticamente:**
   - `public-bucket` - Acceso público (sin autenticación)
   - `private-bucket` - Acceso privado (requiere autenticación)

### Opción 2: Instalación manual

1. **Clone the repository**

   ```sh
   git clone <repo-url>
   cd architect_app/app
   ```

2. **Install dependencies**

   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**

   - Copy `.env.example` to `.env` and fill in your settings (database, email, Google OAuth, etc.)

4. **Run database migrations**

   ```sh
   alembic upgrade head
   python scripts/seed_roles.py
   ```

5. **Start the application**

   ```sh
   uvicorn app.main:app --reload
   ```

6. **Access the API docs**

   - Open [http://localhost:8000/docs](http://localhost:8000/docs)

## Docker Services

### Servicios incluidos en docker-compose.yaml:

- **PostgreSQL 15** - Base de datos principal
- **MinIO** - Almacenamiento S3 compatible
- **MinIO Setup** - Configuración automática de buckets

### Comandos útiles de Docker:

```sh
# Levantar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Ver estado
docker compose ps

# Conectar a PostgreSQL
docker exec -it architect_container psql -U architect_user -d architect_db
```
