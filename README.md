# FoodSave 🥗

Plataforma de rescate de alimentos. Conecta comercios con excedentes de comida con consumidores que quieren rescatar alimentos a precios reducidos.

## Stack

- **Framework**: [Astro](https://astro.build) v5
- **UI**: React 19 + Tailwind CSS 3
- **Backend**: Supabase (Auth + PostgreSQL)
- **Almacenamiento local**: LocalStorage (modo desarrollo)
- **Despliegue**: Vercel (SSR)

## Requisitos

- Node.js >= 20
- npm >= 10

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## Variables de entorno

Copia `.env.example` a `.env` y completa las variables:

| Variable | Descripción |
|---|---|
| `PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | Anon key pública de Supabase |

Sin variables configuradas, la app funciona en **modo local** con datos en LocalStorage.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint (revisa src/) |
| `npm run lint:fix` | ESLint con auto-fix |
| `npm run format` | Prettier (verifica formato) |
| `npm run format:fix` | Prettier (formatea archivos) |
| `npm run typecheck` | TypeScript type check (`tsc --noEmit`) |

## Arquitectura

```
src/
├── components/       # Componentes React
│   ├── admin/        # Panel de administración (KDS)
│   ├── client/       # Dashboard del cliente
│   ├── common/       # Componentes compartidos (ThemeToggle)
│   ├── login/        # Login con formularios
│   └── survey/       # Wizard de registro
├── core/             # Capa de dominio y aplicación
│   ├── container.ts  # DI container (punto de entrada)
│   ├── domain/       # Entidades, repositorios, reglas de negocio
│   ├── infrastructure/ # Implementaciones concretas (Supabase, LocalStorage)
│   └── usecases/     # Casos de uso de la aplicación
├── layouts/          # Layouts de Astro
└── pages/            # Páginas (rutas)
```

## Estructura de base de datos

Ver `supabase_schema.sql` para el esquema completo. Incluye tablas para:
- `profiles` — Perfiles de usuario sincronizados con Auth
- `packs` — Inventario de packs de comida
- `surveys` — Respuestas de encuesta de registro
