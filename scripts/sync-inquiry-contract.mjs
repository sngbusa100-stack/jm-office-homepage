// 연동 계약 파일을 로컬 행정심판 시스템 테스트 고정값으로 복사한다.
// 로컬 tests/test_connector.py가 이 사본으로 저장 필드·상태 값·미처리 기준을 대조한다.
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../api/_inquiry-contract.json');
const target = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(here, '../../../행정사/1-행정심판/tests/fixtures/homepage_inquiry_contract.json');

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
console.log(`[sync-inquiry-contract] ${source} → ${target}`);
