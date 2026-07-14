import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { User, UserRole } from '../../domain/entities/User';
import { supabase } from '../datasources/supabaseClient';

export class SupabaseUserRepository implements UserRepository {
  async login(email: string, password?: string, role: UserRole = 'client'): Promise<User> {
    if (!password) {
      throw new Error('La contraseña es requerida para autenticar en Supabase.');
    }

    // Intentar iniciar sesión
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Si el usuario no existe, intentar registrarlo automáticamente para facilitar las pruebas
      if (authError.message.includes('Invalid login credentials') || authError.message.includes('Email not confirmed')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw new Error(`Error al registrar usuario: ${signUpError.message}`);
        }

        const user = signUpData.user;
        if (!user) {
          throw new Error('No se pudo crear el usuario.');
        }

        // Crear perfil asociado
        const newProfile = {
          id: user.id,
          email: email,
          name: role === 'admin' ? 'Admin - El Trigo' : 'Juan Pérez',
          role: role,
          avatar_url: role === 'admin' 
            ? 'https://i.pravatar.cc/100?img=33' 
            : 'https://i.pravatar.cc/100?img=32',
          store_id: role === 'admin' ? 'store-el-trigo' : null
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (profileError) {
          console.error('Error creando perfil en base de datos:', profileError);
        }

        return {
          id: user.id,
          name: newProfile.name,
          email: newProfile.email,
          role: newProfile.role,
          avatarUrl: newProfile.avatar_url,
          storeId: newProfile.store_id || undefined,
        };
      }

      throw new Error(`Error de autenticación: ${authError.message}`);
    }

    const authUser = authData.user;
    if (!authUser) {
      throw new Error('Usuario no encontrado.');
    }

    // Obtener información adicional del perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      // Si por alguna razón no tiene perfil, crearlo
      const fallbackProfile = {
        id: authUser.id,
        email: email,
        name: role === 'admin' ? 'Admin - El Trigo' : 'Juan Pérez',
        role: role,
        avatar_url: role === 'admin' 
          ? 'https://i.pravatar.cc/100?img=33' 
          : 'https://i.pravatar.cc/100?img=32',
        store_id: role === 'admin' ? 'store-el-trigo' : null
      };

      await supabase.from('profiles').insert(fallbackProfile);

      return {
        id: authUser.id,
        name: fallbackProfile.name,
        email: fallbackProfile.email,
        role: fallbackProfile.role,
        avatarUrl: fallbackProfile.avatar_url,
        storeId: fallbackProfile.store_id || undefined,
      };
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as UserRole,
      avatarUrl: profile.avatar_url,
      storeId: profile.store_id || undefined,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as UserRole,
      avatarUrl: profile.avatar_url,
      storeId: profile.store_id || undefined,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
}
