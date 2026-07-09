import { existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('[verify-dist] dist/index.html이 없습니다.');
  process.exit(1);
}
const entries = readdirSync(dist);
if (entries.some((name) => name === 'legacy' || name === 'styles.css' || name === 'script.js')) {
  console.error('[verify-dist] 배포 산출물에 legacy 파일이 섞여 있습니다.');
  process.exit(1);
}
console.log('[verify-dist] 배포 산출물 검증 통과');
