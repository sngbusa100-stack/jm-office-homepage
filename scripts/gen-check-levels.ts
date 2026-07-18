// 진단 정의(문항·선택지·등급)를 서버 검증용 정적 ESM으로 내보낸다.
// 실행: npx vite-node scripts/gen-check-levels.ts
// src/data/checks가 바뀌면 다시 실행한다 — src/test/checkLevels.sync.test.ts가 불일치를 잡는다.
import { writeFileSync } from 'node:fs';
import { checks } from '../src/data/checks';

const out: Record<string, Record<string, Record<string, string>>> = {};
for (const [domain, definition] of Object.entries(checks)) {
  out[domain] = {};
  for (const question of definition.questions) {
    out[domain][question.id] = Object.fromEntries(
      question.options.map((option) => [option.id, option.level]),
    );
  }
}
writeFileSync(
  'api/_check-levels.mjs',
  `// scripts/gen-check-levels.ts가 생성한 파일 — 직접 편집하지 마세요.\nexport default ${JSON.stringify(out, null, 2)};\n`,
);
console.log('api/_check-levels.mjs 갱신 완료');
