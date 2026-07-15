import type { SurveyRepository } from '../../domain/repositories/SurveyRepository';
import type { SurveyQuestion, SurveyAnswers } from '../../domain/entities/Survey';
import { MOCK_SURVEY_QUESTIONS } from '../datasources/MockData';
import { supabase } from '../datasources/supabaseClient';
import { isBrowser } from '../helpers/env';

export class SupabaseSurveyRepository implements SurveyRepository {
  async getQuestions(): Promise<SurveyQuestion[]> {
    return MOCK_SURVEY_QUESTIONS;
  }

  async saveAnswers(answers: SurveyAnswers): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      if (isBrowser()) {
        localStorage.setItem('foodsave_client_answers', JSON.stringify(answers));
        localStorage.setItem('foodsave_profile_completed', 'true');
      }
      return;
    }

    const { error } = await supabase
      .from('surveys')
      .upsert({
        user_id: session.user.id,
        answers,
        completed: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Error al guardar respuestas en Supabase: ${error.message}`);
    }

    if (isBrowser()) {
      localStorage.setItem(`foodsave_profile_completed_${session.user.id}`, 'true');
      localStorage.setItem('foodsave_profile_completed', 'true');
    }
  }

  async getAnswers(): Promise<SurveyAnswers | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      if (!isBrowser()) return null;
      const localData = localStorage.getItem('foodsave_client_answers');
      return localData ? JSON.parse(localData) as SurveyAnswers : null;
    }

    const { data, error } = await supabase
      .from('surveys')
      .select('answers')
      .eq('user_id', session.user.id)
      .single();

    if (error || !data) return null;
    return data.answers as SurveyAnswers;
  }

  async isCompleted(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      if (!isBrowser()) return false;
      return localStorage.getItem('foodsave_profile_completed') === 'true';
    }

    const { data, error } = await supabase
      .from('surveys')
      .select('completed')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      // Si el error es PGRST116 (no se encontró la fila en la tabla surveys), significa que es un usuario nuevo
      if (error.code === 'PGRST116') {
        return false;
      }
      // Para otros errores (ej. RLS o red), usamos el localStorage específico del usuario como plan B
      if (isBrowser()) {
        return localStorage.getItem(`foodsave_profile_completed_${session.user.id}`) === 'true';
      }
      return false;
    }

    return data ? data.completed : false;
  }

  async resetSurvey(): Promise<void> {
    if (isBrowser()) {
      localStorage.removeItem('foodsave_client_answers');
      localStorage.removeItem('foodsave_profile_completed');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('surveys')
        .delete()
        .eq('user_id', session.user.id);
    }
  }
}
