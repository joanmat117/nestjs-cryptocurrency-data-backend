# 🔐 Secret Phrase Authentication System

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## 🌟 Overview

A revolutionary authentication system that eliminates traditional usernames and passwords. Instead, users authenticate using automatically generated secret phrases. No data collection, no emails, no usernames - just pure, privacy-focused authentication.

### 🎯 Key Features

- **🔑 Zero Data Collection** - No emails, usernames, or personal information required
- **🎲 Auto-generated Secret Phrases** - Memorable 3-word phrases generated on registration
- **🔒 Double-Layer Security** - Search hashes with pepper + verification hashes with Argon2id
- **🔄 Refresh Token System** - Secure token rotation with family tracking
- **🛡️ Privacy by Design** - Built with privacy as the default, not an afterthought

## 🏗️ Architecture

### Security Flow

```
Registration:
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   Generate  │ →  │   HMAC-SHA256   │ →  │   Store     │
│    Phrase   │    │   (with pepper) │    │ Search Hash │
└─────────────┘    └─────────────────┘    └─────────────┘
       ↓
┌──────────────┐    ┌───────────────────┐   
│   Argon2id   │ →  │  Store            │
│ (with secret)│    │ Verification Hash │
└──────────────┘    └───────────────────┘
```

### Database Schema

```prisma
model users {
  id                String           @id @default(uuid())
  search_hash       String           @unique // HMAC-SHA256(phrase + pepper)
  verification_hash String           @unique // Argon2id(phrase + secret)
  created_at        DateTime         @default(now())
  refreshTokens     refresh_tokens[]
}

model refresh_tokens {
  id         String   @id @default(uuid())
  token      String   @unique // SHA256 hash of refresh token
  family_id  String   // For token rotation tracking
  revoked    Boolean  @default(false)
  expired    Boolean  @default(false)
  used       Boolean  @default(false)
  expires_at DateTime
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- SQLite (included)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/joanmat117/contest-auth.git
cd secret-phrase-auth
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Configure your environment variables**
```env
NODE_ENV=development
DATABASE_URL="file:./dev.db"
SEARCH_HASH_PEPPER="your-32-char-min-secret-key-here"
VERIFICATION_HASH_SECRET="your-32-char-min-secret-key-here"
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
```

5. **Run database migrations**
```bash
pnpm prisma:migrate:deploy
```

6. **Generate Prisma client**
```bash
pnpm prisma:generate
```

7. **Start the development server**
```bash
pnpm start:dev
```

## 📚 API Reference

### Authentication Endpoints

#### `POST /auth/register`
Register a new user and receive a secret phrase.

**Response**
```json
{
  "message": "Register successful",
  "data": {
    "secretPhrase": "purple-monkey-dishwasher"
  }
}
```

#### `POST /auth/login`
Authenticate using your secret phrase.

**Request**
```json
{
  "secretPhrase": "purple-monkey-dishwasher"
}
```

**Response**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Utility Endpoints

#### `GET /health`
Health check endpoint.

#### `GET /random-password`
Generate a random secret phrase (useful for testing).

### Protected Endpoints

#### `GET /anime/random`
Example protected endpoint (requires authentication).

## 🛡️ Security Details

### Secret Phrase Generation
- **Words**: 3 (configurable)
- **Memorable**: True - generates pronounceable, memorable words
- **Entropy**: ~40 bits of entropy

### Search Hash
- **Algorithm**: HMAC-SHA256
- **Pepper**: Server-side secret (minimum 32 chars)
- **Purpose**: Fast user lookup without exposing the phrase

### Verification Hash
- **Algorithm**: Argon2id
- **Secret**: Additional server-side secret
- **Parameters**: 
  - Memory: 64MB
  - Iterations: 3
  - Parallelism: 4
  - Output length: 32 bytes

### Token System
- **Access Token**: 15 minutes validity
- **Refresh Token**: 30 days validity
- **Token Rotation**: Family-based tracking
- **Storage**: Tokens stored as SHA256 hashes

## 🔧 Configuration

### Secret Phrase Settings (`src/common/config/index.ts`)
```typescript
secretPhrase: {
  words: 3,        // Number of words in phrase
  memorable: true  // Use memorable words
}
```

### Argon2 Settings
```typescript
argon2: {
  memoryCost: 65536,  // 64 MB
  timeCost: 3,        // 3 iterations
  parallelism: 4,     // 4 threads
  hashLength: 32      // 32 byte output
}
```

### JWT Settings
```typescript
jwt: {
  accessToken: {
    expiresIn: 900,        // 15 minutes
    cookieName: ""
  },
  refreshToken: {
    expiresIn: 2592000,    // 30 days
    cookieName: ""
  }
}
```

## 📦 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── dto/
├── common/               # Shared utilities
│   ├── config/          # Configuration
│   ├── guards/          # Auth guards
│   ├── pipes/           # Validation pipes
│   └── filters/         # Exception filters
├── prisma/              # Database service
├── users/               # User management
└── anime/               # Protected module
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Password hashing with [Argon2](https://github.com/ranisalt/node-argon2)

---

<div align="center">
  <sub>Built with ❤️ for privacy-conscious developers</sub>
</div>
