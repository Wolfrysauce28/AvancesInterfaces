# 🍃 FoodSave — Documento de Arquitectura Técnica

> **Materia:** Interfaces de Usuario  
> **Proyecto:** FoodSave — Plataforma de rescate de alimentos con descuento  
> **Deploy:** https://200d89be-4801-4a72-91f9-e4400af4c6da.vercel.app

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura Limpia (Clean Architecture)](#arquitectura-limpia)
4. [Estructura de Directorios](#estructura-de-directorios)
5. [Capas de la Arquitectura](#capas-de-la-arquitectura)
6. [Contenedor de Dependencias](#contenedor-de-dependencias)
7. [Flujo de Datos](#flujo-de-datos)
8. [Páginas y Rutas](#páginas-y-rutas)
9. [Sistema de Autenticación](#sistema-de-autenticación)
10. [Base de Datos](#base-de-datos-supabase)
11. [Decisiones de Diseño UI](#decisiones-de-diseño-ui)
12. [Rendimiento y SEO](#rendimiento-y-seo)
13. [Estrategia de Despliegue](#estrategia-de-despliegue)
14. [Diagrama de Flujo del Usuario](#diagrama-de-flujo-del-usuario)

---

## Descripción General

**FoodSave** es una aplicación web progresiva (PWA) que conecta a restaurantes y panaderías con clientes locales, permitiendo la venta de packs de comida con descuentos de hasta el 70% para evitar el desperdicio alimentario.

La plataforma tiene **dos tipos de usuarios**:
- 🧑‍💼 **Administrador (Restaurante):** Gestiona el inventario de packs disponibles, ajusta stock, crea nuevos productos y visualiza estadísticas de ventas.
- 🛒 **Cliente:** Explora packs disponibles, los agrega al carrito, realiza reservas y consulta sus pedidos.

---

## Stack Tecnológico

| Categoría | Tecnología | Versión | Rol |
|-----------|-----------|---------|-----|
| **Framework Web** | Astro | v5.x | SSR, generación de páginas, routing |
| **UI Components** | React | v19 | Interactividad en el cliente |
| **Estilos** | Tailwind CSS | v3 | Sistema de diseño, clases utilitarias |
| **Backend / DB** | Supabase | v2 | Base de datos PostgreSQL, autenticación OAuth |
| **Tipado** | TypeScript | v5 | Seguridad de tipos en todo el proyecto |
| **Deploy** | Vercel | — | Hosting, CI/CD automático desde GitHub |
| **Iconos** | Font Awesome | 6.4 | Iconografía de la interfaz |
| **Fuentes** | Google Fonts | — | Inter, Outfit, Plus Jakarta Sans |

---

## Arquitectura Limpia

El proyecto aplica los principios de **Clean Architecture** (Arquitectura Limpia) de Robert C. Martin, organizando el código en capas concéntricas donde **las capas internas no conocen a las externas**.

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTACIÓN                       │
│         (Páginas Astro + Componentes React)          │
├─────────────────────────────────────────────────────┤
│                  CASOS DE USO                        │
│     (LoginUser, GetClientPacks, UpdatePackStock…)    │
├─────────────────────────────────────────────────────┤
│                    DOMINIO                           │
│    (Entidades: Pack, User, Survey + Repositorios)    │
├─────────────────────────────────────────────────────┤
│                 INFRAESTRUCTURA                      │
│     (Supabase, LocalStorage, MockData, AuthGuard)    │
└─────────────────────────────────────────────────────┘
```

**Beneficio principal:** Puedo cambiar la base de datos de Supabase a Firebase, o de LocalStorage a IndexedDB, sin modificar ni una sola línea de la lógica de negocio o de los componentes de interfaz.

---

## Estructura de Directorios

```
src/
├── pages/                      # Rutas de la aplicación (Astro)
│   ├── index.astro             # / → Login
│   ├── registro.astro          # /registro → Encuesta de perfil
│   ├── client.astro            # /client → Dashboard del cliente
│   └── admin.astro             # /admin → Panel KDS del restaurante
│
├── layouts/
│   └── BaseLayout.astro        # Layout HTML base (head, meta, fuentes, CSS global)
│
├── components/                 # Componentes React por módulo
│   ├── login/
│   │   └── LoginContainer.tsx  # Formulario de login con transición animada
│   ├── survey/
│   │   └── SurveyWizard.tsx    # Wizard de bienvenida paso a paso
│   ├── client/
│   │   └── ClientDashboard.tsx # Dashboard completo del cliente
│   ├── admin/
│   │   └── AdminDashboard.tsx  # Panel de inventario KDS del restaurante
│   └── common/
│       ├── AuthGuard.tsx       # Protección de rutas por rol
│       └── ThemeToggle.tsx     # Botón de modo oscuro/claro
│
└── core/                       # Núcleo de lógica de negocio
    ├── container.ts            # Inyección de dependencias (DI)
    ├── domain/
    │   ├── entities/           # Interfaces TypeScript de los modelos
    │   │   ├── Pack.ts
    │   │   ├── User.ts
    │   │   └── Survey.ts
    │   ├── repositories/       # Contratos (interfaces) de acceso a datos
    │   │   ├── PackRepository.ts
    │   │   ├── UserRepository.ts
    │   │   └── SurveyRepository.ts
    │   └── rules/
    │       └── surveyRules.ts  # Lógica pura de negocio
    ├── usecases/               # Casos de uso (acciones del sistema)
    │   ├── auth/
    │   │   ├── LoginUser.ts
    │   │   └── LoginWithGoogle.ts
    │   ├── inventory/
    │   │   ├── GetClientPacks.ts
    │   │   ├── GetAdminInventory.ts
    │   │   └── UpdatePackStock.ts
    │   └── survey/
    │       ├── GetSurveyQuestions.ts
    │       └── SaveSurveyAnswers.ts
    └── infrastructure/
        ├── datasources/
        │   ├── supabaseClient.ts   # Singleton del cliente de Supabase
        │   └── MockData.ts         # Datos de prueba offline
        ├── helpers/
        │   └── env.ts              # Helper: detección browser/server
        └── repositories/          # Implementaciones concretas
            ├── SupabasePackRepository.ts
            ├── SupabaseUserRepository.ts
            ├── SupabaseSurveyRepository.ts
            ├── LocalStoragePackRepository.ts
            ├── LocalStorageUserRepository.ts
            └── LocalStorageSurveyRepository.ts
```

---

## Capas de la Arquitectura

### 1. Capa de Dominio (`domain/`)

Es el **corazón del sistema**. No importa nada del exterior: ni Supabase, ni React, ni Astro.

#### Entidades principales

**`Pack.ts`** — Representa un pack de comida disponible:

```typescript
interface Pack {
  id: string;
  storeId: string;
  storeName: string;      // Desnormalizado para eficiencia
  name: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  collectionTime: string; // Ej: "19:30 - 20:30"
  isUrgent: boolean;
  co2SavedKg: number;
  category: string;       // "panaderia", "pizza", "saludable"
}
```

**`User.ts`** — Modelo de usuario con sistema de roles:

```typescript
type UserRole = 'client' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  storeId?: string; // Solo si es admin de un local
}
```

**`Survey.ts`** — Estructura del wizard de bienvenida:

```typescript
interface SurveyQuestion {
  id: number;
  block: string;
  type: 'single' | 'multiple';
  options: SurveyOption[];
}
```

#### Contratos de Repositorios

Definen **qué operaciones** se pueden hacer con los datos, sin decir cómo:

```typescript
// PackRepository.ts
interface PackRepository {
  getPacks(): Promise<Pack[]>;
  getPackById(id: string): Promise<Pack | null>;
  getPacksByStore(storeId: string): Promise<Pack[]>;
  updateStock(packId: string, newStock: number): Promise<Pack>;
  addPack(pack: Omit<Pack, 'id'>): Promise<Pack>;
}
```

#### Reglas de Negocio (`surveyRules.ts`)

Lógica pura para opciones mutuamente exclusivas en la encuesta (si seleccionas "Ninguna restricción", se deseleccionan todas las demás opciones automáticamente).

---

### 2. Capa de Casos de Uso (`usecases/`)

Orquestan la lógica de aplicación. Cada caso de uso representa **una acción que el sistema puede realizar**:

| Caso de Uso | Descripción |
|-------------|-------------|
| `LoginUser` | Autentica un usuario. Si no existe, lo registra automáticamente |
| `LoginWithGoogle` | Inicia flujo OAuth con Google a través de Supabase |
| `GetClientPacks` | Obtiene todos los packs disponibles para el cliente |
| `GetAdminInventory` | Obtiene los packs de una tienda específica por `storeId` |
| `UpdatePackStock` | Valida y actualiza el stock (no permite valores negativos) |
| `GetSurveyQuestions` | Retorna las preguntas del wizard de perfil |
| `SaveSurveyAnswers` | Persiste las respuestas y marca el perfil como completado |

**Ejemplo:**

```typescript
// UpdatePackStock.ts
export class UpdatePackStock {
  constructor(private readonly packRepository: PackRepository) {}

  async execute(packId: string, newStock: number): Promise<Pack> {
    if (newStock < 0) throw new Error('El stock no puede ser negativo.');
    return this.packRepository.updateStock(packId, newStock);
  }
}
```

---

### 3. Capa de Infraestructura (`infrastructure/`)

Contiene las **implementaciones concretas** que interactúan con el mundo exterior.

#### Estrategia Dual de Repositorios

El sistema tiene **dos implementaciones** para cada repositorio:

| Repositorio | Propósito |
|-------------|-----------|
| `SupabaseXxxRepository` | Producción: consultas reales a PostgreSQL en Supabase |
| `LocalStorageXxxRepository` | Desarrollo/fallback: datos guardados en el navegador |

La selección entre una y otra la hace automáticamente el **Contenedor de Dependencias**.

#### Cliente de Supabase

```typescript
// Inicializa con placeholders si no hay credenciales (ej. durante CI/CD build)
export const isSupabaseConfigured = !!(supabaseUrl?.trim() && supabaseKey?.trim());
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseKey : 'placeholder-key'
);
```

---

### 4. Capa de Presentación (Componentes + Páginas)

#### Páginas Astro

Astro maneja el **routing basado en archivos** dentro de `src/pages/`. Cada página renderiza HTML en el servidor (SSR) e hidrata los componentes React interactivos en el cliente.

| Ruta | Archivo | Componente Principal |
|------|---------|----------------------|
| `/` | `index.astro` | `LoginContainer` |
| `/registro` | `registro.astro` | `SurveyWizard` |
| `/client` | `client.astro` | `ClientDashboard` |
| `/admin` | `admin.astro` | `AdminDashboard` |

Ejemplo de cómo Astro conecta con React:

```astro
<BaseLayout title="FoodSave" viewId="home">
  <AuthGuard requiredRole="client" client:idle>
    <ClientDashboard client:idle />
  </AuthGuard>
</BaseLayout>
```

> **`client:idle`**: Directiva de Astro que retrasa la hidratación de React hasta que el navegador esté inactivo, mejorando el tiempo de carga inicial (FCP).

#### Componentes React Clave

**`LoginContainer.tsx`** — Diseño split-screen con overlay animado:
- **Desktop:** animación CSS de deslizamiento del panel verde para cambiar entre formularios.
- **Móvil:** transición de opacidad para evitar que los elementos salgan del viewport.

**`ClientDashboard.tsx`** — El componente más complejo (~1,100 líneas). Gestiona:
- Lista de packs con filtros por categoría y búsqueda en tiempo real.
- Carrito de compras persistido en `localStorage`.
- Sistema de favoritos por producto.
- Modal de confirmación de reserva con efecto confetti al comprar.
- Perfil de usuario editable.
- Navegación inferior (móvil) y superior (escritorio).

**`AdminDashboard.tsx`** — Panel KDS (Kitchen Display System):
- Estadísticas de ingresos y packs salvados en tiempo real.
- Control de stock con animación de flash al actualizar.
- Modal de creación de nuevos packs con validación.
- Filtros de inventario: Todos / Publicados / Agotados.

**`AuthGuard.tsx`** — Protección de rutas:
1. Verifica si hay sesión activa con `userRepository.getCurrentUser()`.
2. Verifica que el rol coincide con el requerido.
3. Redirige a `/` si no hay sesión. Muestra "Acceso denegado" si el rol no coincide.

**`SurveyWizard.tsx`** — Wizard de onboarding de 4 preguntas para personalizar la experiencia del cliente nuevo.

---

## Contenedor de Dependencias

**`src/core/container.ts`** es el punto central de **Inyección de Dependencias (DI)**. Selecciona automáticamente qué implementación usar según el entorno:

```typescript
// Selección automática: ¿Supabase o LocalStorage?
const useSupabase = isSupabaseConfigured && isBrowser();

export const packRepository: PackRepository = useSupabase
  ? new SupabasePackRepository()
  : new LocalStoragePackRepository();

// Los casos de uso reciben sus dependencias aquí (DI)
export const getClientPacksUseCase  = new GetClientPacks(packRepository);
export const updatePackStockUseCase = new UpdatePackStock(packRepository);
export const loginUserUseCase       = new LoginUser(userRepository);
```

Los componentes React **solo importan de `container.ts`**, nunca directamente de Supabase:

```typescript
// ClientDashboard.tsx
import { getClientPacksUseCase, updatePackStockUseCase, userRepository }
  from '../../core/container';
```

---

## Flujo de Datos

```
Usuario interactúa con un Componente React
          │
          ▼
Componente llama a un Caso de Uso
  ej: getClientPacksUseCase.execute()
          │
          ▼
Caso de Uso invoca al Repositorio (contrato abstracto)
  ej: packRepository.getPacks()
          │
          ▼
container.ts resuelve la implementación concreta:
  ┌───────────────────────────────────┐
  │  ¿Supabase configurado?           │
  │  SÍ → SupabasePackRepository      │
  │  NO → LocalStoragePackRepository  │
  └───────────────────────────────────┘
          │
          ▼
Repositorio ejecuta la consulta real
  (SQL en Supabase / JSON en localStorage)
          │
          ▼
Devuelve datos tipados como Pack[]
          │
          ▼
Componente actualiza el estado con useState()
          │
          ▼
React re-renderiza la UI
```

---

## Páginas y Rutas

```
/ (Login)
└── LoginContainer
    ├── Panel Admin → /admin
    └── Panel Cliente → /client o /registro

/registro
└── SurveyWizard (4 pasos)
    ├── Paso 1: Restricciones alimentarias
    ├── Paso 2: Tipos de cocina preferidos
    ├── Paso 3: Horario de recogida
    └── Paso 4: Distancia máxima → redirige a /client

/client (AuthGuard: role='client')
└── ClientDashboard
    ├── Vista Home: Explorar packs por categoría
    ├── Vista Product: Detalle + modal de reserva
    └── Vista Orders: Historial de reservas

/admin (AuthGuard: role='admin')
└── AdminDashboard
    ├── Estadísticas del día
    ├── Inventario con control de stock (+/-)
    └── Modal: Crear nuevo pack
```

---

## Sistema de Autenticación

### Login con Email/Contraseña

```
Usuario ingresa credenciales
        │
        ▼
SupabaseUserRepository.login()
        │
        ├── supabase.auth.signInWithPassword()
        │       │
        │       └── ¿Error "Invalid login credentials"?
        │               ├── SÍ → supabase.auth.signUp() (auto-registro)
        │               └── NO → busca perfil en tabla `profiles`
        │
        ▼
Retorna objeto User tipado
        │
        ▼
Componente redirige según role:
  'admin'  → /admin
  'client' → /client (o /registro si no completó encuesta)
```

### Login con Google (OAuth)

Usa `supabase.auth.signInWithOAuth({ provider: 'google' })`. Supabase maneja el flujo OAuth completo y redirige de vuelta a `/client` tras la autenticación.

### Protección de Rutas

```typescript
// AuthGuard — verifica en cada carga
const user = await userRepository.getCurrentUser();

if (!user)                   → redirige a '/'          // Sin sesión
if (user.role !== required)  → "Acceso denegado"       // Rol incorrecto
// Si pasa ambas verificaciones → renderiza el hijo
```

---

## Base de Datos (Supabase)

Tablas en **PostgreSQL** gestionadas por Supabase:

### `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (FK auth.users) | ID del usuario de Supabase Auth |
| `name` | text | Nombre del usuario |
| `email` | text | Correo electrónico |
| `role` | text | `'client'` o `'admin'` |
| `avatar_url` | text | URL del avatar |
| `store_id` | text | ID del local (solo admins) |

### `packs`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Identificador único |
| `store_id` | text | ID del restaurante propietario |
| `store_name` | text | Nombre del restaurante (desnormalizado) |
| `name` | text | Nombre del pack |
| `image_url` | text | URL de imagen (Unsplash CDN) |
| `original_price` | decimal | Precio original |
| `discounted_price` | decimal | Precio con descuento |
| `stock` | integer | Unidades disponibles |
| `collection_time` | text | Horario de recogida |
| `is_urgent` | boolean | Si el pack expira pronto |
| `co2_saved_kg` | decimal | CO₂ ahorrado estimado |
| `category` | text | Categoría del pack |

### `surveys`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `user_id` | UUID | ID del usuario |
| `answers` | jsonb | Respuestas del wizard en JSON |
| `completed` | boolean | Si completó el wizard |

---

## Decisiones de Diseño UI

### Sistema de Temas (Modo Oscuro)

- Activado con la clase `dark` en `<html>`.
- **Sin parpadeo (FOUC):** script `is:inline` en `<head>` que lee `localStorage` y aplica la clase **antes** de que el navegador pinte el DOM.
- `ThemeToggle.tsx` inicializa siempre en `'light'` (SSR-safe) y se sincroniza con el DOM real en `useEffect`, evitando errores de hidratación de React.

### Diseño Responsive

- **Mobile-first** con Tailwind CSS (breakpoints `md:` y `lg:`).
- **Móvil:** navegación inferior fija con 3 pestañas (Inicio, Buscar, Pedidos).
- **Escritorio:** navbar superior con perfil, búsqueda y carrito.
- **Login en móvil:** transición de opacidad entre formularios (el deslizamiento lateral sacaría el contenido del viewport en pantallas pequeñas).
- **Login en escritorio:** animación con overlay verde deslizante.

### Accesibilidad (a11y)

- Todos los botones tienen `aria-label` descriptivos.
- Roles ARIA en elementos interactivos no semánticos (`role="article"`, `role="tablist"`, `role="tab"`).
- Navegación de teclado con `focus-visible` en el CSS global.
- Soporte de `prefers-reduced-motion` que desactiva todas las animaciones.

---

## Rendimiento y SEO

| Optimización | Dónde | Impacto |
|-------------|-------|---------|
| `client:idle` en componentes React | Todas las páginas | Reduce Time to Interactive |
| `loading="lazy"` en imágenes | ClientDashboard, AdminDashboard | Reduce peso inicial |
| `fetchPriority="high"` en 1ª imagen | ClientDashboard, AdminDashboard | Mejora el LCP |
| Fuentes con `media="print" onload` | BaseLayout | Evita bloqueo de renderizado |
| `font-display: swap` en FontAwesome | BaseLayout | Evita FOIT de 250ms |
| `preconnect` a Supabase y Unsplash | BaseLayout | Reduce latencia de red |

**SEO:**
- `<title>` y `<meta name="description">` únicos por página.
- `lang="es"` en el elemento `<html>`.
- Semántica HTML5: `<main>`, `<nav>`, `<article>`, encabezados jerárquicos.
- Meta tags PWA y viewport optimizado para iOS/Android.

**Lighthouse (Vercel):**
- ⚡ Performance: **84**
- ♿ Accessibility: **96**
- ✅ Best Practices: **100**
- 🔍 SEO: **100**

---

## Estrategia de Despliegue

```
Desarrollador hace push a GitHub (rama: main)
              │
              ▼
Vercel detecta el cambio automáticamente
              │
              ▼
Vercel ejecuta: astro build
  1. TypeScript compila a JavaScript
  2. Astro genera HTML para las rutas
  3. React se empaqueta como JS hidratado
  4. Tailwind purga el CSS no utilizado
              │
              ▼
Vercel distribuye en su CDN global
(el adaptador @astrojs/vercel maneja SSR en Edge Functions)
```

**Variables de entorno requeridas en Vercel:**
```
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Diagrama de Flujo del Usuario

### Flujo Cliente
```
Visita FoodSave (/)
      │
      ▼
LoginContainer → ingresa credenciales
      │
      ├── [Primera vez] → /registro → SurveyWizard (4 preguntas)
      │                                     └── Completa → /client
      │
      └── [Ya registrado] → /client → ClientDashboard
                                │
                                ├── Explorar packs por categoría
                                │       └── Ver detalle
                                │               └── Modal de reserva
                                │                       └── Confirmar → 🎉 Confetti
                                ├── Buscar por nombre
                                ├── Agregar al carrito → Checkout múltiple
                                ├── Favoritos ❤️
                                └── Mis Pedidos → Historial de reservas
```

### Flujo Administrador
```
LoginContainer → panel derecho "Soy Restaurante"
      │
      └── /admin → AdminDashboard
                │
                ├── Ver estadísticas del día
                ├── Inventario: ajustar stock con botones +/-
                │       └── Stock = 0 → Pack marcado "Agotado"
                └── Crear nuevo pack → Modal con formulario validado
```

---

*Repositorio: https://github.com/Wolfrysauce28/AvancesInterfaces*  
*Deploy: https://200d89be-4801-4a72-91f9-e4400af4c6da.vercel.app*
