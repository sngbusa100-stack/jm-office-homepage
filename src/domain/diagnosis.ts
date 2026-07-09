import type { CheckDefinition, CheckDomain, ResultLevel } from '../types/content';

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

export function classifyAnswers(definition: CheckDefinition, answers: Answers): DiagnosisResult {
  const items: ResultItem[] = [];
  for (const question of definition.questions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) continue;
    items.push({
      questionId: question.id,
      questionText: question.text,
      answerLabel: option.label,
      level: option.level,
      note: option.note,
      lawRef: option.lawRef,
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
