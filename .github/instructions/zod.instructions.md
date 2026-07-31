---
description: Zod validation rules for request schemas, DTO contracts, and safe parsing
applyTo: "**/*.ts"
---

# Zod Instructions

## Purpose

Defines how Zod is used for runtime validation in frontend and backend.

---

## Core Rules

- Validate all external input with Zod
- Backend validation is mandatory and authoritative
- Frontend validation improves UX but never replaces backend validation
- Use `safeParse` for expected validation failures
- Return user-safe validation errors

---

## Backend Usage

Location:

```txt
backend/src/interfaces/http/schemas/
```

Rules:

- One schema module per endpoint/use case when practical
- Validate params, query, and body explicitly
- Strip or reject unknown fields according to endpoint policy
- Run validation before calling services
- Map validated DTOs to internal models before business logic

---

## Frontend Usage

Suggested location:

```txt
frontend/src/validation/
```

Rules:

- Reuse shared DTO schemas where possible
- Keep form schema logic outside view components
- Show clear field-level error messages

---

## Schema Design

- Compose small schemas with `extend`, `pick`, `omit`, `merge`, `union`
- Keep schemas readable and domain-focused
- Prefer explicit enums for role/status/priority values
- Use `transform` and `refine` only when needed and clearly documented

---

## Error Handling

- Never throw raw parser output to clients
- Convert Zod errors to stable API error format
- Never leak stack traces or internal implementation details

---

## Testing

- Unit-test important schemas with valid and invalid cases
- Cover edge cases (empty strings, invalid UUIDs, enum mismatches)
- Add integration tests for endpoint validation behavior

---

## Key Rules

- validate before service calls
- backend validation is mandatory
- keep schemas small and composable
- return safe and consistent validation errors
