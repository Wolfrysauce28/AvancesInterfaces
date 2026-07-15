import type { SurveyQuestion } from '../../domain/entities/Survey';
import type { Pack } from '../../domain/entities/Pack';

export const MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  // BLOQUE 1: PERFIL GENERAL E IDENTIFICACIÓN
  {
    id: 1,
    block: "Perfil General",
    blockNum: 1,
    title: "¿En qué rango de edad te encuentras?",
    desc: "Esto nos ayuda a segmentar opciones relevantes para ti.",
    type: "single",
    options: [
      { value: "18-24", label: "18 a 24 años", emoji: "🎓" },
      { value: "25-34", label: "25 a 34 años", emoji: "💼" },
      { value: "35-49", label: "35 a 49 años", emoji: "🙋‍♂️" },
      { value: "50+", label: "50 años o más", emoji: "🌟" }
    ]
  },
  {
    id: 2,
    block: "Perfil General",
    blockNum: 1,
    title: "¿Cuál es tu ocupación principal?",
    desc: "Adecuamos las notificaciones a tus posibles horarios libres.",
    type: "single",
    options: [
      { value: "estudiante", label: "Estudiante", emoji: "📚" },
      { value: "empleado", label: "Empleado / Profesional", emoji: "👔" },
      { value: "independiente", label: "Trabajador Independiente", emoji: "🛠️" },
      { value: "otro", label: "Otros / En transición", emoji: "✨" }
    ]
  },
  {
    id: 3,
    block: "Perfil General",
    blockNum: 1,
    title: "¿Qué distancia máxima estás dispuesto a recorrer para rescatar comida?",
    desc: "Filtrará de forma predeterminada tu mapa de comercios.",
    type: "single",
    options: [
      { value: "cerca", label: "Menos de 1 km (Caminando)", emoji: "🚶" },
      { value: "medio", label: "Entre 1 y 3 km (Bici / Scooter)", emoji: "🚲" },
      { value: "lejos", label: "Más de 3 km (Vehículo propio)", emoji: "🚗" }
    ]
  },
  {
    id: 4,
    block: "Perfil General",
    blockNum: 1,
    title: "¿Qué medio de transporte sueles utilizar para tus desplazamientos diarios?",
    desc: "Nos ayuda a calcular las emisiones que evitas al desplazarte.",
    type: "single",
    options: [
      { value: "pie", label: "Caminando", emoji: "👟" },
      { value: "bici", label: "Bicicleta o Vehículo Eléctrico", emoji: "🛴" },
      { value: "publico", label: "Transporte Público", emoji: "🚌" },
      { value: "auto", label: "Automóvil / Moto particular", emoji: "🚗" },
      { value: "otro", label: "Otros medios", emoji: "🛸" }
    ]
  },
  {
    id: 5,
    block: "Perfil General",
    blockNum: 1,
    title: "¿Cómo conociste FoodSave?",
    desc: "Ayúdanos a entender dónde está nuestra comunidad.",
    type: "single",
    options: [
      { value: "social", label: "Redes Sociales", emoji: "📱" },
      { value: "recomendacion", label: "Recomendación de un amigo", emoji: "👥" },
      { value: "prensa", label: "Prensa o Publicaciones", emoji: "📰" },
      { value: "local", label: "Visto directamente en un local", emoji: "🏪" },
      { value: "otro", label: "Otros", emoji: "❓" }
    ]
  },
  // BLOQUE 2: PREFERENCIAS ALIMENTICIAS Y ALERGIAS
  {
    id: 6,
    block: "Preferencias Alimenticias",
    blockNum: 2,
    title: "¿Sigues algún tipo de dieta específica?",
    desc: "Selecciona tu tipo de alimentación habitual para priorizar categorías.",
    type: "single",
    options: [
      { value: "sin_restricciones", label: "Sin restricciones (Como de todo)", emoji: "🍽️" },
      { value: "vegetariano", label: "Vegetariano", emoji: "🥑" },
      { value: "vegano", label: "Vegano", emoji: "🌱" },
      { value: "flexitariano", label: "Flexitariano (Poca carne)", emoji: "🐟" }
    ]
  },
  {
    id: 7,
    block: "Preferencias Alimenticias",
    blockNum: 2,
    title: "¿Tienes alergias o restricciones médicas? (Multiselección)",
    desc: "Marcaremos advertencias en productos que contengan estos elementos.",
    type: "multiple",
    options: [
      { value: "ninguna", label: "Ninguna alergia", emoji: "✅" },
      { value: "gluten", label: "Gluten (Celiaco)", emoji: "🌾" },
      { value: "lactosa", label: "Lactosa / Lácteos", emoji: "🥛" },
      { value: "frutos_secos", label: "Frutos secos / Maní", emoji: "🥜" },
      { value: "mariscos", label: "Mariscos / Pescados", emoji: "🍤" }
    ]
  },
  {
    id: 8,
    block: "Preferencias Alimenticias",
    blockNum: 2,
    title: "¿Cuáles son tus categorías de comida favoritas? (Multiselección)",
    desc: "Personaliza tu menú de inicio rápido.",
    type: "multiple",
    options: [
      { value: "panaderia", label: "Panadería y Pastelería", emoji: "🥐" },
      { value: "platos_fuertes", label: "Platos Preparados / Menús", emoji: "🍲" },
      { value: "frutas_verduras", label: "Frutas y Verduras frescas", emoji: "🍎" },
      { value: "lacteos_embutidos", label: "Lácteos y Embutidos", emoji: "🧀" },
      { value: "bebidas", label: "Jugos, Café y Bebidas", emoji: "🥤" },
      { value: "otros", label: "Otros / Sorpresa", emoji: "🎁" }
    ]
  },
  {
    id: 9,
    block: "Preferencias Alimenticias",
    blockNum: 2,
    title: "¿Con qué frecuencia compras comida preparada fuera de casa?",
    desc: "Así comprendemos tus necesidades de consumo diario.",
    type: "single",
    options: [
      { value: "diario", label: "Todos los días o casi todos", emoji: "📅" },
      { value: "semanal", label: "2 a 3 veces por semana", emoji: "⏳" },
      { value: "ocasional", label: "Rara vez o solo fines de semana", emoji: "🎉" }
    ]
  },
  {
    id: 10,
    block: "Preferencias Alimenticias",
    blockNum: 2,
    title: "¿En qué momentos del día buscas comida lista para consumir?",
    desc: "Para enviarte notificaciones cuando los comercios publican excedentes listos.",
    type: "multiple",
    options: [
      { value: "desayuno", label: "Mañana (Desayuno/Brunch)", emoji: "☕" },
      { value: "almuerzo", label: "Mediodía (Almuerzo)", emoji: "🍱" },
      { value: "tarde", label: "Tarde (Meriendas)", emoji: "🍰" },
      { value: "cena", label: "Noche (Cena/Cierre de locales)", emoji: "🍕" },
      { value: "cualquiera", label: "Cualquier momento / Otros", emoji: "🕒" }
    ]
  },
  // BLOQUE 3: HÁBITOS Y MOTIVACIONES DE COMPRA
  {
    id: 11,
    block: "Hábitos y Motivación",
    blockNum: 3,
    title: "¿Cuánto sueles gastar al día en alimentación?",
    desc: "Filtraremos opciones que se acomoden a tu presupuesto.",
    type: "single",
    options: [
      { value: "bajo", label: "Menos de $5.00 USD", emoji: "🪙" },
      { value: "medio", label: "Entre $5.00 y $12.00 USD", emoji: "💵" },
      { value: "alto", label: "Más de $12.00 USD", emoji: "💳" }
    ]
  },
  {
    id: 12,
    block: "Hábitos y Motivación",
    blockNum: 3,
    title: "¿Cuál es tu principal motivación al usar FoodSave?",
    desc: "Ajusta la prioridad en el contenido del feed.",
    type: "single",
    options: [
      { value: "ahorro", label: "Ahorrar dinero en comida de calidad", emoji: "💰" },
      { value: "ecologia", label: "Ayudar al planeta / Reducir desperdicios", emoji: "🌍" },
      { value: "variedad", label: "Descubrir locales nuevos y variados", emoji: "🍽️" }
    ]
  },
  {
    id: 13,
    block: "Hábitos y Motivación",
    blockNum: 3,
    title: "¿Qué método de pago prefieres utilizar en la plataforma?",
    desc: "Para acelerar tu flujo de reserva en promociones ultrarápidas.",
    type: "single",
    options: [
      { value: "tarjeta", label: "Tarjeta de Crédito / Débito", emoji: "💳" },
      { value: "movil", label: "Pago Móvil (Apple Pay / Google Wallet)", emoji: "📲" },
      { value: "efectivo", label: "Efectivo al retirar en local", emoji: "💵" }
    ]
  },
  {
    id: 14,
    block: "Hábitos y Motivación",
    blockNum: 3,
    title: "¿Qué sueles hacer en casa cuando sobra comida?",
    desc: "Nos ayuda a perfilar tu índice de desperdicio doméstico.",
    type: "single",
    options: [
      { value: "reutilizo", label: "La guardo, congelo o transformo", emoji: "🍱" },
      { value: "desecho", label: "A veces se me olvida y termina dañándose", emoji: "🗑️" },
      { value: "organico", label: "Hago compostaje / abono orgánico", emoji: "🌱" }
    ]
  },
  {
    id: 15,
    block: "Hábitos y Motivación",
    blockNum: 3,
    title: "¿Qué tan importantes son los descuentos en tu decisión de compra?",
    desc: "Determina si te notificamos sobre ofertas relámpago con >50% desc.",
    type: "single",
    options: [
      { value: "muy", label: "Crítico: Solo compro si tiene buen descuento", emoji: "🔥" },
      { value: "medio", label: "Moderado: Es un plus pero no definitivo", emoji: "⚖️" },
      { value: "bajo", label: "Bajo: Me interesa más la calidad/causa ecológica", emoji: "🌱" }
    ]
  },
  // BLOQUE 4: USABILIDAD Y CONCIENCIA ECOLÓGICA
  {
    id: 16,
    block: "Uso de la App y Ecología",
    blockNum: 4,
    title: "¿Con qué frecuencia esperas realizar rescates de comida a la semana?",
    desc: "Nos permite ajustar el volumen de recordatorios semanales.",
    type: "single",
    options: [
      { value: "diaria", label: "Frecuente (4 a 7 veces por semana)", emoji: "⚡" },
      { value: "moderada", label: "Ocasional (1 a 3 veces por semana)", emoji: "🗓️" },
      { value: "rara", label: "Solo en emergencias o fines de mes", emoji: "🔍" }
    ]
  },
  {
    id: 17,
    block: "Uso de la App y Ecología",
    blockNum: 4,
    title: "¿Cuáles canales prefieres para recibir alertas de comida próxima a caducar?",
    desc: "Por la rapidez de estas ofertas, sugerimos notificaciones Push.",
    type: "multiple",
    options: [
      { value: "push", label: "Notificaciones Push en el Móvil", emoji: "🔔" },
      { value: "whatsapp", label: "Mensajes por WhatsApp", emoji: "💬" },
      { value: "email", label: "Correo Electrónico (Resumen diario)", emoji: "✉️" }
    ]
  },
  {
    id: 18,
    block: "Uso de la App y Ecología",
    blockNum: 4,
    title: "¿Te gustaría ver en tu perfil cuántos kilogramos de CO2 has evitado emitir?",
    desc: "Gamificación ecológica para medir tu impacto real.",
    type: "single",
    options: [
      { value: "si", label: "Sí, me parece muy motivador e interesante", emoji: "📊" },
      { value: "no", label: "No, prefiero centrarme en los ahorros directos", emoji: "❌" }
    ]
  },
  {
    id: 19,
    block: "Uso de la App y Ecología",
    blockNum: 4,
    title: "¿Estarías dispuesto a llevar tus propios recipientes a los locales para el retiro?",
    desc: "Muchos establecimientos premian esto con descuentos adicionales.",
    type: "single",
    options: [
      { value: "si_siempre", label: "Sí, siempre llevo mis envases/bolsas", emoji: "🎒" },
      { value: "a_veces", label: "A veces, si el local lo especifica", emoji: "🥣" },
      { value: "no_comodo", label: "No, prefiero que me entreguen empaquetado", emoji: "🛍️" }
    ]
  },
  {
    id: 20,
    block: "Uso de la App y Ecología",
    blockNum: 4,
    title: "¿Qué tan cómodo te sientes navegando en mapas digitales interactivos?",
    desc: "Para decidir si activamos el modo guía/tutorial al iniciar.",
    type: "single",
    options: [
      { value: "experto", label: "Muy cómodo (Uso Google Maps/Waze diario)", emoji: "🗺️" },
      { value: "basico", label: "Básico (Sé buscar direcciones básicas)", emoji: "📍" },
      { value: "tutorial", label: "Prefiero una lista ordenada en lugar de mapas", emoji: "📋" }
    ]
  }
];

export const INITIAL_MOCK_PACKS: Pack[] = [
  {
    id: "pack-1",
    storeId: "store-el-trigo",
    storeName: "Panadería El Trigo",
    name: "Pack Sorpresa Dulce",
    description: "Rescata este delicioso pack con productos horneados del día. Puede incluir cruasanes, panes artesanales, donas o empanadas dulces. ¡Perfecto para compartir el desayuno o la merienda!",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    originalPrice: 15.00,
    discountedPrice: 4.50,
    stock: 3,
    collectionTime: "Hoy 19:30 - 20:30",
    isUrgent: true,
    co2SavedKg: 2.5,
    category: "panaderia"
  },
  {
    id: "pack-2",
    storeId: "store-burger-house",
    storeName: "Burger House",
    name: "Sobras Clásicas + Papas",
    description: "Una hamburguesa gourmet del día con papas rústicas. Todo preparado fresco pero que no se llegó a vender en las horas punta. ¡Ayúdanos a evitar que se deseche!",
    imageUrl: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    originalPrice: 12.00,
    discountedPrice: 6.00,
    stock: 2,
    collectionTime: "Hoy 21:00 - 22:00",
    isUrgent: false,
    co2SavedKg: 3.2,
    category: "platos_fuertes"
  },
  {
    id: "pack-3",
    storeId: "store-el-trigo",
    storeName: "Panadería El Trigo",
    name: "Panes Artesanales (Ayer)",
    description: "Surtido de panes artesanales de masa madre horneados el día de ayer. Están en perfectas condiciones para tostadas, budín de pan o consumo inmediato.",
    imageUrl: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=200&q=80",
    originalPrice: 10.00,
    discountedPrice: 3.00,
    stock: 0,
    collectionTime: "Hoy 17:00 - 18:00",
    isUrgent: false,
    co2SavedKg: 1.8,
    category: "panaderia"
  },
  {
    id: "pack-4",
    storeId: "store-salad-bar",
    storeName: "Green Salad Bar",
    name: "Pack Ensalada & Wrap",
    description: "Incluye una ensalada César fresca del día y un wrap de pollo/vegetales. Sellado al vacío y listo para consumir de manera saludable.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    originalPrice: 14.00,
    discountedPrice: 5.50,
    stock: 5,
    collectionTime: "Hoy 15:00 - 16:30",
    isUrgent: false,
    co2SavedKg: 1.5,
    category: "saludable"
  }
];
