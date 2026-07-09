export type CheckDomain = 'dui' | 'suspension' | 'veterans';

export type ResultLevel = 'ready' | 'documents' | 'official' | 'urgent';

export interface QuestionOption {
  id: string;
  label: string;
  level: ResultLevel;
  note: string;           // 결과 화면 안내 문구
  lawRef?: string;        // 근거 법령 (예: '행정심판법 제27조')
}

export interface Question {
  id: string;
  text: string;
  help?: string;
  options: QuestionOption[];
}

export interface CheckDefinition {
  domain: CheckDomain;
  title: string;
  intro: string;
  questions: Question[];
}
