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
}
console.log('[verify-office] 사무소 정보 검증 통과');
