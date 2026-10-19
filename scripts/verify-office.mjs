import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const office = JSON.parse(readFileSync(resolve(here, '../src/data/office.json'), 'utf8'));
const required = ['phone', 'kakaoChannelUrl', 'address', 'registrationNumber', 'businessNumber', 'formEndpoint'];

if (office.isOpen) {
  const missing = required.filter((key) => !office[key]);
  if (missing.length > 0) {
    console.error(`[verify-office] 개업 상태인데 정보 누락: ${missing.join(', ')}`);
    process.exit(1);
  }
  // 개업일은 개인정보처리방침 시행일 점검(npm run go-live:check)의 기준이다.
  const opened = office.openedOn ?? '';
  const realDate = /^\d{4}-\d{2}-\d{2}$/.test(opened)
    && new Date(`${opened}T00:00:00Z`).toISOString().slice(0, 10) === opened;
  if (!realDate) {
    console.error('[verify-office] 개업 상태인데 openedOn(개업일, YYYY-MM-DD)이 없음');
    process.exit(1);
  }
}
console.log('[verify-office] 사무소 정보 검증 통과');
