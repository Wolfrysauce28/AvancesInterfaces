import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { User, UserRole } from '../../domain/entities/User';
import { supabase } from '../datasources/supabaseClient';
import { isBrowser } from '../helpers/env';

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
      // Si el correo no está confirmado, avisar al usuario directamente
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('Por favor, confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
      }

      // Si el usuario no existe, intentar registrarlo automáticamente
      if (authError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
              name: role === 'admin' ? 'Admin - El Trigo' : 'Juan Pérez'
            }
          }
        });

        if (signUpError) {
          throw new Error(`Error al registrar usuario: ${signUpError.message}`);
        }

        const user = signUpData.user;
        if (!user) {
          throw new Error('No se pudo crear el usuario.');
        }

        // Si Supabase requiere confirmación de email (lo cual es el default), la sesión será null.
        if (!signUpData.session) {
          throw new Error('¡Cuenta creada! Por favor, revisa tu correo electrónico para verificar tu cuenta antes de continuar.');
        }

        // Crear perfil asociado
        const defaultName = email.split('@')[0];
        const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        const newProfile = {
          id: user.id,
          email: email,
          name: role === 'admin' ? 'Admin - El Trigo' : formattedName,
          role: role,
          avatar_url: role === 'admin' 
            ? 'https://i.pravatar.cc/100?img=33' 
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${defaultName}`,
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
      const defaultName = email.split('@')[0];
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const fallbackProfile = {
        id: authUser.id,
        email: email,
        name: role === 'admin' ? 'Admin - El Trigo' : formattedName,
        role: role,
        avatar_url: role === 'admin' 
          ? 'https://i.pravatar.cc/100?img=33' 
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${defaultName}`,
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      // Fallback si RLS bloquea la lectura de la tabla profiles o si el perfil no existe
      return {
        id: session.user.id,
        name: session.user.user_metadata?.name || 'Usuario',
        email: session.user.email || '',
        role: (session.user.user_metadata?.role as UserRole) || 'client',
        avatarUrl: 'https://i.pravatar.cc/100?img=32',
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

  async loginWithGoogle(): Promise<User> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: isBrowser() ? `${window.location.origin}/client` : undefined
      }
    });

    if (error) {
      throw new Error(`Error de autenticación con Google: ${error.message}`);
    }

    // Since this is an OAuth redirect, the function will not immediately return the user.
    // The redirect will happen and Supabase will handle the session on the next load.
    // So we just return a placeholder or throw a small redirect signal if needed.
    // Or we return a dummy user. Real user will be fetched via getCurrentUser after redirect.
    return {
      id: 'pending',
      name: 'Redirigiendo...',
      email: 'pending',
      role: 'client',
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async updateProfile(userId: string, updates: { name?: string; avatarUrl?: string }): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) throw new Error('No hay sesión activa');

    // Mapear campos a snake_case de Supabase
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando perfil en Supabase: ${error.message}`);
    }

    return {
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      role: updatedProfile.role as UserRole,
      avatarUrl: updatedProfile.avatar_url,
      storeId: updatedProfile.store_id || undefined,
    };
  }
}
