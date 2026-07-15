import type { SurveyRepository } from '../../domain/repositories/SurveyRepository';
import type { SurveyQuestion, SurveyAnswers } from '../../domain/entities/Survey';
import { MOCK_SURVEY_QUESTIONS } from '../datasources/MockData';
import { isBrowser } from '../helpers/env';

export class LocalStorageSurveyRepository implements SurveyRepository {
  async getQuestions(): Promise<SurveyQuestion[]> {
    return MOCK_SURVEY_QUESTIONS;
  }

  async saveAnswers(answers: SurveyAnswers): Promise<void> {
    if (isBrowser()) {
      localStorage.setItem('foodsave_client_answers', JSON.stringify(answers));
      localStorage.setItem('foodsave_profile_completed', 'true');
    }
  }

  async getAnswers(): Promise<SurveyAnswers | null> {
    if (!isBrowser()) return null;
    const data = localStorage.getItem('foodsave_client_answers');
    if (!data) return null;
    try {
      return JSON.parse(data) as SurveyAnswers;
    } catch {
      return null;
    }
  }

  async isCompleted(): Promise<boolean> {
    if (!isBrowser()) return false;
    return localStorage.getItem('foodsave_profile_completed') === 'true';
  }

  async resetSurvey(): Promise<void> {
    if (isBrowser()) {
      localStorage.removeItem('foodsave_client_answers');
      localStorage.removeItem('foodsave_profile_completed');
    }
  }
}
