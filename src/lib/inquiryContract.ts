// 홈페이지 접수 레코드 ↔ 로컬 행정심판 시스템(admin_appeal/connector/store.py) 연동 계약.
// 이 모듈은 테스트(src/test/inquiryContract.test.ts)가 api/_inquiry-contract.json을 만들고 대조할 때만 쓴다.
// 앱 화면 번들에는 들어가지 않는다(서버 모듈을 가져오기 때문).
import { VISA_INTAKE_LABELS } from '../data/visaIntake';
// @ts-expect-error — 서버 모듈(.mjs)은 타입 선언이 없다.
import { buildInquiryRecord, CONNECTOR_STATUS_RULES, SCHEMA_VERSION } from '../../api/_store.mjs';
import { TOPIC_ROUTES } from '../../api/_reply-draft.mjs';

/** 미처리 건 기준(2026-10-19 주인님 승인). 로컬 연동기가 지연 표시·경고·자동 종결에 쓴다. */
export const STALE_RULES = { delayHours: 72, urgentDelayHours: 24, warnDays: 30, autoCloseDays: 90 };

/** 접수 뒤 처리 과정에서 붙는 필드(관리 화면·연동기·파기). */
const LIFECYCLE_FIELDS = [
  'updatedAt', 'doneAt', 'pipelineStageAt', 'pulledAt', 'localCaseId',
  'localStatus', 'localStatusAt', 'localCloseReason', 'purged', 'purgedAt', 'memoCount',
];

/** 로컬이 반드시 보관해야 하는 고객 제공·동의 필드. 수임 뒤 클라우드를 파기하면 로컬 사본만 남는다. */
const LOCAL_MUST_KEEP = [
  'id', 'schemaVersion', 'receivedAt', 'name', 'phone', 'email', 'topic', 'message',
  'diagnosis', 'visaDiagnosis', 'visaIntake', 'sourcePath', 'utmSource', 'attribution', 'consent',
];

export function buildInquiryContract() {
  // 모든 선택 항목을 채운 접수로 실제 레코드 필드 목록을 뽑는다.
  const sample = buildInquiryRecord(
    {
      name: 'x', phone: 'x', email: 'x', topic: 'x', message: 'x',
      diagnosis: {}, visaDiagnosis: {}, visaIntake: {}, sourcePath: 'x', utmSource: 'x', attribution: {},
    },
    { origin: 'x' },
    { id: 'JM-CONTRACT', now: new Date('2026-01-01T00:00:00.000Z') },
  ) as Record<string, unknown>;

  const visaIntakeLabels = Object.fromEntries(
    Object.entries(VISA_INTAKE_LABELS).map(([key, def]) => [
      key,
      {
        question: def.question,
        ...(def.options ? { options: Object.fromEntries(def.options.map((o) => [o.value, o.label])) } : {}),
      },
    ]),
  );

  return {
    note: '홈페이지(api/_store.mjs)와 로컬(admin_appeal/connector/store.py)의 연동 계약. 직접 고치지 말고 npm run contract:inquiry로 다시 만든다.',
    schemaVersion: SCHEMA_VERSION as number,
    recordFields: Object.keys(sample),
    lifecycleFields: LIFECYCLE_FIELDS,
    localMustKeep: LOCAL_MUST_KEEP,
    connectorStatus: CONNECTOR_STATUS_RULES as Record<string, string[]>,
    staleRules: STALE_RULES,
    // 상담 분야 → 처리 경로(case: 로컬 사건 유형으로 전환 / reply: 회신 처리). 로컬 라우팅의 기준이다.
    topics: TOPIC_ROUTES,
    // 연동기 GET 응답에만 붙고 레코드에는 저장하지 않는 필드(replyDraft: { text, notes } | null).
    connectorGetExtras: ['replyDraft'],
    visaIntakeLabels,
  };
}
