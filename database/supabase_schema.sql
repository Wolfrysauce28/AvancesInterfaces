-- =========================================================
-- ESQUEMA DE BASE DE DATOS PARA CEROMERMA (SUPABASE)
-- Ejecuta este script en el editor SQL de tu panel de Supabase
-- =========================================================

-- 1. Tabla de Perfiles de Usuario (Sincronizado con Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
  avatar_url TEXT,
  store_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para seguridad en perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de perfiles a todos" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Permitir insertar/actualizar su propio perfil" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- 2. Tabla de Packs de Alimentos (Inventario)
CREATE TABLE IF NOT EXISTS public.packs (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  discounted_price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0),
  collection_time TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT false NOT NULL,
  co2_saved_kg NUMERIC(5, 2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en packs
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de packs pública" ON public.packs
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción y edición a cualquier usuario autenticado" ON public.packs
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Tabla de Encuestas / Registro de Clientes
CREATE TABLE IF NOT EXISTS public.surveys (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  answers JSONB NOT NULL,
  completed BOOLEAN DEFAULT true NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en surveys
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de encuestas de manera privada" ON public.surveys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserción y edición de su propia encuesta" ON public.surveys
  FOR ALL USING (auth.uid() = user_id);

-- 4. Datos Iniciales de Packs (Mock Data)
INSERT INTO public.packs (id, store_id, store_name, name, description, image_url, original_price, discounted_price, stock, collection_time, is_urgent, co2_saved_kg, category)
VALUES
  (
    'pack-1',
    'store-el-trigo',
    'Panadería El Trigo',
    'Pack Sorpresa Dulce',
    'Rescata este delicioso pack con productos horneados del día. Puede incluir cruasanes, panes artesanales, donas o empanadas dulces. ¡Perfecto para compartir el desayuno o la merienda!',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    15.00,
    4.50,
    3,
    'Hoy 19:30 - 20:30',
    true,
    2.5,
    'panaderia'
  ),
  (
    'pack-2',
    'store-burger-house',
    'Burger House',
    'Sobras Clásicas + Papas',
    'Una hamburguesa gourmet del día con papas rústicas. Todo preparado fresco pero que no se llegó a vender en las horas punta. ¡Ayúdanos a evitar que se deseche!',
    'https://images.unsplash.com/photo-1512152272829-e3139592d56f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    12.00,
    6.00,
    2,
    'Hoy 21:00 - 22:00',
    false,
    3.2,
    'platos_fuertes'
  ),
  (
    'pack-3',
    'store-el-trigo',
    'Panadería El Trigo',
    'Panes Artesanales (Ayer)',
    'Surtido de panes artesanales de masa madre horneados el día de ayer. Están en perfectas condiciones para tostadas, budín de pan o consumo inmediato.',
    'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=200&q=80',
    10.00,
    3.00,
    0,
    'Hoy 17:00 - 18:00',
    false,
    1.8,
    'panaderia'
  ),
  (
    'pack-4',
    'store-salad-bar',
    'Green Salad Bar',
    'Pack Ensalada & Wrap',
    'Incluye una ensalada César fresca del día y un wrap de pollo/vegetales. Sellado al vacío y listo para consumir de manera saludable.',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    14.00,
    5.50,
    5,
    'Hoy 15:00 - 16:30',
    false,
    1.5,
    'saludable'
  )
ON CONFLICT (id) DO UPDATE SET
  stock = EXCLUDED.stock,
  original_price = EXCLUDED.original_price,
  discounted_price = EXCLUDED.discounted_price,
  collection_time = EXCLUDED.collection_time;
