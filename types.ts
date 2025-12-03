export enum AppView {
  LANDING = 'LANDING',
  QUIZ = 'QUIZ',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
}

export interface Question {
  id: number;
  optionA: string;
  optionB: string;
}

export interface Answer {
  questionId: number;
  selectedOption: 'A' | 'B';
  selectedText: string;
}

export enum DomainType {
  EXECUTING = '執行力',
  INFLUENCING = '影響力',
  RELATIONSHIP_BUILDING = '建立關係',
  STRATEGIC_THINKING = '戰略思維',
}

export interface StrengthItem {
  name: string;
  domain: DomainType;
  description: string;
  advice: string;
}

export interface AssessmentResult {
  id: string;
  date: string;
  topStrengths: StrengthItem[];
  domainDistribution: {
    [key in DomainType]: number;
  };
  summary: string;
}

export const DOMAIN_COLORS = {
  [DomainType.EXECUTING]: '#8b5cf6', // Violet
  [DomainType.INFLUENCING]: '#f59e0b', // Amber
  [DomainType.RELATIONSHIP_BUILDING]: '#3b82f6', // Blue
  [DomainType.STRATEGIC_THINKING]: '#10b981', // Emerald
};