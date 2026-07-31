---
description: Database and Prisma usage rules for persistence, schema design, and data access
applyTo: "**/backend/**"
---

# Database Instructions

## Purpose

Defines how persistence is implemented with Prisma ORM and PostgreSQL.

See:

- [Architecture Documentation](/docs/architecture.md)

---

## Core Rules

- Prisma is the only DB access layer
- No direct DB access outside repositories
- No Prisma usage in application services
- No raw SQL unless absolutely necessary

---

## Structure

- Prisma schema: `backend/prisma/schema.prisma`
- Prisma client setup: `backend/src/infrastructure/prisma/`
- Repositories: `backend/src/infrastructure/repositories/`
- Repository interfaces: `backend/src/application/interfaces/`

---

## Data Model Scope

Primary entities:

- users
- tickets
- sessions

Enums:

- Role (`USER`, `ADMIN`)
- TicketStatus (`OPEN`, `IN_PROGRESS`, `CLOSED`)
- TicketPriority (`LOW`, `MEDIUM`, `HIGH`)

Rules:

- UUID primary keys
- unique email on users
- unique token hash on sessions
- timestamps for create/update where applicable
- foreign keys for ownership and assignment relations

---

## Repository Rules

Repositories are responsible for:

- Prisma queries
- persistence mapping
- ownership filters in queries
- transactional consistency

Repositories must not contain:

- business rules
- HTTP concerns
- DTO validation

---

## Mapping Rules

- Map Prisma results to domain models
- Map domain models to Prisma inputs
- Never return raw Prisma objects directly from API boundary

---

## Migrations and Seed

- Use Prisma migrations only
- Never manually modify production schema outside migrations
- Keep migrations reproducible and committed
- Seed users and sample tickets through seed scripts
- Do not implement public user registration if out of scope

---

## Session Persistence

- Store only hashed session tokens
- Never store plaintext session tokens
- Validate session expiry (`expires_at`) on protected requests
- Delete session record on logout

---

## Performance and Integrity

- Select only required fields
- Use transactions for multi-step writes
- Keep referential integrity strict
- Add indexes for frequent lookup paths (email, token hash, ticket ownership)

---

## Key Rules

- Prisma only in infrastructure
- repositories own DB access
- mapping is mandatory
- session-token hashing is mandatory
