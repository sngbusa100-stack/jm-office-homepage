import { describe, expect, it } from 'vitest';
import { classifyDiagnosis } from '../../api/_consult-brief.mjs';
import { TOPIC_ROUTES } from '../../api/_reply-draft.mjs';
import { checks } from '../data/checks';
import { CONSULT_TOPIC_BY_SLUG } from '../data/consultTopics';
import { services } from '../data/services';
import { classifyAnswers } from '../domain/diagnosis';

describe('상담 준비 메모 동기화', () => {
  it('상담 분야 슬러그 표의 이름이 서버 상담 분야와 같다(TOPIC_ROUTES = 서버 TOPICS는 _reply-draft.test가 확인)', () => {
    expect(Object.values(CONSULT_TOPIC_BY_SLUG).sort()).toEqual(Object.keys(TOPIC_ROUTES).sort());
  });

  it('업무 상세 페이지마다 상담 분야 슬러그가 표에 있다', () => {
    for (const service of services) expect(CONSULT_TOPIC_BY_SLUG[service.consultTopic]).toBeTruthy();
  });

  it('진단 결과 재현이 결과 화면(classifyAnswers)과 같다 — 모든 진단·문항·선택지와 덮어쓰기 조건', () => {
    for (const [domain, definition] of Object.entries(checks)) {
      // 각 문항의 각 선택지를 한 번씩 고르고, 덮어쓰기 조건(when)을 만족하는 답 묶음도 넣는다.
      const answerSets: Record<string, string>[] = [];
      for (const q of definition.questions) {
        for (const o of q.options) answerSets.push({ [q.id]: o.id });
      }
      for (const o of definition.overrides ?? []) {
        const answers: Record<string, string> = {};
        for (const [id, values] of Object.entries(o.when)) answers[id] = values[0];
        const target = definition.questions.find((q) => q.id === o.questionId);
        if (target && !answers[target.id]) answers[target.id] = target.options[0].id;
        answerSets.push(answers);
      }
      for (const answers of answerSets) {
        const expected = classifyAnswers(definition, answers).items.map((i) => ({
          questionId: i.questionId, questionText: i.questionText, answerLabel: i.answerLabel,
          level: i.level, note: i.note, lawRef: i.lawRef,
        }));
        expect(classifyDiagnosis({ domain, answers })).toEqual(expected);
      }
    }
  });
});
