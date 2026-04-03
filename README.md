# Cryptocurrency Data Backend

A secure, production-ready **NestJS** backend that provides authenticated access to real-time cryptocurrency market data via the **CoinMarketCap API**. Built with security-first principles, featuring token rotation with family-based theft detection, rate limiting, and comprehensive API documentation.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Security](#security)
- [Database Schema](#database-schema)
- [Scripts](#scripts)
- [Project Structure](#project-structure)

---

## Features

- **Real-time crypto data** — Latest quotes, detailed info, and global market metrics from CoinMarketCap
- **Secret phrase authentication** — Passwordless auth with auto-generated secret phrases
- **Dual JWT with rotation** — Access + refresh tokens with automatic rotation and family-based theft detection
- **Cookie-based sessions** — Tokens stored in HTTP-only cookies for XSS protection
- **Rate limiting** — Global (10 req/min) and per-endpoint throttling (3 req/min for auth)
- **Request validation** — DTOs with `class-validator` + `class-transformer`
- **Environment validation** — Zod schema validation at startup
- **Swagger/OpenAPI docs** — Interactive API documentation at `/docs`
- **Exception filtering** — Global Prisma exception handling
- **Static file serving** — Built-in static asset support via `/public`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (cookies)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                     │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Auth    │  │  Crypto  │  │  Users   │  │ Prisma │ │
│  │  Module   │  │  Module  │  │  Module  │  │ Module │ │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│        │              │             │             │      │
│  ┌─────┴──────────────┴─────────────┴─────────────┴────┐ │
│  │              Common Layer                            │ │
│  │  Guards · Pipes · Filters · Config · DTOs           │ │
│  └─────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
┌───────────────────────┐  ┌───────────────────────┐
│   Neon (PostgreSQL)   │  │   CoinMarketCap API   │
│   (User data, tokens) │  │   (Market data)       │
└───────────────────────┘  └───────────────────────┘
```

---

## Tech Stack

| Category          | Technology                              |
| ----------------- | --------------------------------------- |
| **Framework**     | NestJS 11                               |
| **Language**      | TypeScript 5.7                          |
| **ORM**           | Prisma 7                                |
| **Database**      | PostgreSQL (Neon serverless)            |
| **Auth**          | JWT (dual token), argon2, bcrypt        |
| **External API**  | CoinMarketCap (`coinmarketcap-js`)      |
| **Validation**    | class-validator, class-transformer, Zod |
| **Documentation** | Swagger / OpenAPI 3.0                   |
| **Rate Limiting** | @nestjs/throttler                       |
| **Testing**       | Jest, Supertest                         |
| **Linting**       | ESLint 9, Prettier                      |

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** (recommended) or npm
- **PostgreSQL** database (Neon recommended for serverless)
- **CoinMarketCap Pro API key** — [Get yours here](https://coinmarketcap.com/api/)

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd nestjs-cryptocurrency-data-backend
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables)).

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate:dev
```

### 4. Start the Server

```bash
# Development (watch mode)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

The API will be available at `http://localhost:3000`.

---

## Environment Variables

| Variable                   | Description                                    | Required                    |
| -------------------------- | ---------------------------------------------- | --------------------------- |
| `DATABASE_URL`             | Neon pooled connection string                  | Yes                         |
| `DIRECT_URL`               | Neon direct connection string (for migrations) | Yes                         |
| `ACCESS_TOKEN_SECRET`      | JWT secret for access tokens (min 16 chars)    | Yes                         |
| `REFRESH_TOKEN_SECRET`     | JWT secret for refresh tokens (min 16 chars)   | Yes                         |
| `SEARCH_HASH_PEPPER`       | Pepper for user search hash (min 16 chars)     | Yes                         |
| `VERIFICATION_HASH_SECRET` | Secret for verification hash (min 16 chars)    | Yes                         |
| `CMC_PRO_API_KEY`          | CoinMarketCap Pro API key                      | Yes                         |
| `NODE_ENV`                 | `development`, `production`, or `testing`      | No (default: `development`) |
| `PORT`                     | Server port                                    | No (default: `3000`)        |

> All environment variables are validated at startup using Zod. The application will refuse to start if any required variable is missing or invalid.

---

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint         | Description                              | Rate Limit |
| ------ | ---------------- | ---------------------------------------- | ---------- |
| `POST` | `/auth/register` | Register new user, returns secret phrase | 3/min      |
| `POST` | `/auth/login`    | Login with secret phrase, sets cookies   | 3/min      |
| `POST` | `/auth/logout`   | Invalidate refresh token, clear cookies  | Global     |
| `POST` | `/auth/refresh`  | Rotate access & refresh tokens           | Global     |

### Cryptocurrency (`/crypto`)

> All endpoints require authentication.

| Method | Endpoint                               | Description                                            |
| ------ | -------------------------------------- | ------------------------------------------------------ |
| `GET`  | `/crypto/quotes/latest`                | Latest market quotes (by symbol, id, or slug)          |
| `GET`  | `/crypto/info`                         | Detailed cryptocurrency metadata                       |
| `GET`  | `/crypto/global-metrics/quotes/latest` | Global market metrics (total market cap, volume, etc.) |

### Static & Docs

| Path    | Description                                |
| ------- | ------------------------------------------ |
| `/docs` | Swagger UI — interactive API documentation |
| `/`     | Static files from `/public` directory      |

---

## Authentication Flow

This API uses a **passwordless secret phrase** authentication system with dual JWT tokens stored in HTTP-only cookies.

### Registration

1. Client calls `POST /auth/register`
2. Server generates a unique **secret phrase** for the user
3. Secret phrase is returned **only once** — the user must save it

### Login

1. Client sends secret phrase to `POST /auth/login`
2. Server validates and issues **access token** (short-lived) + **refresh token** (long-lived)
3. Both tokens are set as HTTP-only cookies

### Token Rotation & Theft Detection

The `AuthGuard` implements a sophisticated token rotation strategy:

```
Request arrives
    │
    ├── Access token valid? ── Yes ──► Grant access
    │
    └── No (expired)
        │
        ├── Refresh token valid & unused? ── Yes ──► Rotate tokens, grant access
        │
        └── Refresh token ALREADY USED? ──► 🚨 THEFT DETECTED
            └── Invalidate entire token family
                Clear all cookies
                Reject request
```

**Family-based detection**: Each login creates a token family. If a refresh token is detected as already-used (meaning a different party used it first), the entire family is invalidated — protecting the user from session hijacking.

---

## Security

| Feature                   | Implementation                                                       |
| ------------------------- | -------------------------------------------------------------------- |
| **XSS protection**        | Tokens in HTTP-only cookies (not accessible via JavaScript)          |
| **Token theft detection** | Family-based refresh token rotation — detects concurrent token usage |
| **Rate limiting**         | Global throttle (10 req/min) + stricter auth endpoints (3 req/min)   |
| **Input validation**      | `class-validator` DTOs + `ParseSecretPhrasePipe`                     |
| **Environment safety**    | Zod schema validation at startup                                     |
| **Password hashing**      | argon2 + bcrypt for credential storage                               |
| **Exception handling**    | Global `PrismaExceptionFilter` prevents leaking internal errors      |
| **Cookie security**       | HTTP-only, secure cookies with proper path configuration             |

---

## Database Schema

```prisma
model users {
  id                String           @id @default(uuid())
  search_hash       String           @unique
  verification_hash String           @unique
  created_at        DateTime         @default(now())
  refreshTokens     refresh_tokens[]
}

model refresh_tokens {
  id         String   @id @default(uuid())
  token      String   @unique
  user       users    @relation(fields: [user_id], references: [id])
  user_id    String
  family_id  String           // Token family for theft detection
  revoked    Boolean  @default(false)
  expired    Boolean  @default(false)
  used       Boolean  @default(false)   // Single-use detection
  expires_at DateTime
  created_at DateTime @default(now())
}
```

---

## Scripts

| Command                      | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `pnpm start:dev`             | Start in development mode with hot reload        |
| `pnpm start:debug`           | Start with Node.js inspector enabled             |
| `pnpm start:prod`            | Run production build (auto-migrates then starts) |
| `pnpm build`                 | Generate Prisma client + compile TypeScript      |
| `pnpm prisma:generate`       | Generate Prisma client                           |
| `pnpm prisma:migrate:dev`    | Run migrations in development                    |
| `pnpm prisma:migrate:deploy` | Deploy migrations (for production)               |
| `pnpm test`                  | Run unit tests                                   |
| `pnpm test:watch`            | Run tests in watch mode                          |
| `pnpm test:cov`              | Run tests with coverage report                   |
| `pnpm test:e2e`              | Run end-to-end tests                             |
| `pnpm lint`                  | Lint and auto-fix with ESLint                    |
| `pnpm format`                | Format code with Prettier                        |

---

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── guards/              # JWT auth guard with token rotation
│   ├── dto/                 # Login DTOs
│   ├── types/               # Auth-related types
│   ├── auth.controller.ts   # /auth endpoints
│   ├── auth.service.ts      # Auth business logic
│   ├── jwt-manager.service.ts  # JWT creation, validation, rotation
│   └── auth.module.ts
├── crypto/                  # Cryptocurrency data module
│   ├── dto/                 # Query DTOs (quotes, info, metrics)
│   ├── crypto.controller.ts # /crypto endpoints
│   ├── crypto.service.ts    # CoinMarketCap API integration
│   └── crypto.module.ts
├── users/                   # User management module
│   ├── types/               # User-related types
│   ├── users.service.ts     # User CRUD operations
│   └── users.module.ts
├── prisma/                  # Prisma service & module
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/                  # Shared utilities
│   ├── config/              # Environment config (Zod validation)
│   ├── filters/             # Global exception filters
│   └── pipes/               # Custom validation pipes
├── app.module.ts            # Root module
├── app.controller.ts        # Health check / root endpoint
└── main.ts                  # Application bootstrap
```

---

## License

UNLICENSED — Private project.
