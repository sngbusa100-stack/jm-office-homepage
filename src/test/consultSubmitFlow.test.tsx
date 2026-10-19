import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { StrictMode } from 'react';

// 개업 상태를 모킹해, 개업 후 폼 제출 경로가 실제로 동작하는지 검증한다.
vi.mock('../data/office', () => ({
  office: {
    isOpen: true,
    phone: '02-000-0000',
    kakaoChannelUrl: 'https://pf.kakao.com/_test',
    address: '테스트 주소',
    registrationNumber: '제0000-00호',
    businessNumber: '000-00-00000',
    formEndpoint: 'https://example.test/api/consult',
  },
  isAcceptingRequests: () => true,
}));

import { ConsultPage } from '../pages/ConsultPage';

function renderPage(initialEntry = '/consult') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ConsultPage />
    </MemoryRouter>,
  );
}

/** 출입국·비자 분야의 필수 질문에 국내 본인 기준으로 답한다(docs/2026-10-18-visa-intake-questions.md). */
async function answerVisaIntake(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('제 비자 문제입니다'));
  const stay = screen.queryByLabelText('한국에 있음 · 체류기간이 유효함');
  if (stay) await user.click(stay);
  await user.selectOptions(screen.getByLabelText(/지금 가지고 있는 체류자격/), 'work');
  await user.click(screen.getByLabelText('다른 체류자격으로 바꾸기(변경)'));
  await user.click(screen.getByLabelText('아직 신청 전'));
}

/** 진단 결과 화면이 세션에 남기는 음주운전 진단(답변 3개). */
const DUI_DIAGNOSIS = {
  domain: 'dui',
  answers: { 'dui-disposition': 'revoke', 'dui-bac': 'low', 'dui-elapsed': 'd60to90' },
  counts: { urgent: 1, official: 1, ready: 1 },
};

async function fillContact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/성함/), '홍길동');
  await user.type(screen.getByLabelText(/연락처/), '01012345678');
  await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
}

function consultBody(fetchMock: ReturnType<typeof vi.fn>) {
  const call = fetchMock.mock.calls.find(([url]) => url === 'https://example.test/api/consult');
  return JSON.parse((call?.[1] as RequestInit).body as string);
}

function renderStrictPage(initialEntry = '/consult') {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ConsultPage />
      </MemoryRouter>
    </StrictMode>,
  );
}

function NavigationProbe() {
  const navigate = useNavigate();
  return <button type="button" onClick={() => navigate('/consult')}>일반 상담으로 이동</button>;
}

function renderNavigablePage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/consult" element={<><NavigationProbe /><ConsultPage /></>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('상담 폼 제출 (개업 후 상태 모킹)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('?topic= 슬러그로 분야를 미리 선택한다 (외부 사이트 연동용)', () => {
    renderPage('/consult?topic=visa');
    const select = screen.getByLabelText('분야') as HTMLSelectElement;
    expect(select.value).toBe('출입국 · 비자');
  });

  it('알 수 없는 topic 슬러그는 무시하고 분야를 비워 둔다(음주운전이 기본값이 되지 않게)', () => {
    renderPage('/consult?topic=weird');
    const select = screen.getByLabelText('분야') as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(select).toBeRequired();
    expect(screen.getByRole('option', { name: '분야를 선택해 주세요' })).toBeDisabled();
  });

  it('분야를 고르지 않으면 접수를 보내지 않고 선택을 안내한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    fireEvent.submit(screen.getByRole('button', { name: /상담 신청하기/ }).closest('form')!);

    expect(await screen.findByRole('alert')).toHaveTextContent('상담 분야를 선택해 주세요');
    expect(fetchMock.mock.calls.some(([url]) => url === 'https://example.test/api/consult')).toBe(false);
  });

  it('입력값을 formEndpoint로 POST하고 성공 안내를 보여준다', async () => {
    sessionStorage.setItem('consult:attribution', JSON.stringify({
      source: 'naver',
      medium: 'blog',
      campaign: 'dui-summer',
      content: 'top-cta',
    }));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.selectOptions(screen.getByLabelText('분야'), '음주운전 면허 구제');
    await user.type(screen.getByLabelText(/상담 내용/), '문의합니다');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));

    expect(await screen.findByRole('status')).toHaveTextContent('접수되었습니다');
    const consultCall = fetchMock.mock.calls.find(([url]) => url === 'https://example.test/api/consult');
    expect(consultCall).toBeDefined();
    const [url, options] = consultCall!;
    expect(url).toBe('https://example.test/api/consult');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.name).toBe('홍길동');
    expect(body.phone).toBe('01012345678');
    expect(body.topic).toBe('음주운전 면허 구제');
    expect(body.consent).toBe(true);
    expect(body.company).toBe('');
    expect(body.attribution).toEqual({
      source: 'naver',
      medium: 'blog',
      campaign: 'dui-summer',
      content: 'top-cta',
    });
    expect(body.submissionId).toMatch(/^[A-Za-z0-9-]{8,64}$/);
    expect(sessionStorage.getItem('consult:submission')).toBeNull();
    expect(sessionStorage.getItem('consult:attribution')).toBeNull();
    expect(screen.getByRole('button', { name: /상담 신청하기/ })).toBeDisabled();
  });

  it('서버가 접수번호를 주면 성공 안내에 함께 보여준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, id: 'JM-20260717-AB12' }) }),
    );
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.selectOptions(screen.getByLabelText('분야'), '음주운전 면허 구제');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));

    expect(await screen.findByRole('status')).toHaveTextContent('JM-20260717-AB12');
  });

  it('전송 실패 시 대체 채널 안내를 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.selectOptions(screen.getByLabelText('분야'), '음주운전 면허 구제');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('전송에 실패');
    expect(sessionStorage.getItem('consult:submission')).toMatch(/^[A-Za-z0-9-]{8,64}$/);
  });

  it('저장된 셀프 진단이 없으면 함께 보내기 선택지를 보여 주지 않는다', () => {
    renderPage('/consult?topic=dui');
    expect(screen.queryByRole('checkbox', { name: /셀프 진단 답변 \d+개 함께 보내기/ })).toBeNull();
  });

  it('진단 분야와 상담 분야가 같으면 함께 보내기를 보여 주고, 보낼 답변을 펼쳐 볼 수 있다', async () => {
    sessionStorage.setItem('consult:diagnosis', JSON.stringify(DUI_DIAGNOSIS));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, id: 'JM-DIAG' }) });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage('/consult?topic=dui');

    const attach = screen.getByRole('checkbox', { name: /셀프 진단 답변 3개 함께 보내기\(선택\)/ });
    expect(attach).toBeChecked();
    expect(screen.getByText('보낼 답변 보기')).toBeInTheDocument();
    expect(screen.getByText(/어떤 처분을 받으셨나요\?/)).toBeInTheDocument();
    expect(screen.getByText(/면허 취소/)).toBeInTheDocument();

    await fillContact(user);
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    await screen.findByText(/JM-DIAG/);
    const body = consultBody(fetchMock);
    expect(body.diagnosis).toEqual(DUI_DIAGNOSIS);
    expect(body.sourcePath).toBe('/check/dui/result');
  });

  it('함께 보내기를 해제하면 진단 답변과 진단 경로를 보내지 않는다', async () => {
    sessionStorage.setItem('consult:diagnosis', JSON.stringify(DUI_DIAGNOSIS));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, id: 'JM-NODIAG' }) });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage('/consult?topic=dui');

    await user.click(screen.getByRole('checkbox', { name: /셀프 진단 답변 3개 함께 보내기/ }));
    await fillContact(user);
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    await screen.findByText(/JM-NODIAG/);
    const body = consultBody(fetchMock);
    expect(body).not.toHaveProperty('diagnosis');
    expect(body).not.toHaveProperty('sourcePath');
  });

  it('상담 분야가 진단 분야와 다르면 함께 보내기를 끄고 이유를 안내하며 보내지 않는다', async () => {
    sessionStorage.setItem('consult:diagnosis', JSON.stringify(DUI_DIAGNOSIS));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, id: 'JM-OTHER' }) });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage('/consult?topic=permit');

    const attach = screen.getByRole('checkbox', { name: /셀프 진단 답변 3개 함께 보내기/ });
    expect(attach).not.toBeChecked();
    expect(attach).toBeDisabled();
    expect(screen.getByText(/진단 분야\(음주운전 면허 구제\)와 상담 분야가 달라 함께 보내지 않습니다/)).toBeInTheDocument();

    await fillContact(user);
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    await screen.findByText(/JM-OTHER/);
    expect(consultBody(fetchMock)).not.toHaveProperty('diagnosis');
  });

  it('비자 세부 코드가 있으면 상담 조회 퍼널도 같은 세부 분야로 집계한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal('fetch', fetchMock);
    renderPage('/consult?topic=visa&visa=e7');
    await waitFor(() => {
      const funnelCall = fetchMock.mock.calls.find(([url]) => url === '/api/funnel');
      expect(funnelCall).toBeDefined();
      const payload = JSON.parse((funnelCall?.[1] as RequestInit).body as string);
      expect(payload.domain).toBe('e7');
    });
  });

  it('동의 후 발급된 비자 진단 토큰을 한 번 가져와 상담 접수에 포함한다', async () => {
    const visaDiagnosis = {
      schemaVersion: 1,
      visaSlug: 'e7',
      language: 'ko',
      answers: {
        stayStatus: 'valid',
        violationStatus: 'none',
        e7Occupation: 'confirmed',
        e7Contract: 'ready',
        e7Wage: 'meets',
      },
      level: 'checked',
      questionCount: 5,
      consent: true,
      consentedAt: '2026-07-25T00:00:00.000Z',
    };
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/visa-handoff') {
        return { ok: true, json: async () => ({ ok: true, visaDiagnosis }) };
      }
      return { ok: true, json: async () => ({ ok: true, id: 'JM-20260725-E7AA' }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    // 예전에 한 메인 셀프 진단이 세션에 남아 있어도 비자 진단 건에는 붙이지 않는다.
    sessionStorage.setItem('consult:diagnosis', JSON.stringify(DUI_DIAGNOSIS));
    const user = userEvent.setup();
    renderPage('/consult?topic=visa&visa=e7&handoff=abcdefghijklmnopqrstuvwx');

    expect(await screen.findByText(/진단 결과가 상담 화면에 안전하게 연결/)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /셀프 진단 답변 \d+개 함께 보내기/ })).toBeNull();
    expect((screen.getByLabelText(/상담 내용/) as HTMLTextAreaElement).value).toContain('E-7');
    expect(screen.getByLabelText('분야')).toBeDisabled();

    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    await answerVisaIntake(user);
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));

    expect(await screen.findByText(/JM-20260725-E7AA/)).toBeInTheDocument();
    const consultCall = fetchMock.mock.calls.find(([url]) => url === 'https://example.test/api/consult');
    const body = JSON.parse((consultCall?.[1] as RequestInit).body as string);
    expect(body.visaDiagnosis).toEqual(visaDiagnosis);
    expect(body).not.toHaveProperty('diagnosis');
    expect(body.sourcePath).toBe('/result?visa=e7');
    expect(sessionStorage.getItem('consult:visaDiagnosis')).toBeNull();
  });

  it('비자 진단을 불러오는 동안은 제출을 막고 로딩 완료 후 진단을 포함한다', async () => {
    let resolveHandoff!: (value: unknown) => void;
    const handoffResponse = new Promise((resolve) => { resolveHandoff = resolve; });
    const visaDiagnosis = {
      schemaVersion: 1,
      visaSlug: 'e7',
      language: 'ko',
      answers: {
        stayStatus: 'valid',
        violationStatus: 'none',
        e7Occupation: 'confirmed',
        e7Contract: 'ready',
        e7Wage: 'meets',
      },
      level: 'checked',
      questionCount: 5,
      consent: true,
    };
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/visa-handoff') return handoffResponse;
      if (url === '/api/funnel') return Promise.resolve({ ok: true, status: 202 });
      return Promise.resolve({ ok: true, json: async () => ({ ok: true, id: 'JM-E7-LOADED' }) });
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage('/consult?topic=visa&visa=e7&handoff=loading-token-20260725');

    const submit = screen.getByRole('button', { name: /진단 결과 불러오는 중/ });
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    expect(fetchMock.mock.calls.some(([url]) => url === 'https://example.test/api/consult')).toBe(false);

    resolveHandoff({ ok: true, status: 200, json: async () => ({ ok: true, visaDiagnosis }) });
    expect(await screen.findByText(/진단 결과가 상담 화면에 안전하게 연결/)).toBeInTheDocument();
    await answerVisaIntake(user);
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    await screen.findByText(/JM-E7-LOADED/);
    const consultCall = fetchMock.mock.calls.find(([url]) => url === 'https://example.test/api/consult');
    const body = JSON.parse((consultCall?.[1] as RequestInit).body as string);
    expect(body.visaDiagnosis.visaSlug).toBe('e7');
    expect(body.topic).toBe('출입국 · 비자');
  });

  it('같은 상담 화면에서 handoff 쿼리를 제거하면 이전 비자 진단을 첨부하지 않는다', async () => {
    const visaDiagnosis = {
      schemaVersion: 1,
      visaSlug: 'e7',
      language: 'ko',
      answers: {
        stayStatus: 'valid',
        violationStatus: 'none',
        e7Occupation: 'confirmed',
        e7Contract: 'ready',
        e7Wage: 'meets',
      },
      level: 'checked',
      questionCount: 5,
      consent: true,
    };
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/visa-handoff') {
        return { ok: true, status: 200, json: async () => ({ ok: true, visaDiagnosis }) };
      }
      if (url === '/api/funnel') return { ok: true, status: 202 };
      return { ok: true, json: async () => ({ ok: true, id: 'JM-GENERAL' }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderNavigablePage('/consult?topic=visa&visa=e7&handoff=route-change-token-20260725');

    expect(await screen.findByText(/진단 결과가 상담 화면에 안전하게 연결/)).toBeInTheDocument();
    expect(screen.getByLabelText('분야')).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '일반 상담으로 이동' }));
    await waitFor(() => expect(screen.getByLabelText('분야')).toBeEnabled());
    expect(screen.queryByText(/진단 결과가 상담 화면에 안전하게 연결/)).not.toBeInTheDocument();
    expect((screen.getByLabelText(/상담 내용/) as HTMLTextAreaElement).value).not.toContain('비자 사전진단 요약');

    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.selectOptions(screen.getByLabelText('분야'), '인허가');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    await screen.findByText(/JM-GENERAL/);
    const consultCall = fetchMock.mock.calls.find(([url]) => url === 'https://example.test/api/consult');
    const body = JSON.parse((consultCall?.[1] as RequestInit).body as string);
    expect(body).not.toHaveProperty('visaDiagnosis');
    expect(body.topic).toBe('인허가');
  });

  it('만료되거나 이미 사용한 비자 토큰은 안내하고 일반 상담은 막지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ ok: false, error: 'handoff_expired' }),
    }));
    renderPage('/consult?topic=visa&visa=e7&handoff=abcdefghijklmnopqrstuvwx');
    expect(await screen.findByRole('alert')).toHaveTextContent('만료되었거나 이미 사용');
    expect(screen.getByRole('button', { name: /상담 신청하기/ })).toBeEnabled();
  });

  it('React 개발 모드가 effect를 두 번 실행해도 일회 토큰은 한 번만 요청한다', async () => {
    const visaDiagnosis = {
      schemaVersion: 1,
      visaSlug: 'e7',
      language: 'ko',
      answers: {
        stayStatus: 'valid',
        violationStatus: 'none',
        e7Occupation: 'confirmed',
        e7Contract: 'ready',
        e7Wage: 'meets',
      },
      level: 'checked',
      questionCount: 5,
      consent: true,
    };
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/visa-handoff') {
        return { ok: true, status: 200, json: async () => ({ ok: true, visaDiagnosis }) };
      }
      return { ok: true, status: 202, json: async () => ({ ok: true }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    renderStrictPage('/consult?topic=visa&visa=e7&handoff=strictmode-token-20260725');
    expect(await screen.findByText(/진단 결과가 상담 화면에 안전하게 연결/)).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.filter(([url]) => url === '/api/visa-handoff'),
    ).toHaveLength(1);
  });

  it('새로고침에 해당하는 재마운트 뒤에도 미완료 제출 키를 유지한다', () => {
    const first = renderPage();
    const submissionId = sessionStorage.getItem('consult:submission');
    expect(submissionId).toMatch(/^[A-Za-z0-9-]{8,64}$/);
    first.unmount();
    renderPage();
    expect(sessionStorage.getItem('consult:submission')).toBe(submissionId);
  });
});
