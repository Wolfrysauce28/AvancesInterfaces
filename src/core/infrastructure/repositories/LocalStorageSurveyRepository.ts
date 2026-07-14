import type { SurveyRepository } from '../../domain/repositories/SurveyRepository';
import type { SurveyQuestion, SurveyAnswers } from '../../domain/entities/Survey';
import { MOCK_SURVEY_QUESTIONS } from '../datasources/MockData';

export class LocalStorageSurveyRepository implements SurveyRepository {
  async getQuestions(): Promise<SurveyQuestion[]> {
    return MOCK_SURVEY_QUESTIONS;
  }

  async saveAnswers(answers: SurveyAnswers): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ceromerma_client_answers', JSON.stringify(answers));
      localStorage.setItem('ceromerma_profile_completed', 'true');
    }
  }

  async getAnswers(): Promise<SurveyAnswers | null> {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('ceromerma_client_answers');
    if (!data) return null;
    try {
      return JSON.parse(data) as SurveyAnswers;
    } catch {
      return null;
    }
  }

  async isCompleted(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ceromerma_profile_completed') === 'true';
  }

  async resetSurvey(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ceromerma_client_answers');
      localStorage.removeItem('ceromerma_profile_completed');
    }
  }
}
