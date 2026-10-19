// 회신 초안(api/_reply-draft.mjs)이 쓰는 라벨을 서버용 정적 ESM으로 내보낸다.
// 실행: npx vite-node scripts/gen-reply-labels.ts
// 진단 문항(src/data/checks)·비자 접수 질문(src/data/visaIntake)·사무소 정보(src/data/office.json)가 바뀌면
// 다시 실행한다 — src/test/replyLabels.sync.test.ts가 불일치를 잡는다.
import { writeFileSync } from 'node:fs';
import { buildReplyLabels } from '../src/lib/replyLabels';

writeFileSync(
  'api/_reply-labels.mjs',
  `// scripts/gen-reply-labels.ts가 생성한 파일 — 직접 편집하지 마세요.\nexport default ${JSON.stringify(buildReplyLabels(), null, 2)};\n`,
);
console.log('api/_reply-labels.mjs 갱신 완료');
