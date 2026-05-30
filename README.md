# Cryptocurrency Data Backend

A secure, production-ready **NestJS 11** backend that provides authenticated access to real-time cryptocurrency market data via the **CoinGecko API** (public, no API key required). Features passwordless authentication with dual JWT token rotation and family-based theft detection, rate limiting, and comprehensive Swagger documentation.

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

- **17 CoinGecko API endpoints** — Prices, market data, charts, OHLC, categories, contracts, and more
- **Secret phrase authentication** — Passwordless auth with auto-generated 3-word secret phrases
- **Dual JWT with rotation** — Access (60 min) + refresh (30 day) tokens automatic rotation
- **Family-based theft detection** — Detects concurrent token usage and revokes entire token families
- **Cookie-based sessions** — Tokens stored in HTTP-only cookies (`ssaeat`, `udssrt`) for XSS protection
- **Rate limiting** — Global (10 req/min) and stricter auth endpoints (3 req/min)
- **Centralized error handling** — CoinGecko errors mapped to RFC 7807 Problem Details via axios interceptor
- **Request validation** — DTOs with `class-validator` + `class-transformer`
- **Environment validation** — Zod v4 schema validation at startup
- **Swagger/OpenAPI docs** — Interactive API documentation at `/docs`
- **Prisma exception filtering** — 20+ Prisma error codes mapped to proper HTTP statuses
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
│   Neon (PostgreSQL)   │  │   CoinGecko API       │
│   (User data, tokens) │  │   (Market data)       │
└───────────────────────┘  └───────────────────────┘
```

### Crypto Layer

The **CryptoModule** communicates with the CoinGecko public API (`https://api.coingecko.com/api/v3`) using `@nestjs/axios` `HttpService.axiosRef`:

- **Base URL** hardcoded in `HttpModule.register({ baseURL: 'https://api.coingecko.com/api/v3' })` — no API key required
- **Error handling** via centralized axios response interceptor in `onModuleInit` (Option A) — maps all CoinGecko errors to `ProblemDetailsException` (RFC 7807)
- **Fully typed** — all 17 endpoints use `axiosRef.get<T>()` generics; response types inferred end-to-end, no `any` in crypto layer
- **Query DTOs** passed directly as `axiosRef.get(path, { params: query })` — no manual property mapping

---

## Tech Stack

| Category          | Technology                                    |
| ----------------- | --------------------------------------------- |
| **Framework**     | NestJS 11                                     |
| **Language**      | TypeScript 5.7                                |
| **ORM**           | Prisma 7 (Neon serverless adapter)            |
| **Database**      | PostgreSQL (Neon serverless)                  |
| **Auth**          | Dual JWT + argon2id (no passwords)            |
| **External API**  | CoinGecko (public, no key)                    |
| **HTTP Client**   | `@nestjs/axios` + `axios`                    |
| **Validation**    | class-validator, class-transformer, Zod v4    |
| **Documentation** | Swagger / OpenAPI 3.0                         |
| **Rate Limiting** | `@nestjs/throttler`                           |
| **Testing**       | Jest 30, Supertest                            |
| **Linting**       | ESLint 9 (flat config), Prettier              |

---

## Prerequisites

- **Node.js** >= 20
- **npm** (or pnpm)
- **PostgreSQL** database (Neon serverless recommended)
- No API key needed — CoinGecko is public

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd nestjs-cryptocurrency-data-backend
npm install
```

> **Note**: Project was migrated from pnpm to npm. Use `npm` for all package operations.

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables)).

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev
```

### 4. Start the Server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
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
| `SEARCH_HASH_PEPPER`       | Pepper for HMAC search hash (min 16 chars)     | Yes                         |
| `VERIFICATION_HASH_SECRET` | Secret for argon2id verification hash          | Yes                         |
| `NODE_ENV`                 | `development`, `production`, `testing`         | No (default: `development`) |
| `PORT`                     | Server port                                    | No (default: `3000`)        |

> All environment variables are validated at startup using **Zod v4**. The application will refuse to start if any required variable is missing or invalid.
>
> No CoinGecko API key is needed — the public API is used directly.

---

## API Endpoints

### Health Check

| Method | Endpoint   | Auth | Description       |
| ------ | ---------- | ---- | ----------------- |
| `GET`  | `/health`  | No   | Health check      |

### Authentication (`/auth`)

| Method | Endpoint         | Rate Limit | Description                             |
| ------ | ---------------- | ---------- | --------------------------------------- |
| `POST` | `/auth/register` | 3/min      | Register new user, returns secret phrase (shown once) |
| `POST` | `/auth/login`    | 3/min      | Login with secret phrase, sets cookies  |
| `POST` | `/auth/logout`   | Global     | Invalidate entire token family          |
| `POST` | `/auth/refresh`  | Global     | Rotate access & refresh tokens          |

### Cryptocurrency (`/crypto`)

> All cryptocurrency endpoints require authentication via `AuthGuard`.

#### Simple & Ping

| Method | Endpoint                                  | Description                                    |
| ------ | ----------------------------------------- | ---------------------------------------------- |
| `GET`  | `/crypto/ping`                            | Check CoinGecko API server status              |
| `GET`  | `/crypto/simple/price`                    | Current price of one or more coins             |
| `GET`  | `/crypto/simple/token-price/:id`          | Token prices by contract addresses             |
| `GET`  | `/crypto/simple/supported-vs-currencies`  | List all supported vs currencies               |

#### Coins

| Method | Endpoint                                  | Description                                    |
| ------ | ----------------------------------------- | ---------------------------------------------- |
| `GET`  | `/crypto/coins/list`                      | List all supported coins (ID map)              |
| `GET`  | `/crypto/coins/markets`                   | Market data for coins (price, cap, volume)     |
| `GET`  | `/crypto/coins/categories/list`           | List all coin categories                       |
| `GET`  | `/crypto/coins/categories`                | Categories with market data                    |
| `GET`  | `/crypto/coins/:id`                       | Coin metadata + market data by ID              |
| `GET`  | `/crypto/coins/:id/tickers`               | Coin tickers on exchanges                      |
| `GET`  | `/crypto/coins/:id/history`               | Historical data at a given date                |
| `GET`  | `/crypto/coins/:id/market-chart`          | Historical chart data (prices, cap, volume)    |
| `GET`  | `/crypto/coins/:id/market-chart/range`    | Market chart within a custom time range        |
| `GET`  | `/crypto/coins/:id/ohlc`                  | OHLC chart data (Open, High, Low, Close)       |

#### Contracts

| Method | Endpoint                                                                  | Description                                                |
| ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `GET`  | `/crypto/coins/:id/contract/:contractAddress`                            | Coin metadata by contract address                          |
| `GET`  | `/crypto/coins/:id/contract/:contractAddress/market-chart`              | Historical chart data for token by contract address        |
| `GET`  | `/crypto/coins/:id/contract/:contractAddress/market-chart/range`        | Chart data for token by contract address in custom range   |

### Documentation

| Path    | Description                                |
| ------- | ------------------------------------------ |
| `/docs` | Swagger UI — interactive API documentation |
| `/`     | Static files from `/public` directory      |

---

## Authentication Flow

This API uses a **passwordless secret phrase** authentication system with dual JWT tokens stored in HTTP-only cookies.

### Registration

1. Client calls `POST /auth/register`
2. Server generates 3 random lowercase memorable words as the **secret phrase**
3. Secret phrase is returned **only once** — the user must save it
4. User's search hash (HMAC-SHA256 with pepper) and verification hash (argon2id) are stored

### Login

1. Client sends secret phrase to `POST /auth/login`
2. Server validates: HMAC-SHA256 lookup → argon2id verification
3. Issues **access token** (60 min, `ssaeat` cookie) + **refresh token** (30 days, `udssrt` cookie)

### Silent Token Refresh

The `AuthGuard` automatically refreshes expired tokens transparently:

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
            └── Invalidate entire family, clear cookies, reject
```

### Family-Based Theft Detection

Each login creates a token **family** (same `family_id`). If a refresh token is detected as already-used, the **entire family is revoked** — protecting against session hijacking.

### Logout

`POST /auth/logout` revokes ALL tokens in the user's family, not just the current one.

---

## Security

| Feature                   | Implementation                                                       |
| ------------------------- | -------------------------------------------------------------------- |
| **XSS protection**        | Tokens in HTTP-only cookies (inaccessible via JavaScript)            |
| **Token theft detection** | Family-based refresh token rotation                                  |
| **Rate limiting**         | Global (10 req/min) + auth endpoints (3 req/min)                     |
| **Input validation**      | `class-validator` DTOs + `ParseSecretPhrasePipe` + Zod env schema    |
| **Password hashing**      | argon2id with custom params (memCost=65536, timeCost=3, par=4)     |
| **Search hash**           | HMAC-SHA256 with pepper for user lookup (no raw data in queries)     |
| **Cookie security**       | HTTP-only, secure (prod), `sameSite: 'strict'`                       |
| **Exception handling**    | Global `PrismaExceptionFilter` (RFC 7807) — never leaks internals    |
| **Environment safety**    | Zod v4 validation at startup — refuses to start if config is invalid |

---

## Database Schema

```prisma
model users {
  id                String           @id @default(uuid())
  search_hash       String           @unique   // HMAC-SHA256(phrase, pepper)
  verification_hash String           @unique   // argon2id(phrase)
  created_at        DateTime         @default(now())
  refreshTokens     refresh_tokens[]
}

model refresh_tokens {
  id         String   @id @default(uuid())
  token      String   @unique            // SHA-256 hash of raw token
  user       users    @relation(fields: [user_id], references: [id])
  user_id    String
  family_id  String                      // Token family for theft detection
  revoked    Boolean  @default(false)
  expired    Boolean  @default(false)
  used       Boolean  @default(false)    // Single-use detection
  expires_at DateTime
  created_at DateTime @default(now())
}
```

**Key points**:
- Refresh tokens are **SHA-256 hashed** before storage — raw tokens never persisted
- User lookup is two-step: HMAC-SHA256 search hash → argon2id verification
- Prisma client generated to `../generated/prisma` (not `node_modules`)
- Uses `@prisma/adapter-neon` for serverless PostgreSQL connections

---

## Scripts

| Command                      | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `npm run start:dev`          | Start in development mode with hot reload        |
| `npm run start:debug`        | Start with Node.js inspector enabled             |
| `npm run start:prod`         | Run production build (auto-migrates then starts) |
| `npm run build`              | Generate Prisma client + compile TypeScript      |
| `npm run prisma:generate`    | Generate Prisma client                           |
| `npm run prisma:migrate:dev` | Run migrations in development                    |
| `npm run prisma:migrate:deploy` | Deploy migrations (production)               |
| `npm run test`               | Run unit tests                                   |
| `npm run test:watch`         | Run tests in watch mode                          |
| `npm run test:cov`           | Run tests with coverage report                   |
| `npm run test:e2e`           | Run end-to-end tests                             |
| `npm run lint`               | Lint and auto-fix with ESLint                    |
| `npm run format`             | Format code with Prettier                        |

> **Note**: No unit test files exist yet. E2E auth tests are available in `test/auth.e2e-spec.ts`.

---

## Project Structure

```
src/
├── auth/                          # Authentication module
│   ├── guards/
│   │   └── auth.guard.ts          # JWT guard with silent refresh + theft detection
│   ├── dto/
│   │   └── login.dto.ts           # Login request validation
│   ├── types/
│   │   ├── jwt-tokens.types.ts    # JWT payload interfaces
│   │   └── jwt-validation-error.type.ts
│   ├── auth.controller.ts         # /auth endpoints (register, login, logout, refresh)
│   ├── auth.service.ts            # Auth business logic
│   ├── jwt-manager.service.ts     # JWT generation, validation, rotation, cookies
│   └── auth.module.ts
├── crypto/                        # Cryptocurrency data module
│   ├── dto/                       # 10 query DTOs (price, markets, chart, OHLC, etc.)
│   ├── types/
│   │   └── coingecko-response.types.ts  # Full TypeScript interfaces (25+ types)
│   ├── utils/
│   │   └── get-error-code-by-binance-code.ts  # Legacy (not used with CoinGecko)
│   ├── crypto.controller.ts       # 17 authenticated /crypto endpoints
│   ├── crypto.service.ts          # CoinGecko API integration via @nestjs/axios
│   └── crypto.module.ts
├── users/                         # User management module
│   ├── types/
│   │   └── user.type.ts
│   ├── users.service.ts           # User CRUD, secret phrase generation, hash verification
│   └── users.module.ts
├── prisma/                        # Prisma service
│   ├── prisma.service.ts          # PrismaClient with Neon adapter
│   └── prisma.module.ts
├── common/                        # Shared utilities
│   ├── config/
│   │   ├── index.ts               # App constants (token names, argon2 params)
│   │   └── env.ts                 # Zod v4 environment schema
│   ├── filters/
│   │   └── prisma-exception.filter.ts  # Global Prisma error handler (RFC 7807)
│   ├── pipes/
│   │   └── parse-secret-phrase.pipe.ts  # Validates 3-word format
│   └── types/
│       ├── valueof.type.ts
│       └── object-entries.type.ts
├── app.module.ts                  # Root module
├── app.controller.ts              # Health check endpoint
└── main.ts                        # Bootstrap (pipes, filters, Swagger)

test/                              # E2E tests
├── auth.e2e-spec.ts               # 10 auth integration tests
├── helpers.ts                     # Shared test utilities
├── env-setup.ts                   # Test environment setup
├── global-setup.ts                # Schema push before tests
└── __mocks__/
    └── password-generator.ts      # Mock for ESM password-generator

prisma/
├── schema.prisma                  # Database schema (2 models)
├── migrations/                    # Migration history
└── seed.ts                        # (optional)

public/                            # Static files served at root
```

---

## Testing

Tests use **Jest 30** with `ts-jest`. The test suite targets a **Neon `test` schema** (separate from development/production data).

```bash
# Run E2E auth tests
npm run test:e2e
```

**Test infrastructure**:
- `test/global-setup.ts` — pushes Prisma schema to `test` schema via `prisma db push`
- `test/env-setup.ts` — sets `NODE_ENV=testing`, configures `DATABASE_URL` to use `search_path=test`
- `test/helpers.ts` — `buildTestSchemaUrl()` rewrites the database URL to use the `test` schema
- `test/__mocks__/password-generator.ts` — mock for the ESM-only `password-generator` package
- `ThrottlerGuard` is skipped when `NODE_ENV=testing`

**Current coverage**: 10 E2E tests for auth flow (register, login, logout, refresh, token rotation, theft detection). No unit tests exist yet.

---

## Known Gotchas

- **Secret phrase is shown only once** at registration — there is no recovery flow
- **Cookie names are obfuscated** (`ssaeat`, `udssrt`) — do not rename
- **Refresh tokens are single-use** — each rotation creates a new token; used tokens trigger theft detection
- **Prisma client lives in `../generated/prisma`** — not in `node_modules`
- **Prisma 7** requires `DIRECT_URL` for migrations (separate from pooled `DATABASE_URL`)
- **Zod v4** — uses `z.url()`, `z.treeifyError()` (different from Zod v3)
- **SameSite: strict** — code uses `'strict'`, not `'lax'`
- **Password-generator is ESM** — must be mocked in Jest (`"type": "module"`)
- **No CoinGecko API key needed** — the public API is used directly (rate limits apply)

---

## License

UNLICENSED — Private project.
