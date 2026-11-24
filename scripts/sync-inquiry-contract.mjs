// 연동 계약 파일을 로컬 행정심판 시스템으로 복사한다.
// 로컬 연동기(admin_appeal/connector)가 이 사본으로 비자 라벨·미처리 기준을 읽고, tests/test_connector.py가 저장 필드를 대조한다.
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { buildConsultBrief } from '../api/_consult-brief.mjs';
import { buildDirectReplyDraft, TOPIC_ROUTES } from '../api/_reply-draft.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../api/_inquiry-contract.json');
const target = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(here, '../../../행정사/1-행정심판/admin_appeal/connector/homepage_inquiry_contract.json');

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
// 직접 등록 문의는 고객 자료를 주고받지 않고 분야별 공개 안내만 PC에서 사용한다.
const directTemplates = Object.fromEntries(Object.keys(TOPIC_ROUTES).map((topic) => [
  topic, { ...buildDirectReplyDraft({ topic }), brief: buildConsultBrief({ topic }) },
]));
await writeFile(resolve(dirname(target), 'direct_reply_templates.json'), JSON.stringify(directTemplates, null, 2) + '\n');
console.log(`[sync-inquiry-contract] ${source} → ${target}`);
