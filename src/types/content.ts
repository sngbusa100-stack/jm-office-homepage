export type CheckDomain = 'dui' | 'suspension' | 'veterans' | 'permit';

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

/**
 * 다른 문항의 답에 따라 한 문항의 안내 문구를 바꾼다(예: 이의신청 결과를 받은 사람의 행정심판 기한).
 * 등급은 바꾸지 않는다 — 서버(api/_check-levels.mjs)가 선택지 등급으로 긴급 여부를 다시 계산한다.
 */
export interface AnswerOverride {
  questionId: string;
  when: Record<string, string[]>; // 문항 id → 이 답들 중 하나일 때. 모든 문항이 맞아야 적용한다
  note: string;
  lawRef?: string;
}

export interface CheckDefinition {
  domain: CheckDomain;
  title: string;
  intro: string;
  questions: Question[];
  overrides?: AnswerOverride[]; // 앞에 있는 것이 먼저 적용된다
}
