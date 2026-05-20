# Backend Technical Documentation: HR-Helper API

This documentation outlines the **current state, architecture, and logic** of the HR-Helper Backend API. It serves as a technical reference for the work completed to date.

---

## 1. Tech Stack

- **Framework:** NestJS (Node.js)  
- **Database ORM:** Prisma  
- **Database:** PostgreSQL  
- **Identity Provider:** Auth0 (via Passport.js)  
- **Language:** TypeScript  

---

## 2. Project Structure

The backend code is located in `apps/backend/src`. Key files include:

- **main.ts:** Application entry point, global configurations (CORS, Pipes, Headers)  
- **prisma.service.ts:** Global singleton for database connection  

**auth/**  

- **auth.controller.ts:** Endpoints for user identity management  
- **auth.service.ts:** Business logic for syncing users with Auth0  
- **jwt.strategy.ts:** Logic for validating and decoding incoming Auth0 tokens  
- **auth.module.ts:** Wiring for the authentication logic  

---

## 3. Database Schema (Prisma)

The database has been refactored to use **CUIDs** (string-based unique identifiers) for scalability and reliability.

### Core Models

- **User:** Central identity model  
  - Stores `auth0Id` (link to Auth0) and `email`  
  - Roles: `CANDIDATE` or `EMPLOYER`  

- **CandidateProfile:** Specific data for job seekers  
  - One-to-one relationship with User  
  - Stores `fullName`, `resumeUrl`, and `skills`  

- **Vacancy:** Job postings created by Employers  
  - One-to-many relationship with User (Employer)  

- **Application:** Links a Candidate to a Vacancy  
  - Tracks status: `PENDING`, `ACCEPTED`, `REJECTED`  

---

## 4. Authentication & Identity Logic

The backend does **not manage passwords**. It uses a **Synchronization Pattern** to mirror Auth0 identities into the local PostgreSQL database.

### The `sync-user` Process

When a user logs into the frontend, the backend receives a JWT. The following logic is executed:

1. **Token Validation:**  
   - Validates JWT signature  
   - Ensures `email_verified` is true in Auth0  

2. **Identity Extraction:**  
   - Extracts `sub` (Auth0 ID) and `email` from namespaced claims  

3. **Database Lookup:**  
   - **If `auth0Id` exists:** return the user  
   - **If email exists (legacy link):** update with new `auth0Id`  
   - **If neither exists:** create a new User record  

---

## 5. Global Configurations (`main.ts`)

- **Helmet:** Sets secure HTTP headers automatically  
- **CORS:** Dynamically allows access from the frontend URL; blocks unauthorized origins  
- **Validation Pipe:**  
  - `whitelist: true` → strips any data not defined in DTOs  
  - `transform: true` → converts network data to TypeScript classes  

### Environment Variables

- `DATABASE_URL`: Connection string for PostgreSQL  
- `AUTH0_AUDIENCE`: API identifier from Auth0  
- `AUTH0_ISSUER_URL`: Auth0 domain URL  
- `FRONTEND_URL`: URL of the React application  

---

## 6. Current API Endpoints

### Auth Module

| Method | Endpoint     | Description                               | Auth Required |
|--------|-------------|-------------------------------------------|---------------|
| POST   | /auth/sync  | Syncs the Auth0 user with the local DB    | Yes (JWT)     |

---

## 7. Development Commands

- `pnpm run start:dev` → Starts NestJS server in watch mode  
- `npx prisma studio` → Opens visual database editor  
- `npx prisma migrate dev` → Applies schema changes  
- `npx prisma generate` → Rebuilds Prisma Client types  

---

## Summary of Work Done

The backend has been upgraded from a basic NestJS setup with integer IDs to a **robust identity-linked system**.  

- Successfully verifies external tokens  
- Extracts verified user data  
- Maintains a local `User` profile synchronized with Auth0  
- Ensures data integrity with strict Prisma constraints
