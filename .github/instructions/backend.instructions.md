---
description: Backend coding rules for API handlers, services, validation, and data handling
applyTo: "**/backend/**"
---

# Backend Instructions

## Purpose

Defines how backend code must be implemented.

See:

- [Architecture Documentation](/docs/architecture.md)

---

## API Handlers

- Hono-based routing
- must stay thin
- no business logic

Allowed:

- rate limiting
- validation
- mapping
- calling services
- formatting HTTP responses

Forbidden:

- direct DB access
- complex logic
- returning internal models

---

## Request Flow

```txt
Handler → Rate Limit → Session/Auth → Validation (Zod) → Mapping → Service → Response
```

---

## Validation

- must use schemas (Zod)
- must run before services
- must reject invalid input

Location:

```txt
backend/src/interfaces/http/schemas/
```

---

## Mapping

- DTO ↔ internal model
- must be explicit
- must not leak internal structure

Location:

```txt
backend/src/interfaces/http/mappers/
```

---

## Services

- one service per use case
- contains all business logic
- must be independent

Rules:

- no HTTP
- no Prisma
- no framework code

---

## Repositories

- only place for DB access
- must implement interfaces
- must use Prisma

Location:

```txt
backend/src/infrastructure/repositories/
```

---

## Rate Limiting

- applied at start of handlers
- per endpoint
- uses:
  - user ID (if authenticated)
  - IP (if not)

Location:

```txt
backend/src/interfaces/http/middleware/
```

---

## Error Handling

- never expose internal errors
- always return safe responses
- use consistent error format

---

## Data Rules

- never return DB models directly
- always map to DTOs
- DTOs must be serializable
- dates must be ISO-8601 strings in API responses

---

## Key Rules

- API = thin layer
- services = business logic
- repositories = data access
- validation = mandatory
- mapping = mandatory
