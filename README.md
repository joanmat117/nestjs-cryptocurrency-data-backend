# 🔐 Secret Phrase Auth System 

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

## 🌟 Overview

Un sistema de autenticación "Zero Data" que elimina usuarios y contraseñas. Los usuarios se identifican mediante **frases secretas de 3 palabras** generadas aleatoriamente. El sistema está diseñado para la máxima privacidad y seguridad técnica.

### 🎯 Key Features

- **🔑 Sin datos personales**: No requiere email, nombre ni teléfono.
- **🎲 Frases Humanas**: Autenticación basada en frases de 3 palabras (ej: `purple monkey dishwasher`).
- **🛡️ Seguridad de Grado Bancario**: Hashes de búsqueda (HMAC-SHA256) y de verificación (Argon2id).
- **🍪 Stateless Auth**: Gestión de Access y Refresh Tokens mediante Cookies (HttpOnly/Secure).
- **🚀 Frontend Integrado**: SPA (Single Page Application) construida con Bootstrap 5 servida directamente por el backend.
- **🚦 Rate Limiting**: Protección integrada contra ataques de fuerza bruta en el login y registro.

---

## 🏗️ Architecture & Flow

### Security Layers
1. **Search Hash**: Para encontrar al usuario rápidamente sin exponer la frase.
2. **Verification Hash**: Para validar la frase usando Argon2id con salt y secret.
3. **JWT Rotation**: Los tokens se rotan automáticamente; si un Refresh Token es robado y usado, toda la "familia" de tokens queda invalidada.



---

## 🚀 Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   pnpm install

 * Configurar Variables de Entorno (.env):
```bash
   DATABASE_URL="file:./dev.db"
SEARCH_HASH_PEPPER="tu-pepper-secreto-32-chars"
VERIFICATION_HASH_SECRET="tu-secret-argon-32-chars"
ACCESS_TOKEN_SECRET="tu-access-secret"
API_NINJA_API_KEY="tu-api-key"
REFRESH_TOKEN_SECRET="tu-refresh-secret"
```

 * Preparar Base de Datos:
   pnpm prisma migrate dev

 * Lanzar Servidor:
   pnpm start:dev

   Accede a: http://localhost:3000
   
## 📚 API Reference

 * GET / -> Carga el index.html (interfaz de login/registro).
Autenticación
 * POST /auth/register -> Genera un nuevo usuario y devuelve la frase de 3 palabras.
 * POST /auth/login -> Recibe { "secretPhrase": "palabra1 palabra2 palabra3" } y setea las cookies.
 * POST /auth/logout -> Invalida la sesión actual y limpia las cookies.
Protegido
 * GET /random/quote -> Devuelve una frase aleatoria. Requiere cookie de Access Token válida.

### 🚦 Rate Limiting (Límites de Tráfico)

Para proteger el servidor, se han implementado los siguientes límites mediante @nestjs/throttler:

 * General: Máximo 10 peticiones por minuto por IP.
 * Login: Configuración estricta para prevenir fuerza bruta.

## 📦 Estructura del Proyecto

```
├── public/                 # Frontend (index.html con Bootstrap)
├── src/
│   ├── auth/               # Lógica de JWT y Frases Secretas
│   ├── common/             # Filtros, Pipes y Rate Limit Guards
│   ├── prisma/             # Cliente de Base de Datos
│   ├── random/             # Controlador de Quotes (Ruta protegida)
│   └── main.ts             # Configuración de Cookies y Prefijos
├── prisma/                 # Esquema de SQLite
└── nest-cli.json           # Configuración de assets (public folder)
```

<div align="center">
<sub>Construido con ❤️ priorizando la privacidad del usuario.</sub>
</div>
