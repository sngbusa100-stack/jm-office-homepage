// 회신 초안·상담 준비 메모용 라벨 묶음 — scripts/gen-reply-labels.ts와 동기화 테스트만 쓴다.
// 이 파일은 화면 번들에 들어가지 않지만, 생성된 api/_reply-labels.mjs는 /admin(AdminPage)을 통해 들어간다(공개 정보만 담김).
import { checks } from '../data/checks';
import previousDiagnosis from '../data/previousDiagnosisLabels.json';
import { CONSULT_TOPIC_BY_SLUG } from '../data/consultTopics';
import { DEADLINE_REPORT_OPTIONS, URGENT_REASON_LABELS } from '../data/deadlineReport';
import office from '../data/office.json';
import { services } from '../data/services';
import { VISA_INTAKE_LABELS } from '../data/visaIntake';
import { LEVEL_LABEL } from '../domain/diagnosis';
import type { ResultLevel } from '../types/content';

/** 상담 준비 메모(api/_consult-brief.mjs)가 쓰는 분야별 업무 안내 — 업무 상세 페이지(services.ts)와 같은 내용. */
export interface BriefTopicLabels {
  service: string;
  deadlines: string[];
  documents: string[];
  process: string[];
  review: string[];
  sources: { label: string; url: string }[];
}

/** 셀프 진단 결과 화면이 고객에게 보여 준 안내(src/domain/diagnosis.ts classifyAnswers와 같은 규칙). */
export interface BriefCheckLabels {
  title: string;
  /** 문항 순서대로. 선택지별 등급·안내문·근거 */
  questions: { id: string; showWhen?: Record<string, string[]>; options: Record<string, { level: ResultLevel; note: string; lawRef?: string }> }[];
  overrides: { questionId: string; when: Record<string, string[]>; note: string; lawRef?: string }[];
}

export interface ReplyLabels {
  office: { name: string; representative: string; phone: string; email: string };
  diagnosis: Record<string, Record<string, { text: string; options: Record<string, string> }>>;
  previousDiagnosis: ReplyLabels['diagnosis'];
  visa: Record<string, { question: string; options?: Record<string, string> }>;
  brief: {
    levels: Record<ResultLevel, string>;
    topics: Record<string, BriefTopicLabels>;
    specificServices: Record<string, BriefTopicLabels>;
    checks: Record<string, BriefCheckLabels>;
    deadlineReport: Record<string, string>;
    urgentReasons: Record<string, string>;
  };
}

export const OFFICE_NAME = '정명 행정사사무소';

function buildBriefLabels(): ReplyLabels['brief'] {
  const topics: Record<string, BriefTopicLabels> = {};
  const specificServices: Record<string, BriefTopicLabels> = {};
  for (const service of services) {
    const topic = CONSULT_TOPIC_BY_SLUG[service.consultTopic];
    // 같은 상담 분야를 쓰는 업무가 둘 이상이면(인허가: license·land-development) 앞에 둔 업무가 그 분야의 안내가 된다.
    if (!topic) continue;
    const info = {
      service: service.name,
      deadlines: service.deadlines ?? [],
      documents: service.documents,
      process: service.process,
      review: service.professionalReview,
      sources: service.officialSources.map((s) => ({ label: s.label, url: s.url })),
    };
    topics[topic] ??= info;
    if (service.slug === 'land-development' || service.slug === 'procurement') specificServices[service.slug] = info;
  }
  return {
    levels: LEVEL_LABEL,
    topics,
    specificServices,
    checks: Object.fromEntries(
      Object.entries(checks).map(([domain, definition]) => [
        domain,
        {
          title: definition.title,
          questions: definition.questions.map((q) => ({
            id: q.id,
            ...(q.showWhen ? { showWhen: q.showWhen } : {}),
            options: Object.fromEntries(
              q.options.map((o) => [
                o.id,
                { level: o.level, note: o.note, ...(o.lawRef ? { lawRef: o.lawRef } : {}) },
              ]),
            ),
          })),
          overrides: (definition.overrides ?? []).map((o) => ({
            questionId: o.questionId,
            when: o.when,
            note: o.note,
            ...(o.lawRef ? { lawRef: o.lawRef } : {}),
          })),
        },
      ]),
    ),
    deadlineReport: Object.fromEntries(DEADLINE_REPORT_OPTIONS.map((o) => [o.value, o.label])),
    urgentReasons: { ...URGENT_REASON_LABELS },
  };
}

export function buildReplyLabels(): ReplyLabels {
  return {
    // 휴대폰은 회신 서명에 넣지 않는다(사무실 전화·이메일만, 2026-10-19 주인님 결정).
    office: {
      name: OFFICE_NAME,
      representative: office.representative,
      phone: office.phone,
      email: office.email,
    },
    diagnosis: Object.fromEntries(
      Object.entries(checks).map(([domain, definition]) => [
        domain,
        Object.fromEntries(
          definition.questions.map((q) => [
            q.id,
            { text: q.text, options: Object.fromEntries(q.options.map((o) => [o.id, o.label])) },
          ]),
        ),
      ]),
    ),
    previousDiagnosis,
    visa: Object.fromEntries(
      Object.entries(VISA_INTAKE_LABELS).map(([key, def]) => [
        key,
        {
          question: def.question,
          ...(def.options ? { options: Object.fromEntries(def.options.map((o) => [o.value, o.label])) } : {}),
        },
      ]),
    ),
    brief: buildBriefLabels(),
  };
}
