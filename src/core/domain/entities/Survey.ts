export interface SurveyOption {
  value: string;
  label: string;
  emoji: string;
}

export type SurveyQuestionType = 'single' | 'multiple';

export interface SurveyQuestion {
  id: number;
  block: string;
  blockNum: number;
  title: string;
  desc: string;
  type: SurveyQuestionType;
  options: SurveyOption[];
}

export type SurveyAnswers = Record<number, string | string[]>;
