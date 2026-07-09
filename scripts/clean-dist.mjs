import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(scriptsDirectory, '..');
const outputDirectory = resolve(workspace, 'dist');

if (dirname(outputDirectory) !== workspace) {
  throw new Error('빌드 출력 폴더가 작업 폴더 밖을 가리킵니다.');
}

if (process.platform === 'win32') {
  const cleaner = resolve(scriptsDirectory, 'clean-dist.ps1');
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', cleaner],
    { stdio: 'inherit' },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
} else {
  rmSync(outputDirectory, { recursive: true, force: true });
}
