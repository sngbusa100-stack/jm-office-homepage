// 회신 초안용 라벨 묶음 — scripts/gen-reply-labels.ts와 동기화 테스트만 쓴다.
// 이 파일은 화면 번들에 들어가지 않지만, 생성된 api/_reply-labels.mjs는 /admin(AdminPage)을 통해 들어간다(공개 정보만 담김).
import { checks } from '../data/checks';
import office from '../data/office.json';
import { VISA_INTAKE_LABELS } from '../data/visaIntake';

export interface ReplyLabels {
  office: { name: string; representative: string; phone: string; email: string };
  diagnosis: Record<string, Record<string, { text: string; options: Record<string, string> }>>;
  visa: Record<string, { question: string; options?: Record<string, string> }>;
}

export const OFFICE_NAME = '정명 행정사사무소';

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
    visa: Object.fromEntries(
      Object.entries(VISA_INTAKE_LABELS).map(([key, def]) => [
        key,
        {
          question: def.question,
          ...(def.options ? { options: Object.fromEntries(def.options.map((o) => [o.value, o.label])) } : {}),
        },
      ]),
    ),
  };
}
