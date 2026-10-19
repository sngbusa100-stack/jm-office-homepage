// 개업 전환 점검 — 읽기 전용. 파일·설정·운영 상태를 바꾸지 않는다.
//   npm run go-live:check                 개업 준비 상태(개업 전에는 '개업 전에 채울 것' 목록)
//   npm run go-live:check -- --strict     실패·건너뜀이 있으면 종료코드 1(개업 직후 최종 확인)
//   npm run go-live:check -- --offline    운영 사이트·Vercel·로컬 연동 확인 생략
// 운영 /api/consult에는 빈 요청을 한 번 보낸다. 검증 단계에서 거절되므로 접수 레코드는 생기지 않는다.
// 설계: docs/2026-10-19-go-live-check-plan.md
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONSENT_VERSION } from '../api/_store.mjs';
import { htmlToCheckedText } from './forbidden-phrases.mjs';
import {
  checkConsultApi,
  checkLiveSite,
  checkLocalConnector,
  checkOffice,
  checkPolicy,
  checkProtectedApis,
  checkVercelEnv,
  checkVisaSite,
  checkWording,
  manualItems,
  summarizeChecks,
} from './go-live-check-lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const offline = args.includes('--offline');
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const SITE = option('--site', 'https://jungmyungoffice.com');
const VISA_SITE = option('--visa-site', 'https://visa.jungmyungoffice.com');
const LOCAL_REPO = option('--local-repo', 'D:/행정사/1-행정심판');
// 요청마다 새 제한시간(15초)을 건다.
const timeout = () => ({ signal: AbortSignal.timeout(15000) });

const office = JSON.parse(readFileSync(join(root, 'src/data/office.json'), 'utf8'));
const policySource = readFileSync(join(root, 'src/data/privacyPolicy.ts'), 'utf8');
const effectiveDate = policySource.match(/PRIVACY_EFFECTIVE_DATE\s*=\s*'([^']+)'/)?.[1] ?? '(찾지 못함)';
const historyBlock = policySource.match(/PRIVACY_HISTORY\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
const historyDates = [...historyBlock.matchAll(/date:\s*'([^']+)'/g)].map((m) => m[1]);

function distPages() {
  const dist = join(root, 'dist');
  if (!existsSync(dist)) return null;
  const pages = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) {
        const path = `/${relative(dist, full).replace(/\\/g, '/')}`.replace(/index\.html$/, '');
        pages.push({ path, text: htmlToCheckedText(readFileSync(full, 'utf8')) });
      }
    }
  };
  walk(dist);
  return pages;
}

async function consultProbe() {
  const response = await fetch(`${SITE}/api/consult`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', ...timeout(),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function protectedStatuses() {
  const statuses = {};
  for (const path of ['/api/connector', '/api/cron-purge', '/api/admin']) {
    statuses[path] = (await fetch(`${SITE}${path}`, timeout())).status;
  }
  return statuses;
}

async function liveText() {
  return htmlToCheckedText(await (await fetch(`${SITE}/`, timeout())).text());
}

/** 비자 사이트는 화면을 스크립트로 그리므로 HTML과 JS 번들의 글을 함께 본다. */
async function visaText() {
  const html = await (await fetch(`${VISA_SITE}/`, timeout())).text();
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => new URL(m[1], VISA_SITE).href);
  const bundles = await Promise.all(scripts.map(async (src) => (await fetch(src, timeout())).text()));
  return [html, ...bundles].join('\n');
}

function vercelEnvNames() {
  const run = spawnSync('npx', ['--yes', 'vercel', 'env', 'ls', 'production'], {
    cwd: root, encoding: 'utf8', shell: process.platform === 'win32', timeout: 90000,
  });
  if (run.status !== 0) return null;
  const names = run.stdout.split('\n').map((line) => line.trim().split(/\s+/)[0]).filter((t) => /^[A-Z][A-Z0-9_]+$/.test(t));
  return names.length > 0 ? names : null;
}

function localEnvKeys() {
  const file = join(LOCAL_REPO, '.env');
  if (!existsSync(file)) return null;
  // 키 이름만 읽는다(값은 읽거나 출력하지 않는다).
  return readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=/)?.[1]).filter(Boolean);
}

function scheduledTask() {
  if (process.platform !== 'win32') return null;
  const run = spawnSync('powershell', [
    '-NoProfile', '-Command',
    'Get-ScheduledTask -TaskName JM_Homepage_Pull | Get-ScheduledTaskInfo | '
      + 'Select-Object @{n="lastResult";e={$_.LastTaskResult}},@{n="lastRunTime";e={$_.LastRunTime.ToUniversalTime().ToString("o")}} | ConvertTo-Json',
  ], { encoding: 'utf8', timeout: 30000 });
  if (run.status !== 0) return null;
  try {
    return JSON.parse(run.stdout);
  } catch {
    return null;
  }
}

async function safe(fn) {
  try {
    return await fn();
  } catch {
    return null;
  }
}

const results = [
  checkOffice(office),
  checkPolicy({ office, effectiveDate, consentVersion: CONSENT_VERSION, historyDates }),
  checkWording({ office, pages: distPages() }),
];
if (offline) {
  results.push(
    checkConsultApi({ office, probe: null }),
    checkProtectedApis(null),
    checkLiveSite({ office, text: null }),
    checkVisaSite({ office, text: null }),
    checkVercelEnv(null, office, { offline: true }),
  );
} else {
  results.push(
    checkConsultApi({ office, probe: await safe(consultProbe) }),
    checkProtectedApis(await safe(protectedStatuses)),
    checkLiveSite({ office, text: await safe(liveText) }),
    checkVisaSite({ office, text: await safe(visaText) }),
    checkVercelEnv(vercelEnvNames(), office),
  );
}
results.push(
  checkLocalConnector({ envKeys: offline ? null : localEnvKeys(), task: offline ? null : scheduledTask() }),
  ...manualItems(),
);

const ICON = { ok: '✅', fail: '❌', manual: '⚠️ ', skip: '⏭️ ' };
console.log(`\n[개업 전환 점검] ${office.isOpen ? `개업 상태(개업일 ${office.openedOn ?? '없음'})` : '개업 전'} · ${new Date().toISOString()}\n`);
for (const r of results) {
  console.log(`${ICON[r.status]} ${r.title}${r.detail ? `\n     ${r.detail}` : ''}`);
}
const summary = summarizeChecks(results, { strict });
console.log(`\n통과 ${summary.ok} · 실패 ${summary.fail} · 사람 확인 ${summary.manual} · 건너뜀 ${summary.skip}`);
if (!office.isOpen) console.log('개업 전에는 실패 항목이 "개업 전에 채울 것" 목록입니다. 순서는 docs/go-live-runbook.md를 따릅니다.');
process.exit(summary.exitCode);
