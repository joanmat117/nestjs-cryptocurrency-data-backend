# AGENTS.md — Project Guide for AI Agents

> This file contains essential context, conventions, and technical decisions for any AI agent working on this codebase. Read it before making changes.

---

## Project Overview

**NestJS 11** backend that provides authenticated access to real-time cryptocurrency market data via the **CoinMarketCap API**. Security-first architecture with passwordless authentication, dual JWT token rotation, and family-based theft detection.

**Package manager**: pnpm
**Database**: PostgreSQL (Neon serverless) via Prisma 7
**Target**: ES2023, Node.js >= 20
**Test runner**: Jest 30 (configured but NO test files exist yet)

---

## Critical Architecture Decisions

### Authentication System

- **Secret phrase auth** (not passwords) — 3 lowercase memorable words, auto-generated on registration
- **Returned only once** at registration — user must save it
- Validated via `ParseSecretPhrasePipe` (exactly 3 space-separated words)
- Secret phrase generation uses `password-generator` library with `memorable: true`
- User lookup uses HMAC-SHA256 search hash (pepper-based), verification uses argon2id

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
- Family ID generated via `crypto.randomUUID()`

### Silent Token Refresh in AuthGuard

The `AuthGuard` implements automatic token refresh:

1. Extract tokens from cookies (`ssaeat` for access, `udssrt` for refresh)
2. If no access token → throw UnauthorizedException
3. Validate access token
4. If valid → attach payload to `req["user"]`, return true
5. If not expired but invalid → throw "Invalid access token"
6. If expired → check refresh token:
   a. If no refresh → clear cookies, throw "No refresh token provided"
   b. Validate refresh token against database
   c. If USED → **THEFT DETECTED** → invalidate entire family, clear cookies, throw
   d. If REVOKED → clear cookies, throw
   e. If EXPIRED → clear cookies, throw
   f. If VALID → mark as used, rotate tokens (generate new pair), set cookies, return true
7. Fallback → clear cookies, throw "Invalid authentication"

This means protected endpoints work transparently even with expired access tokens.

---

## Module Hierarchy & Dependencies

```
AppModule (root)
├── ConfigModule.forRoot (isGlobal: true)
│   └── loads: registerEnvConfig (Zod validated)
├── ServeStaticModule.forRoot
│   └── rootPath: ./public
├── PrismaModule (@Global)
│   └── provides: PrismaService (extends PrismaClient with Neon adapter)
├── AuthModule
│   ├── imports: UsersModule, JwtModule.register({ global: true })
│   ├── providers: AuthService, JwtManagerService, AuthGuard
│   └── exports: AuthGuard, JwtManagerService
├── UsersModule
│   ├── providers: [UsersService]
│   └── exports: [UsersService]
├── ThrottlerModule.forRoot (10 req/60s)
└── CryptoModule (EMPTY STUB — not yet implemented)
    ├── providers: [CryptoService]
    └── controllers: [CryptoController]

APP_GUARD: ThrottlerGuard (global rate limiting)
```

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
├── types/                   # TypeScript interfaces/types
│   └── *.types.ts
└── enums/                   # Enumerations (if needed)
    └── *.enum.ts
```

### Import Patterns

The project uses **two import styles** (inconsistent):

```typescript
// Style 1: Relative paths (most common in controllers/guards)
import { AuthService } from './auth.service';
import { JwtManagerService } from '../jwt-manager.service';

// Style 2: Path alias (used in services)
import { UsersService } from 'src/users/users.service';
import config from 'src/common/config';

// Style 3: Generated paths (Prisma)
import { users } from '../../generated/prisma/client';
```

**Convention**: Use `src/` alias for cross-module imports. Relative paths are acceptable within the same module.

### Dependency Injection

All DI follows standard NestJS constructor injection. **All injections are `private readonly`**:

```typescript
// Pattern 1: Simple service injection
constructor(private readonly authService: AuthService) {}

// Pattern 2: Multiple services
constructor(
  private readonly usersService: UsersService,
  private readonly jwtManager: JwtManagerService,
  private readonly prismaService: PrismaService,
) {}

// Pattern 3: Injecting ConfigService
constructor(private readonly configService: ConfigService) {}
```

### DTOs

- Use `class-validator` decorators (`@IsString`, `@IsOptional`, `@IsDefined`, `@IsLowercase`)
- Always include `@ApiProperty` with description and example for Swagger
- Query DTOs: all fields optional with `@IsOptional()`
- Body DTOs: required fields with `@IsDefined()`
- Validation global pipe: `new ValidationPipe({ transform: true, whitelist: true })`

```typescript
import { IsDefined, IsString, IsLowercase } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Secret phrase (3 lowercase words separated by spaces)',
    example: 'alpha bravo charlie',
    minLength: 5,
  })
  @IsDefined()
  @IsString()
  @IsLowercase()
  secretPhrase: string;
}
```

### Controllers

- Use Swagger decorators: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBody`, `@ApiBearerAuth`
- Rate limit auth endpoints with `@Throttle({ default: { limit: 3, ttl: 60000 } })`
- Return consistent response format: `{ message: string, data?: any }`
- Use `@Res({ passthrough: true })` when setting cookies
- Use `@HttpCode(HttpStatus.XXX)` for explicit status codes
- **No try-catch blocks** — delegates to global exception filters

### Services

- Inject dependencies via constructor (all `private readonly`)
- Use Prisma directly in services (no repository pattern)
- External API clients initialized in constructor
- Throw specific NestJS exceptions: `UnauthorizedException`, `NotFoundException`, `BadRequestException`, `InternalServerErrorException`
- Private helper methods for internal operations (hash generation, etc.)

### Exception Handling

- Global `HttpExceptionFilter` (from `nest-problem-details-filter`) — RFC 7807 Problem Details
- Global `PrismaExceptionFilter` — comprehensive Prisma error code mapping
- Maps 20+ Prisma error codes (P2002→Conflict, P2025→NotFound, P2003→BadRequest, etc.)
- Returns RFC 7807 format: `{ status, title, type: "about:blank" }`
- Extracts constraint field names for unique violation messages
- Logs debug in non-production, logs unhandled codes as errors in production
- **Do not** add try-catch for Prisma errors in controllers — the filter handles them

### Interceptors

**None used.** The project does not implement custom interceptors.

### Guards

Single `AuthGuard` implementing `CanActivate`. See "Silent Token Refresh in AuthGuard" section for full flow.

### Pipes

- `ParseSecretPhrasePipe` — validates secret phrase format (3 space-separated words)
- Global `ValidationPipe` — auto-transforms and strips unknown properties

### Utility Types

```typescript
// common/types/valueof.type.ts
export type ValueOf<T> = T[keyof T];

// common/types/object-entries.type.ts
export type ObjectEntries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
```

### Configuration

Two config layers:

1. **`src/common/config/index.ts`** — Static application constants (token names, expiry times, argon2 params, secret phrase config)
2. **`src/common/config/env.ts`** — Environment variable validation with Zod v4 schema

```typescript
// Static config (compile-time constants)
import config from 'src/common/config';
const cookieName = config.jwt.accessToken.cookieName; // "ssaeat"

// Environment config (runtime, validated)
import { getEnvConfig } from 'src/common/config/env';
const envConfig = getEnvConfig(configService);
// envConfig.SEARCH_HASH_PEPPER, envConfig.DATABASE_URL, etc.
```

### TypeScript Config Notes

- `noImplicitAny: false` — Some implicit anys are acceptable
- `strictBindCallApply: false` — Not strictly enforced
- `strictNullChecks: true` — NULL safety IS enforced
- `module: "nodenext"` — Native Node.js module system
- `moduleResolution: "nodenext"` — Native resolution
- `experimentalDecorators: true` — Required for NestJS decorators
- `emitDecoratorMetadata: true` — Required for NestJS DI
- `target: "ES2023"` — Modern JS output
- Import paths: use `src/` alias (not relative `../`) for cross-module imports

---

## Database

### Prisma Setup

- Client generated to `../generated/prisma` (not node_modules)
- Module format: CJS
- Provider: PostgreSQL
- Uses `@prisma/adapter-neon` for serverless PostgreSQL (Neon)
- `PrismaService` extends `PrismaClient` and uses `PrismaNeon` adapter
- Run `pnpm prisma:generate` after schema changes
- Run `pnpm prisma:migrate:dev` for development migrations
- `prisma.config.ts` uses `DIRECT_URL` for migrations (separate from pooled `DATABASE_URL`)

### Schema

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
  // URL via env: DATABASE_URL (pooled) / DIRECT_URL (migrations)
}

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

### Relationships

- **users** 1:N **refresh_tokens** (via `user_id` → `users.id`)
- Bidirectional: `users.refreshTokens` / `refresh_tokens.user`

---

## Security Patterns

### Rate Limiting

- **Global**: 10 requests per minute (all endpoints) — `ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 10 }] })`
- **Auth endpoints**: 3 requests per minute (register, login) — `@Throttle({ default: { limit: 3, ttl: 60000 } })`
- `ThrottlerGuard` registered as `APP_GUARD` (applies globally)
- Override per-endpoint with `@Throttle()` decorator

### Cookie Security

- `httpOnly: true` — Not accessible via JavaScript
- `secure: true` in production — HTTPS only
- `sameSite: 'strict'` — CSRF protection (NOTE: code uses `'strict'`, some docs say `'lax'` — code is authoritative)

### Password Hashing

- **argon2id** with custom params:
  - `memoryCost: 65536`
  - `timeCost: 3`
  - `parallelism: 4`
  - `hashLength: 32`
  - 16-byte random salt per hash
  - Secret (VERIFICATION_HASH_SECRET) provided as Buffer
- **bcrypt** is a listed dependency but **NOT used anywhere** — dead weight

### Token Hashing

- Refresh tokens are SHA-256 hashed before database storage
- Raw tokens never persisted

### Input Validation

- **Zod v4** — Environment variables (startup validation, app refuses to start if invalid)
- **class-validator + class-transformer** — Request DTOs (runtime validation)
- **ParseSecretPhrasePipe** — Custom pipe for secret phrase format validation

### Authentication Hash Strategy

- **Search hash**: HMAC-SHA256(secretPhrase, SEARCH_HASH_PEPPER) — used for user lookup
- **Verification hash**: argon2id(secretPhrase, { secret: VERIFICATION_HASH_SECRET }) — used for identity verification
- Two-step lookup: first find by search hash, then verify with argon2

---

## External APIs

### CoinMarketCap

- Client library: `coinmarketcap-js` (NOT in package.json — needs to be installed)
- Expected API key env: `CMC_PRO_API_KEY`
- Available endpoints (planned):
  - `crypto.latestQuotes(params)` — Latest market quotes
  - `crypto.info(params)` — Cryptocurrency metadata
  - `global.latestQuotes(params)` — Global market metrics

**Current status**: CryptoModule is an empty stub. The core feature (cryptocurrency data) is NOT implemented.

---

## API Endpoints Reference

### Health Check (`/`)

| Method | Endpoint  | Auth | Description            |
| ------ | --------- | ---- | ---------------------- |
| GET    | `/health` | No   | Health check endpoint  |

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

**Current status**: All crypto endpoints are documented but NOT implemented (empty stubs).

### Documentation

- **Swagger UI**: `GET /docs`
- Auto-generated from controller decorators

---

## Common Tasks

### Adding a New Endpoint

1. Create/update DTO in `dto/` with `class-validator` + `@ApiProperty`
2. Add controller method with Swagger decorators (`@ApiOperation`, `@ApiResponse`, `@ApiBody`, etc.)
3. Add service method with business logic
4. If auth required, add `@UseGuards(AuthGuard)` or `@ApiBearerAuth()`
5. If rate limiting needed, add `@Throttle()`
6. **Do not** add try-catch for Prisma errors — global filter handles them

### Adding a New Module

1. Create module directory: `src/new-feature/`
2. Create `new-feature.module.ts`, `new-feature.service.ts`, `new-feature.controller.ts`
3. Create `dto/`, `types/`, `guards/`, `enums/` subdirectories as needed
4. Import module in `app.module.ts`
5. Follow existing patterns for DTOs, guards, types

### Database Changes

1. Edit `prisma/schema.prisma`
2. Run `pnpm prisma:generate` (regenerates client to `../generated/prisma`)
3. Run `pnpm prisma:migrate:dev` (creates and applies migration)
4. Update services to use new fields/models

### Adding Environment Variables

1. Add to `envSchema` in `src/common/config/env.ts` with Zod v4 validation
2. Document in `.env.example`
3. Access via `configService.get('app')` or `getEnvConfig(configService)`

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

## Linting & Formatting

### ESLint (ESLint 9 flat config — `eslint.config.mjs`)

- Extends: `@eslint/js` recommended, `typescript-eslint` recommended + type-checked, `eslint-plugin-prettier`
- Custom rules:
  - `@typescript-eslint/no-explicit-any: 'off'` — `any` is allowed
  - `@typescript-eslint/no-floating-promises: 'warn'` — warns on unhandled promises
  - `@typescript-eslint/no-unsafe-argument: 'warn'` — warns on unsafe arguments
  - `prettier/prettier: ['error', { endOfLine: 'auto' }]`
- Source type: `commonjs`
- Parser: TypeScript parser with project service

### Prettier (`.prettierrc`)

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

---

## Testing

### Configuration (Jest 30)

- Root directory: `src`
- Test pattern: `.*\.spec\.ts$`
- Transform: `ts-jest`
- Environment: `node`
- Coverage directory: `../coverage`

### Current Status

**NO TEST FILES EXIST.** Zero `.spec.ts` files in the entire codebase.

### Available Test Infrastructure

- `@nestjs/testing` — NestJS testing utilities
- `supertest` — HTTP assertion library
- `@types/jest`, `@types/supertest` — Type definitions

### E2E Testing

- Script `pnpm test:e2e` references `./test/jest-e2e.json` but **this file does not exist**
- Running `pnpm test:e2e` would fail

---

## Gotchas & Warnings

1. **Secret phrase is shown only once** — Registration returns it in the response. There is no "reset" or "forgot phrase" flow.
2. **Cookie names are obfuscated** — `ssaeat` (access), `udssrt` (refresh). Don't rename without updating all references.
3. **Refresh tokens are single-use** — Each refresh marks the token as `used`. The next rotation creates a new token.
4. **Logout invalidates the entire family** — Calling logout revokes all tokens in the family, not just the current one.
5. **Prisma client is in `generated/`** — Not in `node_modules`. Import from `@prisma/client` works normally, but the generated files live in `../generated/prisma`.
6. **Environment validation is strict** — The app will NOT start if any required env var is missing or invalid.
7. **`any` types are used intentionally** — `noImplicitAny: false` and some `any` usage is by design. ESLint rule `no-explicit-any` is OFF.
8. **No `bcrypt` usage found** — Despite being a dependency, `argon2` is the configured hashing algorithm. `bcrypt` is unused dead weight.
9. **ServeStatic serves from `/public`** — Static files in the `public/` directory are served at the root path `/`.
10. **Zod v4** — The project uses Zod v4 (`z.url()`, `z.treeifyError()`), which has different APIs than Zod v3.
11. **`sameSite: 'strict'` in code** — The actual cookie configuration uses `'strict'`, not `'lax'` as some docs may state. Code is authoritative.
12. **CryptoModule is empty** — The core feature (cryptocurrency data) is completely unimplemented. Controller and service are stubs.
13. **Broken import** — `src/crypto/utils/get-error-code-by-binance-code.ts` imports from `../enums/binance-error-codes.enum` and `../types/binance-error-code.type` which don't exist.
14. **Unused dependencies** — `bcrypt`, `binance-api-node`, `@nestjs/mapped-types` are listed but never imported in source.
15. **`coinmarketcap-js` not installed** — README references CoinMarketCap API but the client library is not in package.json.
16. **`@types/swagger-ui-express` in production deps** — Should be in devDependencies.
17. **Empty placeholder directories** — `crypto/dto/`, `crypto/enums/`, `crypto/types/` exist but are empty.
18. **Zero tests** — No `.spec.ts` files exist. Test infrastructure is configured but unused.
19. **Missing E2E config** — `test/jest-e2e.json` referenced by script but doesn't exist.
20. **Inconsistent import paths** — Mix of `src/` aliases and relative paths, even within the same module.

---

## File Map

| Path                                            | Purpose                                                 |
| ----------------------------------------------- | ------------------------------------------------------- |
| `src/main.ts`                                   | Bootstrap, global pipes/filters, Swagger setup          |
| `src/app.module.ts`                             | Root module, imports all feature modules                |
| `src/app.controller.ts`                         | Health check endpoint                                   |
| `src/common/config/index.ts`                    | Static app constants (token names, argon2 params, etc.) |
| `src/common/config/env.ts`                      | Zod v4 env validation schema                            |
| `src/common/filters/prisma-exception.filter.ts` | Global Prisma error handler (RFC 7807 format)           |
| `src/common/pipes/parse-secret-phrase.pipe.ts`  | Secret phrase format validator                          |
| `src/common/types/valueof.type.ts`              | Utility type: `ValueOf<T>`                              |
| `src/common/types/object-entries.type.ts`       | Utility type: `ObjectEntries<T>`                        |
| `src/auth/auth.module.ts`                       | Auth module definition                                  |
| `src/auth/auth.controller.ts`                   | Auth endpoints (register, login, logout, refresh)       |
| `src/auth/auth.service.ts`                      | Auth business logic                                     |
| `src/auth/jwt-manager.service.ts`               | JWT generation, validation, rotation, cookie management |
| `src/auth/guards/auth.guard.ts`                 | Auth guard with silent refresh + theft detection        |
| `src/auth/dto/login.dto.ts`                     | Login request DTO                                       |
| `src/auth/types/jwt-tokens.types.ts`            | JWT payload interfaces                                  |
| `src/auth/types/jwt-validation-error.type.ts`   | JWT error type union                                    |
| `src/crypto/crypto.module.ts`                   | Crypto module (empty stub)                              |
| `src/crypto/crypto.controller.ts`               | Crypto controller (empty stub)                          |
| `src/crypto/crypto.service.ts`                  | Crypto service (empty stub)                             |
| `src/crypto/utils/get-error-code-by-binance-code.ts` | Binance error mapper (BROKEN — missing imports)    |
| `src/users/users.module.ts`                     | Users module definition                                 |
| `src/users/users.service.ts`                    | User CRUD, secret phrase generation, hash verification  |
| `src/users/types/user.type.ts`                  | User interface extending Prisma model                   |
| `src/prisma/prisma.module.ts`                   | Global Prisma module                                    |
| `src/prisma/prisma.service.ts`                  | PrismaClient with Neon adapter                          |
| `prisma/schema.prisma`                          | Database schema (2 models)                              |
| `prisma.config.ts`                              | Prisma 7 config (uses DIRECT_URL for migrations)        |
| `eslint.config.mjs`                             | ESLint 9 flat config                                    |
| `.prettierrc`                                   | Prettier config (singleQuote, trailingComma)            |
| `tsconfig.json`                                 | TypeScript config (nodenext, ES2023)                    |
| `tsconfig.build.json`                           | Build-specific TS config                                |
| `.env.example`                                  | Environment variable template                           |

---

## Dependency Map (Key Packages)

### Production Dependencies

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@nestjs/common` | `^11.0.1` | NestJS core decorators | Active |
| `@nestjs/config` | `^4.0.3` | Config module | Active |
| `@nestjs/core` | `^11.0.1` | NestJS core | Active |
| `@nestjs/jwt` | `^11.0.2` | JWT integration | Active |
| `@nestjs/platform-express` | `^11.0.1` | Express adapter | Active |
| `@nestjs/serve-static` | `^5.0.4` | Static file serving | Active |
| `@nestjs/swagger` | `^11.2.6` | OpenAPI documentation | Active |
| `@nestjs/throttler` | `^6.5.0` | Rate limiting | Active |
| `@prisma/adapter-neon` | `^7.6.0` | Neon serverless adapter | Active |
| `@prisma/client` | `^7.4.0` | Prisma ORM client | Active |
| `argon2` | `^0.44.0` | Password hashing | Active |
| `class-transformer` | `^0.5.1` | DTO transformation | Active |
| `class-validator` | `^0.14.3` | DTO validation | Active |
| `cookie-parser` | `^1.4.7` | Cookie parsing | Active |
| `dotenv` | `^17.3.1` | Env file loading | Active |
| `nest-problem-details-filter` | `^1.4.0` | RFC 7807 Problem Details | Active |
| `password-generator` | `^3.0.0` | Secret phrase generation | Active |
| `rxjs` | `^7.8.1` | Reactive extensions | Active |
| `swagger-ui-express` | `^5.0.1` | Swagger UI serving | Active |
| `zod` | `^4.3.6` | Schema validation (v4) | Active |
| `bcrypt` | `^6.0.0` | Password hashing | **UNUSED** |
| `binance-api-node` | `^0.13.9` | Binance API client | **UNUSED** |
| `@nestjs/mapped-types` | `*` | DTO partial types | **UNUSED** |
| `@types/swagger-ui-express` | `^4.1.8` | Swagger UI types | **Misplaced** (should be devDep) |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/cli` | `^11.0.16` | NestJS CLI |
| `@nestjs/schematics` | `^11.0.9` | NestJS code generators |
| `@nestjs/testing` | `^11.0.1` | Testing utilities |
| `prisma` | `^7.5.0` | Prisma CLI |
| `typescript` | `^5.7.3` | TypeScript compiler |
| `jest` | `^30.0.0` | Test runner |
| `ts-jest` | `^29.2.5` | TypeScript Jest transform |
| `supertest` | `^7.0.0` | HTTP testing |
| `eslint` | `^9.18.0` | Linter |
| `prettier` | `^3.4.2` | Code formatter |
