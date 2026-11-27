export type CheckDomain = 'dui' | 'suspension' | 'veterans' | 'permit' | 'land' | 'procurement' | 'appeal';

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
  showWhen?: Record<string, string[]>;
  options: QuestionOption[];
}

/**
 * 다른 문항의 답에 따라 한 문항의 안내 문구를 바꾼다(예: 이의신청 결과를 받은 사람의 행정심판 기한).
 * level을 적으면 등급도 바꾼다(예: 이미 행정심판을 청구해 날짜가 급하지 않은 경우).
 * 서버(api/_check-levels.mjs overrides)도 같은 규칙으로 긴급 여부를 다시 계산한다.
 */
export interface AnswerOverride {
  questionId: string;
  when: Record<string, string[]>; // 문항 id → 이 답들 중 하나일 때. 모든 문항이 맞아야 적용한다
  note: string;
  lawRef?: string;
  level?: ResultLevel;
}

export interface CheckDefinition {
  domain: CheckDomain;
  title: string;
  intro: string;
  /** 홈·진단 선택 카드용 한 줄. 일반 정보 고지는 구역 안내에 한 번만 두므로 여기에 넣지 않는다 */
  summary: string;
  questions: Question[];
  overrides?: AnswerOverride[]; // 앞에 있는 것이 먼저 적용된다
}
