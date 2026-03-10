# Proverbs Backend 📜

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

Una API RESTful progresiva construida con **NestJS** y **TypeScript** para la gestión de refranes tradicionales. El sistema incluye validación de datos, manejo de errores global y un servicio de "seeding" automático para entornos de desarrollo.

## 🚀 Características

* **CRUD Completo:** Gestión total de refranes (Crear, Leer, Actualizar, Eliminar).
* **Seed Automático:** Carga refranes de prueba automáticamente al iniciar en modo `development`.
* **Validación Robusta:** Uso de `class-validator` y `class-transformer` para asegurar la integridad de los datos.
* **Arquitectura Limpia:** Separación de responsabilidades mediante Controladores, Servicios y Modelos.
* **Tipado Estricto:** Configuración avanzada de ESLint y TypeScript para un código seguro.

---

## 🛠️ Instalación

Este proyecto utiliza **pnpm** como gestor de paquetes.

```bash
$ pnpm install

```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto (basado en el uso de `ConfigModule` en el código):

```env
NODE_ENV=development
PORT=3000

```

---

## 🏃 Ejecución

```bash
# Desarrollo
$ pnpm run start

# Modo Watch (Auto-reload)
$ pnpm run start:dev

# Producción
$ pnpm run start:prod

```

## 🧪 Testing

```bash
# Pruebas unitarias
$ pnpm run test

# Pruebas e2e
$ pnpm run test:e2e

# Cobertura de test
$ pnpm run test:cov

```

---

## 📡 API Endpoints

### Refranes (`/proverbs`)

| Método | Endpoint | Descripción |
| --- | --- | --- |
| **GET** | `/proverbs` | Obtiene todos los refranes. |
| **GET** | `/proverbs/:id` | Obtiene un refrán por su UUID. |
| **GET** | `/proverbs/random` | Devuelve un refrán aleatorio. |
| **POST** | `/proverbs` | Crea un nuevo refrán. |
| **PATCH** | `/proverbs/:id` | Actualiza un refrán existente. |
| **DELETE** | `/proverbs/:id` | Elimina un refrán. |
| **POST** | `/proverbs/seed` | Carga manualmente los refranes iniciales. |

### Ejemplo de Body para POST/PATCH:

```json
{
  "content": "Más vale tarde que nunca"
}

```

---

## 🏗️ Estructura del Proyecto

* **`src/proverbs/models`**: Lógica de persistencia de datos (en memoria).
* **`src/proverbs/dto`**: Objetos de transferencia de datos y reglas de validación.
* **`src/proverbs/seeder.service.ts`**: Lógica de inicialización de datos de prueba.
