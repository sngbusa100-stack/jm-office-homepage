import { render, screen, within } from '@testing-library/react';
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

function stubAdminFetch() {
  const fetchMock = vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
    if (options.method === 'GET') {
      return { ok: true, status: 200, json: async () => ({ ok: true, items: ITEMS }) };
    }
    if (options.method === 'PATCH') {
      const body = JSON.parse(String(options.body));
      const base = ITEMS.find((item) => item.id === body.id)!;
      const item = {
        ...base,
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
  await user.type(screen.getByLabelText(/관리자 토큰/), 'test-token');
  await user.click(screen.getByRole('button', { name: '접속' }));
  await screen.findByText(/접수 통계/);
  return { user, fetchMock };
}

describe('접수 관리 페이지', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('토큰 입력 전에는 목록을 요청하지 않는다', () => {
    const fetchMock = stubAdminFetch();
    renderPage();
    expect(screen.getByLabelText(/관리자 토큰/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('토큰 접속 후 목록·통계를 Bearer 인증으로 불러온다', async () => {
    const { fetchMock } = await login();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.test/api/admin');
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer test-token');

    expect(screen.getByText(/JM-20260717-AB12/)).toBeInTheDocument();
    expect(screen.getByText(/개인정보 파기됨/)).toBeInTheDocument();
    expect(screen.getByText('전체 (2)')).toBeInTheDocument();
    expect(screen.getByText('신규 (1)')).toBeInTheDocument();
    expect(screen.getByText('완료 (1)')).toBeInTheDocument();
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

  it('회신문 생성 시 이름·접수번호·확인 질문이 채워진다', async () => {
    const { user } = await login();

    const item = screen.getByText(/JM-20260717-AB12/).closest('details')!;
    await user.click(within(item).getByRole('button', { name: '회신문 생성' }));

    const draft = within(item).getByLabelText(/회신문 초안/) as HTMLTextAreaElement;
    expect(draft.value).toContain('홍길동 님');
    expect(draft.value).toContain('JM-20260717-AB12');
    expect(draft.value).toContain('혈중알코올농도');
  });

  it('잘못된 토큰이면 오류를 보여주고 다시 입력을 받는다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ ok: false }) }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/관리자 토큰/), 'wrong');
    await user.click(screen.getByRole('button', { name: '접속' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('올바르지 않습니다');
    expect(screen.getByLabelText(/관리자 토큰/)).toBeInTheDocument();
    expect(sessionStorage.getItem('admin:token')).toBeNull();
  });
});
