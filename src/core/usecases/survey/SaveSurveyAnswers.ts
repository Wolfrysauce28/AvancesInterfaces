import type { SurveyRepository } from '../../domain/repositories/SurveyRepository';
import type { SurveyAnswers } from '../../domain/entities/Survey';

export class SaveSurveyAnswers {
  constructor(private surveyRepository: SurveyRepository) {}

  async execute(answers: SurveyAnswers): Promise<void> {
    if (Object.keys(answers).length === 0) {
      throw new Error('Las respuestas de la encuesta no pueden estar vacías.');
    }
    return this.surveyRepository.saveAnswers(answers);
  }
}
