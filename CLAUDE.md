# Ottero Monorepo

## Architecture

Ottero is a full-stack invoicing application in a monorepo structure:

| Directory | Type | Tech Stack |
|-----------|------|------------|
| `frontend/` | Web App | React 18, TypeScript, Vite, Radix UI, Tailwind, TanStack Query |
| `backend/` | API | Java 21, Spring Boot 3, JPA/Hibernate, MapStruct |
| `infra/` | Infrastructure | Kubernetes, Docker, GitHub Actions |

## How They Connect

- Frontend calls backend via REST API at `/api/...` endpoints
- Authentication: Auth0 (OAuth2 with JWT tokens)
- Production URL: https://ottero.com.au

## Key Entities

- **Invoice**: DRAFT, SENT, PAID, CANCELLED statuses
- **Quote**: Can be converted to Invoice
- **Customer/Client**: Customer information
- **Company**: Multi-tenant - each user has companies

## Frontend Patterns

- Pages in `frontend/src/pages/`
- Components in `frontend/src/components/` with Radix UI primitives
- Hooks in `frontend/src/hooks/` using TanStack Query
- State: Zustand for global state (`useAppStore`)
- Types in `frontend/src/types/index.ts`

## Backend Patterns

- Controllers in `backend/src/main/java/io/quickledger/controllers/`
- Services in `backend/src/main/java/io/quickledger/services/`
- Repositories in `backend/src/main/java/io/quickledger/repositories/`
- DTOs in `backend/src/main/java/io/quickledger/dto/`
- MapStruct mappers in `backend/src/main/java/io/quickledger/mappers/`

## Deployment

- K8s context: `ottero-prod`
- Images: `ghcr.io/ai-soft-labs/ottero-frontend`, `ghcr.io/ai-soft-labs/ottero-backend`
- CI/CD: GitHub Actions (frontend-ci.yml, backend-ci.yml, deploy.yml)
