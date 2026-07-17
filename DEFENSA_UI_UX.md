# 🎨 FoodSave — Guía de Defensa UI/UX y Preguntas Técnicas

Este documento está diseñado para ayudarte a defender las decisiones de diseño (UI/UX) y prepararte para las preguntas técnicas más probables durante la presentación de tu proyecto de Interfaces.

---

## 1. Justificación de Diseño UI/UX

### 🎨 Paleta de Colores
La paleta se basa en un esquema moderno y semántico, aprovechando el sistema de Tailwind CSS.

*   **Color Primario (Emerald - `#10b981`):** Se eligió el tono *Emerald* (Esmeralda/Verde) como color principal. 
    *   **Justificación:** El verde está universalmente asociado con la **naturaleza, la ecología, la frescura y la sostenibilidad**. Como FoodSave es una app de rescate de alimentos (evitar desperdicio), el verde refuerza el mensaje de "salvar el planeta". Además, transmite confianza y éxito (como al confirmar una reserva).
*   **Colores Neutros (Gray 50 a Gray 900):** 
    *   **Justificación:** Se utilizan para los fondos y textos. Un fondo claro (Gray 50) da un aspecto limpio y espacioso, mientras que los textos oscuros aseguran un alto contraste y legibilidad (cumpliendo métricas de Accesibilidad de Lighthouse).
*   **Modo Oscuro (Dark Mode):** 
    *   **Justificación:** Implementado nativamente. Cambia los fondos a Gray 900/800. Reduce la fatiga visual del usuario en entornos de poca luz y da una apariencia "Premium" a la aplicación.

### ✍️ Tipografía
El proyecto utiliza una combinación dual de fuentes modernas de Google Fonts:

*   **Tipografía de Títulos (Display): `Outfit`**
    *   **Justificación:** *Outfit* es una fuente geométrica, moderna y amigable. Llama mucho la atención en los encabezados (H1, H2, H3) y le da mucha personalidad a la marca FoodSave, haciéndola lucir como una startup tecnológica moderna.
*   **Tipografía de Cuerpo (Body): `Plus Jakarta Sans`**
    *   **Justificación:** Es extremadamente legible en tamaños pequeños. Tiene una excelente altura de la 'x', lo que la hace perfecta para leer descripciones de productos, precios y menús tanto en móvil como en escritorio.

### 📐 Estilo de Distribución (Layout) y Composición
La aplicación utiliza varios patrones de diseño modernos dependiendo del contexto:

*   **Bento Box (Admin Dashboard):**
    *   En el panel de administración, las estadísticas ("Ingresos extra", "Packs salvados") se presentan usando un diseño estilo **Bento Box**. Este estilo (popularizado por Apple) organiza la información en tarjetas rectangulares y cuadradas con bordes redondeados (`rounded-2xl`). 
    *   **Justificación:** Permite al administrador digerir mucha información diferente de un solo vistazo de forma muy ordenada y visualmente atractiva.
*   **Mobile-First y Bottom Navigation (Client Dashboard):**
    *   **Justificación:** Dado que los clientes usarán la app principalmente en la calle para buscar comida cerca, la interfaz está pensada primero para móviles. Utiliza una barra de navegación inferior (*Bottom Nav*) anclada, facilitando que el usuario alcance todas las opciones con el dedo pulgar (Ley de Fitts).
*   **Split-Screen (Pantalla de Login):**
    *   En escritorio, el login usa un panel dividido (Split-Screen) con un overlay animado. 
    *   **Justificación:** Separa visualmente a los dos tipos de usuarios (Restaurante vs Cliente) de una forma interactiva, reduciendo la fricción al registrarse.

---

## 2. Posibles Preguntas Técnicas y Respuestas

Aquí tienes las preguntas que los profesores suelen hacer en este tipo de materias, con la forma correcta de responderlas.

### Pregunta 1: *"Veo que usas React dentro de Astro, ¿Por qué no usar solo React o solo Astro?"*
**Respuesta:** "Astro es excelente para el rendimiento y el SEO porque genera HTML estático en el servidor por defecto (SSR). Sin embargo, Astro por sí solo no mantiene estados complejos en el cliente. Usamos React a través de la arquitectura en islas (Islands Architecture) solo para las partes interactivas (como el carrito, el login y los dashboards). Esto nos da lo mejor de dos mundos: la velocidad de carga inicial de Astro (mejorando el FCP en Lighthouse) y la interactividad rica de React."

### Pregunta 2: *"¿Qué patrón de arquitectura aplicaste en el proyecto y por qué?"*
**Respuesta:** "Apliqué los principios de **Clean Architecture** (Arquitectura Limpia). Separé el proyecto en 4 capas: Dominio, Casos de Uso, Infraestructura y Presentación. El mayor beneficio es que nuestra interfaz (React/Astro) no sabe qué base de datos usamos. Si el día de mañana queremos cambiar Supabase por Firebase, o simplemente guardar en LocalStorage, solo cambiamos la capa de infraestructura sin tener que reescribir ni un solo componente de React."

### Pregunta 3: *"Tuviste un problema de 'Hydration Mismatch' (Error de Hidratación) en tu reporte. ¿Qué es eso y cómo lo solucionaste?"*
**Respuesta:** "Un error de hidratación ocurre cuando el HTML que el servidor genera (Astro) es diferente al primer renderizado que React intenta hacer en el navegador. Por ejemplo, con el Modo Oscuro, el servidor no sabía si el cliente prefería el modo oscuro o claro, así que renderizaba algo distinto. Lo solucioné asegurándome de que el estado inicial en React (en el primer render) siempre coincida con el del servidor, y luego usando un `useEffect` para leer las preferencias del usuario una vez que el componente ya está montado."

### Pregunta 4: *"¿Cómo manejas el estado del carrito de compras y qué pasa si el usuario recarga la página?"*
**Respuesta:** "El estado se maneja con Hooks de React (`useState`), pero para garantizar la persistencia de datos (y que no se pierdan al recargar), el carrito se sincroniza automáticamente con el `localStorage` del navegador cada vez que se agrega o elimina un producto. Al montar el componente (`useEffect`), primero leemos el `localStorage` para hidratar el estado inicial."

### Pregunta 5: *"¿Cómo lograste el puntaje de 100% en Accesibilidad y SEO en Lighthouse?"*
**Respuesta:** 
*   **Accesibilidad:** Me aseguré de que todos los botones e íconos interactivos tuvieran etiquetas `aria-label`, respeté los contrastes de colores entre fondo y texto, y utilicé roles semánticos en el HTML (`<main>`, `<nav>`).
*   **SEO:** Cada página tiene etiquetas `<title>` y `<meta name="description">` únicas, atributos `lang="es"` en el documento, y aseguro que el contenido clave se renderice desde el servidor (SSR) para que los motores de búsqueda puedan indexarlo correctamente.

### Pregunta 6: *"Si el sistema crece y miles de usuarios se conectan a la vez, ¿qué parte de tu arquitectura te ayudaría a escalar?"*
**Respuesta:** "Nuestra inyección de dependencias (`container.ts`) y los Casos de Uso. Toda la lógica de negocio (como restar el stock de un pack) está centralizada en los Casos de Uso. Si necesitamos escalar, podemos agregar validaciones, colas, o cambiar el repositorio (la base de datos) a un sistema más robusto sin que los componentes de la interfaz de usuario se enteren ni se rompan."
