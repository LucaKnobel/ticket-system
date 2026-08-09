# Ticket System Monorepo

This repository contains a small ticket management application as a learning and school project. The goal is to build and understand a complete full-stack workflow with a backend, database, authentication, and frontend. It is not intended for production use, but for practicing architecture, API design, database modeling, and frontend integration.

## What the app can do

- Login and session-based authentication
- View and manage tickets
- Create, view, edit, and delete tickets
- Role-based access with admin and user accounts
- A simple API structure built with Hono and Prisma
- A Vue frontend written in TypeScript

## Tech stack

### Monorepo

- npm workspaces
- one shared lockfile at the repository root
- ESM packages

### Backend

- Node.js + TypeScript
- Hono as the API framework
- Prisma + PostgreSQL
- Zod validation
- Argon2 password hashing
- Pino logging

### Frontend

- Vue 3 + Vite
- Vue Router
- TypeScript + vue-tsc
- Vitest + ESLint

### Shared

- Shared TypeScript models and DTOs
- Zod-based schemas
- Workspace exports for subpath imports such as
  - `@ticket-system/shared/dto/auth`

## Project context

This project is mainly a practice project for:

- Clean-architecture-style structure
- REST API development with Hono
- Database access with Prisma
- Secure form and API validation
- Modern Vue frontend development
- Testing backend and frontend behavior

The focus is on learning and building a clear, well-structured example project rather than delivering a production-ready system.

## Repository layout

```txt
ticket-system/
├── backend/
│   └── src/
│       ├── application/
│       │   ├── errors/
│       │   ├── interfaces/
│       │   ├── models/
│       │   └── services/
│       ├── config/
│       └── infrastructure/
│           ├── db/
│           │   └── repositories/
│           ├── logging/
│           ├── mappers/
│           ├── password-hasher/
│           └── validation/
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── router/
│       └── views/
└── shared/
    └── src/
        └── dto/
```

## Workspaces and local linking

The root `package.json` defines:

- `workspaces: ["backend", "frontend", "shared"]`

Backend and frontend depend on `shared` via the local workspace version `0.1.0`, so the local package folder is linked directly.

## Notes

- Use only npm workspaces for this repository.
- Do not add per-package `package-lock.json` files.
- Keep the shared package version aligned with the backend and frontend dependency versions for local linking.
- This project is intended as a learning example and not as a fully production-ready solution.
