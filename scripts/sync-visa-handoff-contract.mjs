import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../api/_visa-handoff-contract.json');
const target = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(here, '../../행정사 비자진단 홈페이지/src/data/visa-handoff-contract.json');

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
process.stdout.write(`비자 handoff 계약을 동기화했습니다: ${target}\n`);
