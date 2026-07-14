import type { SurveyQuestion, SurveyAnswers } from '../entities/Survey';

export interface SurveyRepository {
  getQuestions(): Promise<SurveyQuestion[]>;
  saveAnswers(answers: SurveyAnswers): Promise<void>;
  getAnswers(): Promise<SurveyAnswers | null>;
  isCompleted(): Promise<boolean>;
  resetSurvey(): Promise<void>;
}
