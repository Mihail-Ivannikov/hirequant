# HireQuant



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


