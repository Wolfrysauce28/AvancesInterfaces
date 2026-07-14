import type { SurveyRepository } from '../../domain/repositories/SurveyRepository';
import type { SurveyQuestion } from '../../domain/entities/Survey';

export class GetSurveyQuestions {
  constructor(private surveyRepository: SurveyRepository) {}

  async execute(): Promise<SurveyQuestion[]> {
    return this.surveyRepository.getQuestions();
  }
}
