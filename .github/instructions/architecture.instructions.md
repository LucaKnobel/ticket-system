---
description: Compact architecture rules for Clean Architecture and project structure
applyTo: "**/backend/**"
---

# Architecture Instructions

## Purpose

Defines **mandatory architecture rules** for backend code.

See full details:

- [Architecture Documentation](/docs/architecture.md)

---

## Architecture Style

3-layer Clean Architecture:

1. Application Business Rules
2. Interface Adapters
3. Frameworks & Drivers

---

## Dependency Rule

```txt
Interfaces/Infrastructure → Application
```

Forbidden:

- Prisma in application
- Hono in application
- business logic in HTTP routes

---

## Layer Rules

### Application (`backend/src/application/`)

- models → domain only
- services → business logic
- interfaces → abstractions

Rules:

- no HTTP
- no Prisma
- no framework code

---

### Interface Adapters (`backend/src/interfaces/http/`)

- routes/handlers = controllers
- schemas = validation
- mappers = DTO ↔ model
- middleware = rate-limit/authn/authz hooks

Rules:

- no business logic
- no DB access

---

### Infrastructure (`backend/src/infrastructure/`)

- Prisma
- repositories
- external services

Rules:

- implements interfaces only
- no business logic

---

## Request Flow

```txt
Hono Route → Rate Limit → Session/Auth → Validation (Zod) → Mapping → Service → Repository → Prisma
```

---

## Rate Limiting

- located in `backend/src/interfaces/http/middleware/`
- applied at start of handlers
- uses:
  - user ID (authenticated)
  - IP (unauthenticated)

---

## DTO & Validation

- DTOs → `shared/types/`
- validation → `backend/src/interfaces/http/schemas/`
- mapping → `backend/src/interfaces/http/mappers/`

Rules:

- no internal models exposed
- no Prisma types in DTOs

---

## Key Rules

- business logic → application only
- API must stay thin
- always validate input
- always map data
- never expose internals
