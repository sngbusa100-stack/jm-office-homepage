// 2026-11-14 개업 커밋 준비(목록표 D13·C19): 연락 버튼 누름 횟수, 영업시간 구조화 데이터, 상담 전송 실패 종류별 안내.
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { office } from '../data/office';
import { submitConsult } from '../lib/consultSubmit';
import { trackContactClick } from '../lib/funnel';
import { buildOfficeJsonLd, parseConsultHours } from '../lib/officeContact';
import { submitErrorMessage } from '../pages/ConsultPage';

function funnelBodies(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls
    .filter(([url]) => url === '/api/funnel')
    .map(([, init]) => JSON.parse((init as RequestInit).body as string));
}

describe('D13 전화·이메일 연결 버튼 누름 횟수', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('누른 종류만 보내고 번호·주소는 보내지 않는다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal('fetch', fetchMock);
    trackContactClick('phone');
    trackContactClick('email', 'visa');
    await Promise.resolve();
    const bodies = funnelBodies(fetchMock);
    expect(bodies).toEqual([
      { event: 'contact_phone_click', domain: 'home', attribution: { source: 'direct' } },
      { event: 'contact_email_click', domain: 'visa', attribution: { source: 'direct' } },
    ]);
    const raw = JSON.stringify(bodies);
    expect(raw).not.toContain(office.phone ?? '없음');
    expect(raw).not.toContain(office.email ?? '없음');
  });

  it('바닥글 전화·이메일 링크를 누르면 한 번씩 센다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><Footer /></MemoryRouter>);
    fireEvent.click(screen.getByRole('link', { name: office.phone! }));
    fireEvent.click(screen.getByRole('link', { name: office.email! }));
    await Promise.resolve();
    expect(funnelBodies(fetchMock).map((b) => b.event)).toEqual(['contact_phone_click', 'contact_email_click']);
  });

});

describe('C19 영업시간 구조화 데이터', () => {
  it('"월~금 10:00~17:00"을 OpeningHoursSpecification으로 바꾼다', () => {
    expect(parseConsultHours('월~금 10:00~17:00')).toEqual({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '17:00',
    });
  });

  it('다른 꼴이면 만들지 않는다(틀린 영업시간을 알리지 않게)', () => {
    expect(parseConsultHours('월~금 10:00~17:00(공휴일 휴무)')).toBeNull();
    expect(parseConsultHours('평일 10시~5시')).toBeNull();
    expect(parseConsultHours(null)).toBeNull();
  });

  it('개업 뒤(isOpen)에만 LegalService에 영업시간이 들어간다', () => {
    const open = buildOfficeJsonLd({ ...office, isOpen: true }, 'https://jungmyungoffice.com');
    expect(open?.openingHoursSpecification).toMatchObject({ opens: '10:00', closes: '17:00' });
    const before = buildOfficeJsonLd({ ...office, isOpen: false }, 'https://jungmyungoffice.com');
    expect(before).not.toHaveProperty('openingHoursSpecification');
  });
});

describe('C19 상담 전송 실패를 종류별로 안내(CV-12)', () => {
  beforeEach(() => vi.unstubAllGlobals());

  const respond = (status: number, body: unknown) => vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  const payload = { name: '시험', phone: '010-0000-0000', email: '', topic: 'other', message: '시험', consent: true, company: '' };

  it.each([
    [503, { ok: false, error: 'not_accepting' }, 'closed'],
    [503, { ok: false, error: 'inquiry_index_unavailable' }, 'outage'],
    [502, { ok: false, error: 'notify_failed' }, 'outage'],
    [500, { ok: false, error: 'server_config' }, 'outage'],
    [429, { ok: false, error: 'rate_limited' }, 'retry'],
    [409, { ok: false, error: 'submission_pending' }, 'retry'],
    [400, { ok: false, errors: ['name'] }, 'invalid'],
  ])('%i %j → %s', async (status, body, kind) => {
    vi.stubGlobal('fetch', respond(status, body));
    await expect(submitConsult('/api/consult', payload as never)).resolves.toEqual({ status: 'error', kind });
  });

  it('네트워크 오류는 일시 장애로 본다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(submitConsult('/api/consult', payload as never)).resolves.toEqual({ status: 'error', kind: 'outage' });
  });

  it('접수 닫힘만 "받지 않고 있습니다", 카카오는 채널이 있을 때만 말한다', () => {
    expect(submitErrorMessage('closed')).toContain('받지 않고 있습니다');
    expect(submitErrorMessage('closed')).toContain(office.phone!);
    expect(submitErrorMessage('retry')).toContain('다시 눌러');
    expect(submitErrorMessage('outage')).not.toContain('받지 않고');
    if (!office.kakaoChannelUrl) {
      for (const k of ['closed', 'retry', 'invalid', 'outage'] as const) expect(submitErrorMessage(k)).not.toContain('카카오');
    }
  });
});
