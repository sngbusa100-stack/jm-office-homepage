// 진단 정의(문항·선택지·등급)를 서버 검증용 정적 ESM으로 내보낸다.
// 실행: npx vite-node scripts/gen-check-levels.ts
// src/data/checks가 바뀌면 다시 실행한다 — src/test/checkLevels.sync.test.ts가 불일치를 잡는다.
import { writeFileSync } from 'node:fs';
import { checks } from '../src/data/checks';
import { diagnosisForm } from '../api/_diagnosis-routing.mjs';

const visibility: Record<string, Record<string, Record<string, string[]>>> = {};
const forms: Record<string, string> = {};
const overrides: Record<string, { questionId: string; when: Record<string, string[]>; level: string }[]> = {};
const out: Record<string, Record<string, Record<string, string>>> = {};
for (const [domain, definition] of Object.entries(checks)) {
  out[domain] = {};
  visibility[domain] = {};
  forms[domain] = diagnosisForm(definition);
  overrides[domain] = (definition.overrides ?? []).flatMap((o) =>
    o.level ? [{ questionId: o.questionId, when: o.when, level: o.level }] : [],
  );
  for (const question of definition.questions) {
    if (question.showWhen) visibility[domain][question.id] = question.showWhen;
    out[domain][question.id] = Object.fromEntries(
      question.options.map((option) => [option.id, option.level]),
    );
  }
}
const json = (value: unknown) => JSON.stringify(value, null, 2);
writeFileSync(
  'api/_check-levels.mjs',
  [
    '// scripts/gen-check-levels.ts가 생성한 파일 — 직접 편집하지 마세요.',
    `export const visibility = ${json(visibility)};`,
    '// 문항 판 표시(api/_diagnosis-routing.mjs diagnosisForm). 문항을 고치면 바뀐다.',
    `export const forms = ${json(forms)};`,
    '// 다른 답에 따라 등급을 바꾸는 덮어쓰기(src/types/content.ts AnswerOverride.level)',
    `export const overrides = ${json(overrides)};`,
    `export default ${json(out)};`,
    '',
  ].join('\n'),
);
console.log('api/_check-levels.mjs 갱신 완료');
