import { describe, expect, it } from 'vitest';
import {
  REQUIRED_VERCEL_ENV,
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
} from '../../scripts/go-live-check-lib.mjs';

const CLOSED_OFFICE = {
  isOpen: false, openedOn: null, phone: '02-897-6251', kakaoChannelUrl: null, address: '경기도 광명시',
  registrationNumber: null, businessNumber: null, formEndpoint: 'https://jungmyungoffice.com/api/consult',
};
const OPEN_OFFICE = {
  ...CLOSED_OFFICE, isOpen: true, openedOn: '2026-11-02', kakaoChannelUrl: 'https://pf.kakao.com/_x',
  registrationNumber: '제2026-1호', businessNumber: '000-00-00000',
};

describe('사무소 정보', () => {
  it('개업 전이면 개업 전에 채울 값을 알려 준다', () => {
    const result = checkOffice(CLOSED_OFFICE);
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('kakaoChannelUrl');
    expect(result.detail).toContain('registrationNumber');
    expect(result.detail).toContain('openedOn');
  });

  it('개업 상태이고 값이 모두 있으면 통과한다', () => {
    expect(checkOffice(OPEN_OFFICE).status).toBe('ok');
  });
});

describe('개인정보처리방침', () => {
  it('시행일과 동의 버전이 다르면 실패', () => {
    expect(checkPolicy({ office: CLOSED_OFFICE, effectiveDate: '2026-10-19', consentVersion: '2026-10-20' }).status).toBe('fail');
  });

  it('개업했는데 시행일이 개업일보다 앞서면 실패(개업 문구가 바뀌어 방침 변경이 됨)', () => {
    const result = checkPolicy({ office: OPEN_OFFICE, effectiveDate: '2026-10-19', consentVersion: '2026-10-19', historyDates: ['2026-10-19'] });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('2026-11-02');
    expect(checkPolicy({ office: OPEN_OFFICE, effectiveDate: '2026-11-02', consentVersion: '2026-11-02', historyDates: ['2026-11-02'] }).status).toBe('ok');
  });

  it('개업했는데 변경 이력에 시행일 항목이 없으면 실패', () => {
    const result = checkPolicy({ office: OPEN_OFFICE, effectiveDate: '2026-11-02', consentVersion: '2026-11-02', historyDates: ['2026-07-19'] });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('PRIVACY_HISTORY');
  });

  it('개업 전에는 두 값이 같으면 통과', () => {
    expect(checkPolicy({ office: CLOSED_OFFICE, effectiveDate: '2026-10-19', consentVersion: '2026-10-19' }).status).toBe('ok');
  });
});

describe('개업 전 문구', () => {
  const pages = [{ path: '/', text: '정명 행정사사무소 개업 준비 중' }, { path: '/why', text: '정상 문구' }];

  it('개업 뒤 사전 렌더링 결과에 개업 전 문구가 남으면 실패하고 위치를 알려 준다', () => {
    const result = checkWording({ office: OPEN_OFFICE, pages });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('/ (개업 준비)');
  });

  it('개업 전에는 개업 전 문구가 있어야 정상이다', () => {
    expect(checkWording({ office: CLOSED_OFFICE, pages }).status).toBe('ok');
  });

  it('빌드 결과가 없으면 건너뛴다', () => {
    expect(checkWording({ office: OPEN_OFFICE, pages: null }).status).toBe('skip');
  });
});

describe('운영 접수 API', () => {
  it('개업 전인데 접수가 열려 있으면 업무신고 전 접수 위험으로 실패', () => {
    const result = checkConsultApi({ office: CLOSED_OFFICE, probe: { status: 400, body: { ok: false, errors: ['name'] } } });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('업무신고');
  });

  it('개업 전이고 닫혀 있으면 통과', () => {
    expect(checkConsultApi({ office: CLOSED_OFFICE, probe: { status: 503, body: { ok: false, error: 'not_accepting' } } }).status).toBe('ok');
  });

  it('개업했는데 닫혀 있으면 CONSULT_OPEN을 켜라고 알린다', () => {
    const result = checkConsultApi({ office: OPEN_OFFICE, probe: { status: 503, body: { error: 'not_accepting' } } });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('CONSULT_OPEN=true');
  });

  it('개업했고 열려 있으면 통과, 응답을 알 수 없으면 실패', () => {
    expect(checkConsultApi({ office: OPEN_OFFICE, probe: { status: 400, body: { ok: false, errors: ['name'] } } }).status).toBe('ok');
    expect(checkConsultApi({ office: OPEN_OFFICE, probe: { status: 500, body: {} } }).status).toBe('fail');
    expect(checkConsultApi({ office: OPEN_OFFICE, probe: null }).status).toBe('skip');
  });
});

describe('운영 보호 API·비밀값', () => {
  it('인증 없이 401이 아니면 실패', () => {
    expect(checkProtectedApis({ '/api/connector': 401, '/api/cron-purge': 401 }).status).toBe('ok');
    const result = checkProtectedApis({ '/api/connector': 200, '/api/cron-purge': 401 });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('/api/connector 200');
  });

  it('필요한 Vercel 운영 비밀값 이름이 모두 있어야 한다', () => {
    expect(REQUIRED_VERCEL_ENV).toContain('CONSULT_OPEN');
    expect(checkVercelEnv(REQUIRED_VERCEL_ENV, OPEN_OFFICE).status).toBe('ok');
    const result = checkVercelEnv(REQUIRED_VERCEL_ENV.filter((n) => n !== 'CRON_SECRET'), CLOSED_OFFICE);
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('CRON_SECRET');
    expect(checkVercelEnv(null, CLOSED_OFFICE).status).toBe('skip');
    expect(checkVercelEnv(null, CLOSED_OFFICE, { offline: true }).detail).toBe('확인 생략(--offline)');
  });

  it('CONSULT_OPEN이 없으면 닫힘으로 동작하므로 개업 전에는 안내만, 개업 뒤에는 실패', () => {
    const withoutSwitch = REQUIRED_VERCEL_ENV.filter((n) => n !== 'CONSULT_OPEN');
    const closed = checkVercelEnv(withoutSwitch, CLOSED_OFFICE);
    expect(closed.status).toBe('ok');
    expect(closed.detail).toContain('개업일에 CONSULT_OPEN=true 추가');
    expect(checkVercelEnv(withoutSwitch, OPEN_OFFICE).status).toBe('fail');
  });
});

describe('운영 화면', () => {
  it('개업 뒤에는 등록번호가 보이고 개업 전 문구가 없어야 한다', () => {
    expect(checkLiveSite({ office: OPEN_OFFICE, text: '행정사 등록번호 제2026-1호' }).status).toBe('ok');
    expect(checkLiveSite({ office: OPEN_OFFICE, text: '개업 준비 중' }).status).toBe('fail');
    expect(checkLiveSite({ office: OPEN_OFFICE, text: '정상' }).detail).toContain('등록번호');
  });

  it('개업 전에는 운영 화면도 개업 전이어야 한다(배포 전 상태가 맞는지)', () => {
    expect(checkLiveSite({ office: CLOSED_OFFICE, text: '개업 준비 중' }).status).toBe('ok');
    expect(checkLiveSite({ office: CLOSED_OFFICE, text: '행정사 등록번호 제2026-1호' }).status).toBe('fail');
  });

  it('비자 사이트는 개업 뒤 개업 전 문구가 남으면 실패(문구 전환은 별도 과제)', () => {
    expect(checkVisaSite({ office: OPEN_OFFICE, text: '개업 준비 중 · 사전 공개 테스트' }).status).toBe('fail');
    expect(checkVisaSite({ office: CLOSED_OFFICE, text: '개업 준비 중' }).status).toBe('ok');
    expect(checkVisaSite({ office: OPEN_OFFICE, text: null }).status).toBe('skip');
  });
});

describe('로컬 연동', () => {
  const NOW = new Date('2026-10-20T00:00:00.000Z');

  it('연동 설정 키가 있고 작업 스케줄러가 1시간 안에 결과 0으로 돌았으면 통과', () => {
    expect(checkLocalConnector({
      envKeys: ['CONNECTOR_BASE_URL', 'CONNECTOR_TOKEN'],
      task: { lastResult: 0, lastRunTime: '2026-10-19T23:45:41.000Z' },
      now: NOW,
    }).status).toBe('ok');
  });

  it('키가 없거나 결과가 0이 아니거나 오래 안 돌았으면 실패', () => {
    expect(checkLocalConnector({ envKeys: ['CONNECTOR_TOKEN'], task: { lastResult: 0, lastRunTime: '2026-10-19T23:45:41.000Z' }, now: NOW }).detail).toContain('CONNECTOR_BASE_URL');
    expect(checkLocalConnector({ envKeys: ['CONNECTOR_BASE_URL', 'CONNECTOR_TOKEN'], task: { lastResult: 2, lastRunTime: '2026-10-19T23:45:41.000Z' }, now: NOW }).status).toBe('fail');
    expect(checkLocalConnector({ envKeys: ['CONNECTOR_BASE_URL', 'CONNECTOR_TOKEN'], task: { lastResult: 0, lastRunTime: '2026-10-19T20:00:00.000Z' }, now: NOW }).status).toBe('fail');
  });

  it('작업이 지금 실행 중(267009)이면 실패로 보지 않는다', () => {
    expect(checkLocalConnector({
      envKeys: ['CONNECTOR_BASE_URL', 'CONNECTOR_TOKEN'],
      task: { lastResult: 267009, lastRunTime: '2026-10-19T23:45:41.000Z' },
      now: NOW,
    }).status).toBe('ok');
  });

  it('값을 읽을 수 없으면 건너뛴다', () => {
    expect(checkLocalConnector({ envKeys: null, task: null, now: NOW }).status).toBe('skip');
  });
});

describe('사람이 할 일과 요약', () => {
  it('업무신고 수리·행정사회 가입·카카오 채널·재수집 등 사람이 할 일을 목록으로 준다', () => {
    const items = manualItems().map((i) => i.title).join(' ');
    for (const word of ['업무신고', '행정사회', '사업자등록', '카카오 채널', '재수집', '시험 접수']) {
      expect(items).toContain(word);
    }
    expect(manualItems().every((i) => i.status === 'manual')).toBe(true);
  });

  it('실패 수를 세고, strict 모드에서는 실패가 있으면 종료코드 1', () => {
    const results = [
      { status: 'ok' }, { status: 'fail' }, { status: 'manual' }, { status: 'skip' },
    ];
    expect(summarizeChecks(results)).toMatchObject({ ok: 1, fail: 1, manual: 1, skip: 1, exitCode: 0 });
    expect(summarizeChecks(results, { strict: true }).exitCode).toBe(1);
    expect(summarizeChecks([{ status: 'ok' }], { strict: true }).exitCode).toBe(0);
    // strict에서는 확인하지 못한 항목(건너뜀)도 통과로 보지 않는다.
    expect(summarizeChecks([{ status: 'ok' }, { status: 'skip' }], { strict: true }).exitCode).toBe(1);
  });
});
