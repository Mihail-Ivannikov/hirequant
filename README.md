# HireQuant

## Project Structure: Where to Find Everything
### `apps/` Directory Breakdown

*   ### `apps/backend/` — The Server (NestJS)
        *   API Endpoints: `apps/backend/src/` (e.g., `applications.controller.ts`, `vacancies.controller.ts`)
        *   Database Schema: `apps/backend/prisma/schema.prisma`
        *   Business Logic: `apps/backend/src/` (e.g., `applications.service.ts`)
        *   Database Seeding Script: `apps/backend/prisma/seed.ts`
        *   Backend Docker Configuration: `apps/backend/Dockerfile`

*   ### `apps/web/` — The Frontend (React)
        *   UI Components: `apps/web/src/components/`
        *   Application Pages: `apps/web/src/pages/` (e.g., `VacancyDetailsPage.tsx`, `EmployerDashboardPage.tsx`)
        *   React Routing: `apps/web/src/App.tsx`
        *   API Request Logic: `apps/web/src/lib/api.ts`
        *   Frontend Docker & Nginx Configuration: `apps/web/Dockerfile` and `apps/web/nginx.conf`

*   ### `apps/python_ai/` — The "AI" service
        *   The Core AI Logic: `apps/python_ai/main.py` (This file contains the vector math, semantic similarity, and scoring algorithms).
        *   Python Dependencies: `apps/python_ai/requirements.txt`
        *   AI Docker Configuration: `apps/python_ai/Dockerfile`

*   ### Root Directory (`/`)
        *   **Orchestration:** `docker-compose.yml.
        *   **Environment Configuration:** `.env`.
        *   **Monorepo Configuration:** `pnpm-workspace.yaml`

## Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS |
| **Backend** | NestJS, TypeScript, Prisma ORM |
| **AI Engine** | Python, FastAPI, PyTorch, HuggingFace Transformers, spaCy |
| **Database** | PostgreSQL |
| **Orchestration** | Docker, Docker Compose, Nginx |

---

## Environment Configuration


# 1. Root `.env` (Infrastructure & Build-Time)

This file is used by Docker Compose to configure ports, database container settings, and frontend build-time variables.

### Step 1 - Create file
Create `.env` in the root directory:

```

./.env

````

### Step 2 — Add configuration

```env

FRONTEND_PORT=8080
BACKEND_PORT=3000
DB_PORT=5432

POSTGRES_USER=<DATABEASE_USER>
POSTGRES_PASSWORD=<YOUR_SUPER_SECURE_DATABASE_PASSWORD>
POSTGRES_DB=<DATABASE_NAME>

VITE_API_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=<YOUR_AUTH0_DOMAIN>
VITE_AUTH0_CLIENT_ID=<YOUR_PUBLIC_AUTH0_CLIENT_ID>
VITE_AUTH0_AUDIENCE=<YOUR_AUTH0_API_AUDIENCE>
````

---

# 2. Backend `.env` (Runtime Application Secrets)

This file is used exclusively by the NestJS backend at runtime.

### Step 1 — Create file

```
./apps/backend/.env
```

### Step 2 — Add configuration

```env


DATABASE_URL="postgresql://<DATABASE_USER>:<DATABASE_PASSWORD>@localhost:5432/<DATABASE_NAME>"

FRONTEND_URL=http://localhost:8080

JWT_SECRET=<YOUR_RANDOM_JWT_SECRET_STRING>
JWT_EXPIRATION_TIME=7d
PIN_CODE_VALIDITY_MINUTES=10

AUTH0_ISSUER_URL=https://<YOUR_AUTH0_DOMAIN>/
AUTH0_AUDIENCE=<YOUR_AUTH0_API_AUDIENCE>

TELEGRAM_BOT_TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
TELEGRAM_CHAT_ID=<YOUR_TELEGRAM_CHAT_ID>
TELEGRAM_BOT_USERNAME=<YOUR_TELEGRAM_BOT_USERNAME>
```


## Run the Project

### Build and start all services

```bash
docker-compose up -d --build
```

This command will:

* Build frontend, backend, and AI services
* Start PostgreSQL database container
* Create persistent Docker volumes
* Launch all services in detached mode

Initial build may take 5–10 minutes.

After completion:

```
Frontend: http://localhost:8080
```

---


