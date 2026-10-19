// api/_inquiry-contract.json을 현재 코드 기준으로 다시 만든다(계약 테스트를 쓰기 모드로 실행).
// 다시 만든 뒤에는 npm run sync:inquiry-contract로 로컬 행정심판 시스템에 복사한다.
import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'npx',
  ['vitest', 'run', '--exclude', '.claude/**', 'src/test/inquiryContract.test.ts'],
  { stdio: 'inherit', shell: true, env: { ...process.env, UPDATE_INQUIRY_CONTRACT: '1' } },
);
process.exit(result.status ?? 1);
