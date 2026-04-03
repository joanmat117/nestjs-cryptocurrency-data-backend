# AGENTS.md — Project Guide for AI Agents

> This file contains essential context, conventions, and technical decisions for any AI agent working on this codebase. Read it before making changes.

---

## Project Overview

**NestJS 11** backend that provides authenticated access to real-time cryptocurrency market data via the **CoinMarketCap API**. Security-first architecture with passwordless authentication, dual JWT token rotation, and family-based theft detection.

**Package manager**: pnpm
**Database**: PostgreSQL (Neon serverless) via Prisma 7
**Target**: ES2023, Node.js >= 20

---

## Critical Architecture Decisions

### Authentication System

- **Secret phrase auth** (not passwords) — 3 lowercase memorable words, auto-generated on registration
- **Returned only once** at registration — user must save it
- Validated via `ParseSecretPhrasePipe` (exactly 3 space-separated words)

### Dual JWT with Token Rotation

| Token         | Lifetime   | Storage                     | Purpose           |
| ------------- | ---------- | --------------------------- | ----------------- |
| Access token  | 60 minutes | HTTP-only cookie (`ssaeat`) | API authorization |
| Refresh token | 30 days    | HTTP-only cookie (`udssrt`) | Token rotation    |

**Cookie names are intentionally obfuscated** (`ssaeat`, `udssrt`) — do not rename them without understanding the security implications.

### Family-Based Theft Detection

When a refresh token is used, it's marked as `used = true`. If a refresh token is detected as already-used (meaning a different party used it first), the **entire token family is invalidated** — all tokens sharing the same `family_id` are revoked. This detects and mitigates session hijacking.

### Refresh Token Storage

- Tokens are **SHA-256 hashed** before storing in the database (never store raw tokens)
- Each token tracks: `used`, `revoked`, `expired`, `family_id`, `expires_at`

### Silent Token Refresh in AuthGuard

The `AuthGuard` implements automatic token refresh:

1. Check access token validity
2. If expired → check refresh token
3. If refresh token valid → rotate tokens, set new cookies, grant access
4. If refresh token compromised → invalidate family, reject

This means protected endpoints work transparently even with expired access tokens.

---

## Code Conventions

### Module Structure

Each feature module follows this pattern:

```
src/feature/
├── feature.module.ts
├── feature.controller.ts    # Routes, Swagger decorators, DTOs
├── feature.service.ts       # Business logic
├── dto/                     # Request validation DTOs
│   └── *.dto.ts
├── guards/                  # Feature-specific guards
│   └── *.guard.ts
└── types/                   # TypeScript interfaces/types
    └── *.types.ts
```

### DTOs

- Use `class-validator` decorators (`@IsString`, `@IsOptional`, etc.)
- Always include `@ApiProperty` with description and example for Swagger
- Query DTOs: all fields optional with `@IsOptional()`
- Body DTOs: required fields with `@IsDefined()`

```typescript
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExampleDto {
  @ApiProperty({
    description: 'Description of the field',
    example: 'example-value',
    required: false,
  })
  @IsOptional()
  @IsString()
  field?: string;
}
```

### Controllers

- Use Swagger decorators: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiQuery`
- Rate limit auth endpoints with `@Throttle({ default: { limit: 3, ttl: 60000 } })`
- Return consistent response format: `{ message: string, data?: any }`
- Use `@Res({ passthrough: true })` when setting cookies

### Services

- Inject dependencies via constructor
- Use Prisma directly in services (no repository pattern)
- External API clients initialized in constructor

### Exception Handling

- Global `PrismaExceptionFilter` handles all Prisma errors
- Maps Prisma error codes (P2002, P2025, etc.) to appropriate HTTP status codes
- Hides internal error codes in production, shows them in development
- **Do not** add try-catch for Prisma errors in controllers — the filter handles them

### Configuration

Two config layers:

1. **`src/common/config/index.ts`** — Static application constants (token names, expiry times, argon2 params, secret phrase config)
2. **`src/common/config/env.ts`** — Environment variable validation with Zod schema

```typescript
// Static config (compile-time constants)
import config from 'src/common/config';
const cookieName = config.jwt.accessToken.cookieName;

// Environment config (runtime, validated)
import { getEnvConfig } from 'src/common/config/env';
const envConfig = getEnvConfig(configService);
```

### TypeScript Config Notes

- `noImplicitAny: false` — Some implicit anys are acceptable
- `strictBindCallApply: false` — Not strictly enforced
- Module resolution: `nodenext`
- Import paths: use `src/` alias (not relative `../`) for cross-module imports

---

## Database

### Prisma Setup

- Client generated to `../generated/prisma` (not node_modules)
- Module format: CJS
- Provider: PostgreSQL
- Run `pnpm prisma:generate` after schema changes
- Run `pnpm prisma:migrate:dev` for development migrations

### Schema

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
  token      String   @unique    // SHA-256 hash of the actual token
  user       users    @relation(fields: [user_id], references: [id])
  user_id    String
  family_id  String              // Token family for theft detection
  revoked    Boolean  @default(false)
  expired    Boolean  @default(false)
  used       Boolean  @default(false)  // Single-use detection
  expires_at DateTime
  created_at DateTime @default(now())
}
```

### PrismaService

- Injectable NestJS service
- Extends PrismaClient
- Auto-connects on module init
- Located at `src/prisma/prisma.service.ts`

---

## External APIs

### CoinMarketCap

- Client library: `coinmarketcap-js`
- Initialized with API key from env: `CMC_PRO_API_KEY`
- Available endpoints:
  - `crypto.latestQuotes(params)` — Latest market quotes
  - `crypto.info(params)` — Cryptocurrency metadata
  - `global.latestQuotes(params)` — Global market metrics

---

## Security Patterns

### Rate Limiting

- **Global**: 10 requests per minute (all endpoints)
- **Auth endpoints**: 3 requests per minute (register, login)
- Configured via `@nestjs/throttler` with `ThrottlerGuard` as global guard
- Override per-endpoint with `@Throttle()` decorator

### Cookie Security

- `httpOnly: true` — Not accessible via JavaScript
- `secure: true` in production — HTTPS only
- `sameSite: 'lax'` — CSRF protection

### Password Hashing

- **argon2** with custom params:
  - `memoryCost: 65536`
  - `timeCost: 3`
  - `parallelism: 4`
  - `hashLength: 32`
- **bcrypt** also available as dependency

### Input Validation

- **Zod** — Environment variables (startup validation, app refuses to start if invalid)
- **class-validator + class-transformer** — Request DTOs (runtime validation)
- **ParseSecretPhrasePipe** — Custom pipe for secret phrase format validation

---

## API Endpoints Reference

### Authentication (`/auth`)

| Method | Endpoint         | Auth | Rate Limit | Description                         |
| ------ | ---------------- | ---- | ---------- | ----------------------------------- |
| POST   | `/auth/register` | No   | 3/min      | Register user, return secret phrase |
| POST   | `/auth/login`    | No   | 3/min      | Login with secret phrase            |
| POST   | `/auth/logout`   | Yes  | Global     | Invalidate token family             |
| POST   | `/auth/refresh`  | No   | Global     | Rotate tokens                       |

### Cryptocurrency (`/crypto`)

| Method | Endpoint                               | Auth | Description                      |
| ------ | -------------------------------------- | ---- | -------------------------------- |
| GET    | `/crypto/quotes/latest`                | Yes  | Latest quotes (symbol, id, slug) |
| GET    | `/crypto/info`                         | Yes  | Cryptocurrency metadata          |
| GET    | `/crypto/global-metrics/quotes/latest` | Yes  | Global market metrics            |

### Documentation

- **Swagger UI**: `GET /docs`
- Auto-generated from controller decorators

---

## Common Tasks

### Adding a New Endpoint

1. Create/update DTO in `dto/` with `class-validator` + `@ApiProperty`
2. Add controller method with Swagger decorators (`@ApiOperation`, `@ApiResponse`, etc.)
3. Add service method with business logic
4. If auth required, add `@UseGuards(AuthGuard)` or `@ApiBearerAuth()`
5. If rate limiting needed, add `@Throttle()`

### Adding a New Module

1. Create module directory: `src/new-feature/`
2. Create `new-feature.module.ts`, `new-feature.service.ts`, `new-feature.controller.ts`
3. Import module in `app.module.ts`
4. Follow existing patterns for DTOs, guards, types

### Database Changes

1. Edit `prisma/schema.prisma`
2. Run `pnpm prisma:generate` (regenerates client)
3. Run `pnpm prisma:migrate:dev` (creates and applies migration)
4. Update services to use new fields/models

### Adding Environment Variables

1. Add to `envSchema` in `src/common/config/env.ts` with Zod validation
2. Document in `.env.example`
3. Access via `configService.get('VAR_NAME')` or `getEnvConfig(configService)`

---

## Scripts

| Command                      | Description                              |
| ---------------------------- | ---------------------------------------- |
| `pnpm start:dev`             | Development with hot reload              |
| `pnpm start:debug`           | Development with Node inspector          |
| `pnpm build`                 | Prisma generate + TypeScript compile     |
| `pnpm start:prod`            | Deploy migrations + run production build |
| `pnpm prisma:generate`       | Generate Prisma client                   |
| `pnpm prisma:migrate:dev`    | Create and apply dev migration           |
| `pnpm prisma:migrate:deploy` | Apply pending migrations (production)    |
| `pnpm test`                  | Run unit tests                           |
| `pnpm test:cov`              | Run tests with coverage                  |
| `pnpm test:e2e`              | Run end-to-end tests                     |
| `pnpm lint`                  | ESLint with auto-fix                     |
| `pnpm format`                | Prettier formatting                      |

---

## Gotchas & Warnings

1. **Secret phrase is shown only once** — Registration returns it in the response. There is no "reset" or "forgot phrase" flow.
2. **Cookie names are obfuscated** — `ssaeat` (access), `udssrt` (refresh). Don't rename without updating all references.
3. **Refresh tokens are single-use** — Each refresh marks the token as `used`. The next rotation creates a new token.
4. **Logout invalidates the entire family** — Calling logout revokes all tokens in the family, not just the current one.
5. **Prisma client is in `generated/`** — Not in `node_modules`. Import from `@prisma/client` works normally, but the generated files live in `../generated/prisma`.
6. **Environment validation is strict** — The app will NOT start if any required env var is missing or invalid.
7. **`any` types are used intentionally** — `noImplicitAny: false` and some `any` usage (e.g., CoinMarketCap params) is by design.
8. **No `bcrypt` usage found** — Despite being a dependency, `argon2` is the configured hashing algorithm. `bcrypt` may be unused.
9. **ServeStatic serves from `/public`** — Static files in the `public/` directory are served at the root path `/`.
10. **Zod v4** — The project uses Zod v4 (`z.url()`, `z.treeifyError()`), which has different APIs than Zod v3.

---

## File Map

| Path                                            | Purpose                                                 |
| ----------------------------------------------- | ------------------------------------------------------- |
| `src/main.ts`                                   | Bootstrap, global pipes, Swagger setup                  |
| `src/app.module.ts`                             | Root module, imports all feature modules                |
| `src/common/config/index.ts`                    | Static app constants                                    |
| `src/common/config/env.ts`                      | Zod env validation schema                               |
| `src/common/filters/prisma-exception.filter.ts` | Global Prisma error handler                             |
| `src/common/pipes/parse-secret-phrase.pipe.ts`  | Secret phrase format validator                          |
| `src/auth/auth.controller.ts`                   | Auth endpoints (register, login, logout, refresh)       |
| `src/auth/auth.service.ts`                      | Auth business logic                                     |
| `src/auth/jwt-manager.service.ts`               | JWT generation, validation, rotation, cookie management |
| `src/auth/guards/auth.guard.ts`                 | Auth guard with silent refresh                          |
| `src/crypto/crypto.controller.ts`               | Crypto data endpoints                                   |
| `src/crypto/crypto.service.ts`                  | CoinMarketCap API integration                           |
| `src/users/users.service.ts`                    | User CRUD and secret phrase handling                    |
| `src/prisma/prisma.service.ts`                  | PrismaClient wrapper                                    |
| `prisma/schema.prisma`                          | Database schema                                         |
