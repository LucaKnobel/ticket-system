# Ticket System Monorepo

This repository is an npm workspace monorepo with three packages:

- `@ticket-system/backend` - API server and business logic
- `@ticket-system/frontend` - Vue single-page application
- `@ticket-system/shared` - shared TypeScript library (DTO schemas and types)

## Tech Stack

### Monorepo

- npm workspaces
- one lockfile at root (`package-lock.json`)
- ESM (`"type": "module"`) packages

### Backend (`backend/`)

- Node.js + TypeScript (`NodeNext`)
- Hono (`@hono/node-server`)
- Prisma + PostgreSQL (`@prisma/client`, `@prisma/adapter-pg`)
- Zod validation
- Argon2 password hashing
- Pino logging

### Frontend (`frontend/`)

- Vue 3 + Vite
- Vue Router
- TypeScript + `vue-tsc`
- Vitest + ESLint

### Shared (`shared/`)

- TypeScript library built to `dist/`
- Zod-based shared DTO schemas
- package `exports` for direct subpath imports like:
  - `@ticket-system/shared/dto/auth`

## Repository Layout

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

## How Workspaces Are Wired

Root `package.json` defines:

- `workspaces: ["backend", "frontend", "shared"]`

Backend and frontend depend on shared via version `0.1.0`:

- `"@ticket-system/shared": "0.1.0"`

Because the local workspace package has the same name and version, npm links it locally from `./shared` (instead of pulling from a registry).

## Shared Package Contract

`shared/package.json` exports:

- `.` -> `./dist/index.js` + `./dist/index.d.ts`
- `./dto/*` -> `./dist/dto/*.js` + `./dist/dto/*.d.ts`

This allows imports such as:

```ts
import { LoginRequestSchema } from "@ticket-system/shared/dto/auth";
```

Current auth DTO module (`shared/src/dto/auth.ts`) exports:

- `LoginRequestSchema`
- `LoginRequestDto`
- `LoginResponseSchema`
- `LoginResponseDto`

## Setup

Requirements:

- Node.js 24+ recommended
- npm 10+

Install all workspace dependencies from the root:

```bash
npm install
```

## Root Scripts

Run these from the repository root:

- `npm run clean`
  - cleans `shared/dist`, `backend/dist`, `frontend/dist`
- `npm run build`
  - builds in order: shared -> backend -> frontend
- `npm run type-check`
  - builds shared and backend, then runs frontend type-check
- `npm run dev:shared`
  - starts shared TypeScript watch build
- `npm run dev:backend`
  - starts backend dev server (`tsx watch`)
- `npm run dev:frontend`
  - starts frontend dev server (`vite`)

## Typical Development Flow

1. Install dependencies once at root:

```bash
npm install
```

2. Start shared watch mode (if editing shared DTOs/types):

```bash
npm run dev:shared
```

3. In separate terminals, start backend and frontend:

```bash
npm run dev:backend
npm run dev:frontend
```

4. Validate before pushing:

```bash
npm run build
npm run type-check
```

## Using Shared DTOs in Backend and Frontend

Backend example:

```ts
import { LoginRequestSchema } from "@ticket-system/shared/dto/auth";
```

Frontend example:

```ts
import {
  LoginResponseSchema,
  type LoginResponseDto,
} from "@ticket-system/shared/dto/auth";
```

If you add a new DTO module (for example `shared/src/dto/ticket.ts`), it is automatically available as:

- `@ticket-system/shared/dto/ticket`

after rebuilding shared.

## Important Notes

- Use only npm workspaces for this repo.
- Do not add per-package `package-lock.json` files.
- Keep shared package version aligned with backend/frontend dependency version for local linking.
