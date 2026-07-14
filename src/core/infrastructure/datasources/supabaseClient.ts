import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'undefined' && 
  supabaseAnonKey !== 'undefined' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

// Usar credenciales placeholder durante el build si no están configuradas
// para prevenir que createClient lance un error de validación de URL.
const urlToUse = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const keyToUse = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(urlToUse, keyToUse);
