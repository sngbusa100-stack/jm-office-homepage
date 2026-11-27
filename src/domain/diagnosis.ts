import type { CheckDefinition, CheckDomain, ResultLevel } from '../types/content';

import { matchesAnswers } from '../../api/_diagnosis-routing.mjs';

// 앞선 문항의 유효한 답만 다음 분기에 사용한다. 이전으로 돌아가 답을 바꾸면 사라진 가지의 답은 제외한다.
export function checkPath(definition: CheckDefinition, input: Answers) {
  const answers: Answers = {};
  const questions = definition.questions.filter((question) => {
    if (!matchesAnswers(question.showWhen, answers)) return false;
    const value = input[question.id];
    if (question.options.some((option) => option.id === value)) answers[question.id] = value;
    return true;
  });
  return { questions, answers };
}

export const LEVEL_LABEL: Record<ResultLevel, string> = {
  urgent: '먼저 확인할 일정',
  documents: '챙겨 둘 자료',
  official: '담당 기관에 물어볼 내용',
  ready: '상담 때 참고할 내용',
};

export const LEVEL_ORDER: ResultLevel[] = ['urgent', 'documents', 'official', 'ready'];

export interface ResultItem {
  questionId: string;
  questionText: string;
  answerLabel: string;
  level: ResultLevel;
  note: string;
  lawRef?: string;
}

export interface DiagnosisResult {
  items: ResultItem[];
}

export interface DiagnosisSummary {
  domain: CheckDomain;
  title: string;
  counts: Record<ResultLevel, number>;
}

export type Answers = Record<string, string>;

export function classifyAnswers(definition: CheckDefinition, input: Answers): DiagnosisResult {
  const { questions, answers } = checkPath(definition, input);
  const items: ResultItem[] = [];
  for (const question of questions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) continue;
    const override = definition.overrides?.find(
      (o) => o.questionId === question.id && Object.entries(o.when).every(([id, optionIds]) => optionIds.includes(answers[id])),
    );
    items.push({
      questionId: question.id,
      questionText: question.text,
      answerLabel: option.label,
      level: option.level,
      note: override ? override.note : option.note,
      lawRef: override ? override.lawRef : option.lawRef,
    });
  }
  items.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
  return { items };
}

export function summarize(definition: CheckDefinition, result: DiagnosisResult): DiagnosisSummary {
  const counts: Record<ResultLevel, number> = { urgent: 0, documents: 0, official: 0, ready: 0 };
  for (const item of result.items) counts[item.level] += 1;
  return { domain: definition.domain, title: definition.title, counts };
}
