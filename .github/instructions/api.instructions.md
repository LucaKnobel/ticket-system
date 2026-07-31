---
description: Applied when designing or implementing API endpoints
applyTo: "backend/**/*.ts"
---

# API Rules

## Style

REST API over JSON (Hono + TypeScript).

---

## Endpoints (Current Scope)

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/tickets`
- `GET /api/tickets/{id}`
- `POST /api/tickets`
- `PUT /api/tickets/{id}`
- `DELETE /api/tickets/{id}`

---

## Rules

- One responsibility per endpoint
- Validate input with Zod before service calls
- Enforce auth and role/ownership checks server-side
- Use UUID identifiers
- Return ISO-8601 date strings

---

## Responses

- Consistent structure
- No internal fields
- JSON only
- Proper status codes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `500`)

---

## Errors

- Standard format
- No stack traces
- User-safe messages only
