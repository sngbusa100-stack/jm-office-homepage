import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../data/office', () => ({
  office: {
    isOpen: true,
    phone: '02-000-0000',
    kakaoChannelUrl: null,
    address: '테스트 주소',
    registrationNumber: '제0000-00호',
    businessNumber: '000-00-00000',
    formEndpoint: 'https://example.test/api/consult',
  },
  isAcceptingRequests: () => true,
}));

import { AdminPage } from '../pages/AdminPage';

const ITEMS = [
  {
    id: 'JM-20260717-AB12',
    receivedAt: '2026-07-17T03:00:00.000Z',
    name: '홍길동',
    phone: '010-1234-5678',
    topic: '음주운전 면허 구제',
    message: '문의드립니다.',
    status: 'new',
    memos: [],
  },
  {
    id: 'JM-20260701-ZZ99',
    receivedAt: '2026-07-01T01:00:00.000Z',
    topic: '인허가',
    status: 'done',
    purged: true,
    purgedAt: '2026-07-10T01:00:00.000Z',
    memoCount: 2,
  },
];

/** 로컬 행정심판 시스템에서 90일 무처리로 자동 종결되어 상태가 돌아온 접수. */
const LOCAL_CLOSED = {
  id: 'JM-20260716-CL01',
  receivedAt: '2026-07-16T03:00:00.000Z',
  name: '김종결',
  phone: '010-0000-0000',
  topic: '인허가',
  status: 'done',
  memos: [],
  pulledAt: '2026-07-16T03:30:00.000Z',
  localCaseId: 'INQ-0007',
  localStatus: 'closed',
  localCloseReason: 'auto_stale',
  localStatusAt: '2026-10-14T03:00:00.000Z',
};

/** 미처리 긴급 건(가장 오래된 접수). 서버가 목록 응답에 urgentReasons를 붙인다. */
const URGENT_OLD = {
  id: 'JM-20260601-UR01',
  receivedAt: '2026-06-01T03:00:00.000Z',
  name: '이급함',
  phone: '010-1111-2222',
  topic: '영업정지 · 행정심판',
  message: '',
  status: 'new',
  memos: [],
  deadlineReport: 'soon',
  diagnosis: { domain: 'suspension', answers: {}, counts: { urgent: 1 } },
  urgentReasons: ['diagnosis', 'selfReported'],
};

function stubAdminFetch(items: Record<string, unknown>[] = ITEMS) {
  const fetchMock = vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
    if (options.method === 'POST') {
      return { ok: true, status: 200, json: async () => ({ ok: true, sessionToken: 'test-token' }) };
    }
    if (options.method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          items,
          funnel: {
            days: 90,
            until: '2026-07-20',
            rows: [
              { date: '2026-07-20', event: 'landing_view', domain: 'dui', source: 'naver', count: 70 },
              { date: '2026-07-19', event: 'landing_view', domain: 'home', source: 'direct', count: 30 },
              { date: '2026-07-20', event: 'landing_cta_click', domain: 'dui', source: 'naver', count: 30 },
              { date: '2026-07-18', event: 'diagnosis_start', domain: 'dui', source: 'naver', count: 15 },
              { date: '2026-07-18', event: 'diagnosis_start', domain: 'suspension', source: 'direct', count: 5 },
              { date: '2026-07-18', event: 'diagnosis_complete', domain: 'dui', source: 'naver', count: 12 },
              { date: '2026-07-17', event: 'consult_view', domain: 'dui', source: 'naver', count: 8 },
              { date: '2026-07-17', event: 'consult_submit', domain: 'dui', source: 'naver', count: 3 },
              // 30일 밖, 90일 안
              { date: '2026-05-01', event: 'landing_view', domain: 'permit', source: 'google', count: 50 },
            ],
          },
        }),
      };
    }
    if (options.method === 'PATCH') {
      const body = JSON.parse(String(options.body));
      const base = items.find((item) => item.id === body.id) as (typeof ITEMS)[number];
      const item = {
        ...base,
        ...('followUpDate' in body ? { followUpDate: body.followUpDate } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.memo
          ? { memos: [...(base.memos ?? []), { at: '2026-07-17T04:00:00.000Z', text: body.memo }] }
          : {}),
      };
      return { ok: true, status: 200, json: async () => ({ ok: true, item }) };
    }
    return { ok: false, status: 405, json: async () => ({ ok: false }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AdminPage />
    </MemoryRouter>,
  );
}

async function login(fetchMock = stubAdminFetch()) {
  const user = userEvent.setup();
  renderPage();
  await user.type(screen.getByLabelText(/관리자 비밀번호/), 'test password!');
  await user.click(screen.getByRole('button', { name: '로그인' }));
  await screen.findByText(/접수 통계/);
  return { user, fetchMock };
}

describe('접수 관리 페이지', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('한국 자정에는 오늘과 연체 일정만 표시하고 완료·파기·미예약 접수는 제외한다', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-07-19T15:00:00Z'));
    const customers = [
      { name: '오늘고객', followUpDate: '2026-07-20' },
      { name: '연체고객', followUpDate: '2026-07-19' },
      { name: '내일고객', followUpDate: '2026-07-21' },
      { name: '완료고객', followUpDate: '2026-07-20', status: 'done' },
      { name: '파기고객', followUpDate: '2026-07-20', purged: true },
      { name: '미예약고객', followUpDate: null },
    ].map((fields, i) => ({ ...ITEMS[0], ...fields, id: `JM-20260717-AB0${i}` }));
    await login(stubAdminFetch(customers));
    const queue = screen.getByRole('heading', { name: /오늘 연락할 고객/ }).closest('section')!;
    for (const customer of customers.slice(0, 2)) {
      expect(queue.textContent).toMatch(new RegExp(customer.name + '|' + customer.id));
    }
    for (const customer of customers.slice(2)) {
      expect(queue.textContent).not.toMatch(new RegExp(customer.name + '|' + customer.id));
    }
  });

  it('상태 필터에 가려진 접수도 재연락 목록에서 누르면 해당 카드를 펼친다', async () => {
    const record = { ...ITEMS[0], followUpDate: '2020-01-01' };
    const { user } = await login(stubAdminFetch([record]));
    await user.click(screen.getByRole('button', { name: '완료 (0)' }));
    const queue = screen.getByRole('region', { name: '오늘 연락할 고객' });
    await user.click(within(queue).getByRole('button', { name: new RegExp(record.id) }));
    await waitFor(() => expect(document.getElementById(`inquiry-${record.id}`)).toHaveAttribute('open'));
  });

  it('일정 저장은 날짜를, 연락 완료는 null을 해당 접수에 PATCH한다', async () => {
    const { user, fetchMock } = await login(stubAdminFetch([ITEMS[0]]));
    const item = screen.getByText(/JM-20260717-AB12/).closest('details')!;
    await user.click(item.querySelector('summary')!);
    const date = within(item).getByLabelText(/다음 연락일/);
    fireEvent.change(date, { target: { value: '2026-07-20' } });
    const patches = () => fetchMock.mock.calls
      .filter(([, options]) => options.method === 'PATCH')
      .map(([, options]) => JSON.parse(String(options.body)));
    await user.click(within(item).getByRole('button', { name: '일정 저장' }));
    const saved = { id: ITEMS[0].id, followUpDate: '2026-07-20' };
    expect(patches()).toEqual([saved]);
    await user.click(screen.getByRole('button', { name: '연락 완료' }));
    expect(patches()).toEqual([saved, { id: ITEMS[0].id, followUpDate: null }]);
  });

  it('비밀번호 입력 전에는 목록을 요청하지 않는다', () => {
    const fetchMock = stubAdminFetch();
    renderPage();
    expect(screen.getByLabelText(/관리자 비밀번호/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('비밀번호 로그인 후 목록·통계를 Bearer 인증으로 불러온다', async () => {
    const { fetchMock } = await login();

    const [, loginOptions] = fetchMock.mock.calls[0];
    expect(loginOptions.method).toBe('POST');
    expect(JSON.parse(String(loginOptions.body))).toEqual({ password: 'test password!' });
    expect(sessionStorage.getItem('admin:token')).toBe('test-token');
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe('https://example.test/api/admin');
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer test-token');

    expect(screen.getByText(/JM-20260717-AB12/)).toBeInTheDocument();
    expect(screen.getByText(/개인정보 파기됨/)).toBeInTheDocument();
    expect(screen.getByText('전체 (2)')).toBeInTheDocument();
    expect(screen.getByText('신규 (1)')).toBeInTheDocument();
    expect(screen.getByText('완료 (1)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /30일 전환 퍼널/ })).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('상태 변경 버튼이 PATCH를 보내고 화면을 갱신한다', async () => {
    const { user, fetchMock } = await login();

    const item = screen.getByText(/JM-20260717-AB12/).closest('details')!;
    await user.click(within(item).getByRole('button', { name: /진행 중\(으\)로 변경/ }));

    const patchCall = fetchMock.mock.calls.find(([, options]) => options.method === 'PATCH')!;
    expect(JSON.parse(String(patchCall[1].body))).toEqual({
      id: 'JM-20260717-AB12',
      status: 'in_progress',
    });
    expect(await within(item).findByText(/진행 중$/)).toBeInTheDocument();
  });

  it('퍼널 칸을 누르면 분야·출처·날짜별 내역이 나오고, 기간을 바꾸면 합계가 바뀐다', async () => {
    const { user } = await login();
    const section = screen.getByRole('heading', { name: '30일 전환 퍼널' }).closest('section')!;

    expect(within(section).getByText(/진단 시작 → 진단 완료/).textContent).toContain('60%');
    expect(within(section).getByText(/진단 시작 → 진단 완료/).textContent).toContain('표본이 적어');

    await user.click(within(section).getByRole('button', { name: /진단 시작\s*20/ }));
    const detail = section.querySelector('#funnel-detail') as HTMLElement;
    expect(within(detail).getByText('음주운전 면허 구제: 15')).toBeInTheDocument();
    expect(within(detail).getByText('영업정지·행정심판: 5')).toBeInTheDocument();
    expect(within(detail).getByText('네이버: 15')).toBeInTheDocument();
    expect(within(detail).getByText('직접 방문·출처 모름: 5')).toBeInTheDocument();
    expect(within(detail).getByText('2026-07-18: 20')).toBeInTheDocument();

    const landing = within(section).getByRole('button', { name: /설명 조회/ });
    expect(landing.textContent).toContain('100');
    await user.click(within(section).getByRole('button', { name: '최근 90일' }));
    expect(screen.getByRole('heading', { name: '90일 전환 퍼널' })).toBeInTheDocument();
    expect(landing.textContent).toContain('150');
    await user.click(within(section).getByRole('button', { name: '최근 7일' }));
    expect(landing.textContent).toContain('100');
  });

  it('개인정보가 파기된 접수도 상태는 바꿀 수 있고, 메모·회신 칸은 없다', async () => {
    const { user, fetchMock } = await login();

    const item = screen.getByText(/JM-20260701-ZZ99/).closest('details')!;
    expect(within(item).queryByRole('button', { name: '회신문 생성' })).toBeNull();
    expect(within(item).queryByRole('button', { name: /수임/ })).toBeNull();
    await user.click(within(item).getByRole('button', { name: /보류\(으\)로 변경/ }));

    const patchCall = fetchMock.mock.calls.find(([, options]) => options.method === 'PATCH')!;
    expect(JSON.parse(String(patchCall[1].body))).toEqual({ id: 'JM-20260701-ZZ99', status: 'on_hold' });
    expect(await within(item).findByText(/보류$/)).toBeInTheDocument();
  });

  it('회신문 생성 시 이름·접수번호·확인 질문이 채워진다', async () => {
    const { user } = await login();

    const item = screen.getByText(/JM-20260717-AB12/).closest('details')!;
    await user.click(within(item).getByRole('button', { name: '회신문 생성' }));

    const draft = within(item).getByLabelText(/회신문 초안/) as HTMLTextAreaElement;
    expect(draft.value).toContain('홍길동 님');
    expect(draft.value).toContain('JM-20260717-AB12');
    expect(draft.value).toContain('혈중알코올농도');
    expect(draft.value).toContain('정명 행정사사무소 대표 행정사 정재훈입니다.');
    expect(draft.value).toContain('이메일 jungmyungoffice@naver.com');
  });

  it('비자 접수 답변은 다시 묻지 않고, 연락 언어가 한국어가 아니면 번역 검수 메모를 보여준다', async () => {
    const visa = {
      id: 'JM-20260718-VS01',
      receivedAt: '2026-07-18T03:00:00.000Z',
      name: 'Nguyen',
      phone: '010-2222-3333',
      topic: '출입국 · 비자',
      message: '연장 문의',
      status: 'new',
      memos: [],
      visaIntake: { requester: 'self', stayStatus: 'valid', expiryDate: '2026-12-31', currentStatus: 'study', goal: 'change', stage: 'not-applied', language: 'vi' },
    };
    const { user } = await login(stubAdminFetch([visa]));
    const item = screen.getByText(/JM-20260718-VS01/).closest('details')!;
    await user.click(within(item).getByRole('button', { name: '회신문 생성' }));

    const draft = within(item).getByLabelText(/회신문 초안/) as HTMLTextAreaElement;
    expect(draft.value).toContain('- 체류기간 만료일: 2026-12-31');
    expect(draft.value).not.toContain('Tiếng Việt');
    // 회신문 위 내부 메모와 상담 준비 메모 양쪽에 나온다.
    expect(within(item).getAllByText(/연락 언어: Tiếng Việt — 발송 전 번역·검수 필요/)).toHaveLength(2);
  });

  it('기존 기기의 저장된 인증값으로 비밀번호 재입력 없이 접속한다', async () => {
    localStorage.setItem('admin:token', 'saved-token');
    const fetchMock = stubAdminFetch();
    renderPage();
    await screen.findByText(/접수 통계/);
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
    expect((fetchMock.mock.calls[0][1].headers as Record<string, string>).Authorization).toBe('Bearer saved-token');
    // 로그인이 확인된 브라우저는 사무소 점검용으로 표시해 퍼널 집계에서 뺀다.
    expect(localStorage.getItem('funnel:internal')).toBe('1');
  });

  it('잘못된 비밀번호이면 오류를 보여주고 다시 입력을 받는다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ ok: false }) }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/관리자 비밀번호/), 'wrong');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('올바르지 않습니다');
    expect(screen.getByLabelText(/관리자 비밀번호/)).toBeInTheDocument();
    expect(sessionStorage.getItem('admin:token')).toBeNull();
  });
  it('로컬 처리 상태(종결 사유·시각)를 접수마다 보여 준다', async () => {
    await login(stubAdminFetch([...ITEMS, LOCAL_CLOSED]));
    const item = screen.getByText(/JM-20260716-CL01/).closest('details')!;
    expect(within(item).getByText(/행정심판 시스템: 종결 — 90일 무처리 자동 종결/)).toBeInTheDocument();
    expect(within(item).getByText(/INQ-0007/)).toBeInTheDocument();
  });

  it('기한 우선 건은 요약 줄에 배지를 달고, 미처리 긴급 건을 접수 순서와 상관없이 맨 위에 둔다', async () => {
    await login(stubAdminFetch([...ITEMS, LOCAL_CLOSED, URGENT_OLD]));
    const summaries = [...document.querySelectorAll('details.admin-item > summary')]
      .filter((el) => /JM-\d{8}-/.test(el.textContent ?? ''));
    expect(summaries[0]).toHaveTextContent('JM-20260601-UR01');
    const badge = within(summaries[0] as HTMLElement).getByText('⏰ 기한 우선');
    expect(badge).toHaveAttribute('title', '근거: 셀프 진단 · 고객 직접 선택');
    for (const other of summaries.slice(1)) expect(other).not.toHaveTextContent('기한 우선');
  });

  it('기한 우선 필터는 긴급 건만 보여 주고, 파기된 접수가 섞여도 오류가 없다', async () => {
    const { user } = await login(stubAdminFetch([...ITEMS, URGENT_OLD]));
    await user.click(screen.getByRole('button', { name: '기한 우선 (1)' }));
    expect(screen.getByText(/JM-20260601-UR01/)).toBeInTheDocument();
    expect(screen.queryByText(/JM-20260717-AB12/)).toBeNull();
    expect(screen.queryByText(/JM-20260701-ZZ99/)).toBeNull();
  });

  it('맨 위 긴급 건의 상태를 바꿔도 다시 불러오기 전까지 그 자리에 둔다', async () => {
    const { user } = await login(stubAdminFetch([...ITEMS, URGENT_OLD]));
    const ids = () => [...document.querySelectorAll('details.admin-item[id^="inquiry-"]')].map((el) => el.id);
    expect(ids()[0]).toBe('inquiry-JM-20260601-UR01');
    const item = document.getElementById('inquiry-JM-20260601-UR01')!;
    await user.click(within(item).getByRole('button', { name: '진행 중(으)로 변경' }));
    await waitFor(() => expect(item.querySelector('summary')).toHaveTextContent('진행 중'));
    expect(ids()[0]).toBe('inquiry-JM-20260601-UR01');
  });

  it('기한 우선 수와 필터는 신규·진행 중인 건만 세고, 완료·보류 건은 배지만 단다', async () => {
    const doneUrgent = { ...URGENT_OLD, id: 'JM-20260602-UR02', status: 'done' };
    const heldUrgent = { ...URGENT_OLD, id: 'JM-20260603-UR03', status: 'on_hold' };
    const workingUrgent = { ...URGENT_OLD, id: 'JM-20260604-UR04', status: 'in_progress' };
    const { user } = await login(stubAdminFetch([...ITEMS, URGENT_OLD, doneUrgent, heldUrgent, workingUrgent]));
    expect(within(document.getElementById('inquiry-JM-20260602-UR02')!).getByText('⏰ 기한 우선')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '기한 우선 (2)' }));
    expect(document.getElementById('inquiry-JM-20260601-UR01')).not.toBeNull();
    expect(document.getElementById('inquiry-JM-20260604-UR04')).not.toBeNull();
    expect(document.getElementById('inquiry-JM-20260602-UR02')).toBeNull();
    expect(document.getElementById('inquiry-JM-20260603-UR03')).toBeNull();
  });

  it('기한 자가 응답은 고객 자가 응답(증빙 미확인)으로 보여 준다', async () => {
    await login(stubAdminFetch([URGENT_OLD]));
    const item = screen.getByText(/JM-20260601-UR01/).closest('details')!;
    expect(within(item).getByText(/처분서·통지서 기한 — 고객 자가 응답\(증빙 미확인\)/)).toBeInTheDocument();
    expect(within(item).getByText('2주 안이거나 이미 지났습니다')).toBeInTheDocument();
  });

  it('접수마다 상담 준비 메모(물어볼 것·받아 둘 서류·법정 기한)를 펼쳐 보여 준다', async () => {
    await login();
    const item = screen.getByText(/JM-20260717-AB12/).closest('details')!;
    const brief = within(item).getByText(/상담 준비 메모/).closest('details')!;
    expect(brief).toHaveAttribute('open');
    expect(within(brief).getByRole('heading', { name: '통화·회신 때 물어볼 것' })).toBeInTheDocument();
    expect(within(brief).getByText('운전면허 취소·정지 결정통지서')).toBeInTheDocument();
    expect(within(brief).getByText(/^행정심판: 처분이 있음을 안 날부터 90일 이내/)).toBeInTheDocument();
    expect(within(brief).getByText(/로컬 사건 유형: 운전면허 행정심판/)).toBeInTheDocument();
    // 메모에는 고객 성함·연락처를 넣지 않는다(복사해 다른 곳에 붙여도 식별정보가 따라가지 않게).
    expect(within(brief).queryByText(/홍길동|010-1234-5678/)).toBeNull();
  });

  it('긴급 건 메모는 기한 근거와 고객이 진단에서 본 안내를 먼저 보여 준다', async () => {
    await login(stubAdminFetch([URGENT_OLD]));
    const item = screen.getByText(/JM-20260601-UR01/).closest('details')!;
    const brief = within(item).getByText(/상담 준비 메모/).closest('details')!;
    expect(within(brief).getByText(/⏰ 기한 우선 — 근거: 셀프 진단 · 고객 직접 선택/)).toBeInTheDocument();
    const asks = within(brief).getByRole('heading', { name: '통화·회신 때 물어볼 것' }).parentElement!;
    expect(within(asks).getAllByRole('listitem')[0].textContent).toMatch(/— 기한$/);
  });

  it('텔레그램 링크의 #접수번호로 들어오면 그 접수를 펼친다', async () => {
    window.location.hash = '#JM-20260717-AB12';
    await login();
    const item = document.getElementById('inquiry-JM-20260717-AB12')!;
    expect(item).toHaveAttribute('open');
    expect(document.getElementById('inquiry-JM-20260701-ZZ99')).not.toHaveAttribute('open');
  });

  it('전화·카카오톡·이메일 문의는 분야만 골라 메모와 첫 회신 초안을 만들고 서버로 보내지 않는다', async () => {
    const { user, fetchMock } = await login();
    const callsBefore = fetchMock.mock.calls.length;
    const section = screen.getByRole('heading', { name: '전화·카카오톡·이메일 문의 응대 메모' }).parentElement!;
    await user.selectOptions(within(section).getByLabelText('분야'), '인허가');
    await user.click(within(section).getByRole('button', { name: '메모·회신 초안 만들기' }));

    expect(within(section).getByText('사업계획서')).toBeInTheDocument();
    const draft = within(section).getByLabelText('첫 회신 초안') as HTMLTextAreaElement;
    expect(draft.value).toContain('안녕하세요. 정명 행정사사무소 대표 행정사 정재훈입니다.');
    expect(draft.value).toContain('문의 주셔서 감사합니다.');
    expect(draft.value).not.toContain('접수번호');
    expect(fetchMock.mock.calls.length).toBe(callsBefore);
  });

  it('로그인 유지는 고른 기기에만 남고, 로그아웃하면 지워진다', async () => {
    const user = userEvent.setup();
    stubAdminFetch();
    renderPage();
    await user.type(screen.getByLabelText(/관리자 비밀번호/), 'test password!');
    await user.click(screen.getByLabelText(/이 기기에서 로그인 유지/));
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await screen.findByText(/접수 통계/);
    expect(localStorage.getItem('admin:token')).toBe('test-token');

    await user.click(screen.getByRole('button', { name: /로그아웃/ }));
    expect(localStorage.getItem('admin:token')).toBeNull();
    expect(sessionStorage.getItem('admin:token')).toBeNull();
    expect(screen.getByLabelText(/관리자 비밀번호/)).toBeInTheDocument();
  });

  it('로그인 유지를 고르지 않으면 기기에 오래 남기지 않는다', async () => {
    await login();
    expect(localStorage.getItem('admin:token')).toBeNull();
  });
});
