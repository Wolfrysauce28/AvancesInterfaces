import type { SurveyRepository } from '../../domain/repositories/SurveyRepository';
import type { SurveyQuestion, SurveyAnswers } from '../../domain/entities/Survey';
import { MOCK_SURVEY_QUESTIONS } from '../datasources/MockData';
import { supabase } from '../datasources/supabaseClient';

export class SupabaseSurveyRepository implements SurveyRepository {
  async getQuestions(): Promise<SurveyQuestion[]> {
    return MOCK_SURVEY_QUESTIONS;
  }

  async saveAnswers(answers: SurveyAnswers): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      // Fallback a localStorage si no está autenticado
      if (typeof window !== 'undefined') {
        localStorage.setItem('ceromerma_client_answers', JSON.stringify(answers));
        localStorage.setItem('ceromerma_profile_completed', 'true');
      }
      return;
    }

    const { error } = await supabase
      .from('surveys')
      .upsert({
        user_id: session.user.id,
        answers: answers,
        completed: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Error al guardar respuestas en Supabase: ${error.message}`);
    }

    // Sincronizar localmente también para consistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem('ceromerma_profile_completed', 'true');
    }
  }

  async getAnswers(): Promise<SurveyAnswers | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      if (typeof window === 'undefined') return null;
      const localData = localStorage.getItem('ceromerma_client_answers');
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
    if (!session || !session.user) {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem('ceromerma_profile_completed') === 'true';
    }

    const { data, error } = await supabase
      .from('surveys')
      .select('completed')
      .eq('user_id', session.user.id)
      .single();

    if (error || !data) return false;
    return data.completed;
  }

  async resetSurvey(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ceromerma_client_answers');
      localStorage.removeItem('ceromerma_profile_completed');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await supabase
        .from('surveys')
        .delete()
        .eq('user_id', session.user.id);
    }
  }
}
