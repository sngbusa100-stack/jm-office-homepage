import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

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

  it('알 수 없는 topic 슬러그는 무시하고 기본값을 유지한다', () => {
    renderPage('/consult?topic=weird');
    const select = screen.getByLabelText('분야') as HTMLSelectElement;
    expect(select.value).toBe('음주운전 면허 구제');
  });

  it('입력값을 formEndpoint로 POST하고 성공 안내를 보여준다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/성함/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '01012345678');
    await user.type(screen.getByLabelText(/상담 내용/), '문의합니다');
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));

    expect(await screen.findByRole('status')).toHaveTextContent('접수되었습니다');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.test/api/consult');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.name).toBe('홍길동');
    expect(body.phone).toBe('01012345678');
    expect(body.consent).toBe(true);
    expect(body.company).toBe('');
    expect(body.submissionId).toMatch(/^[A-Za-z0-9-]{8,64}$/);
    expect(sessionStorage.getItem('consult:submission')).toBeNull();
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
    await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('전송에 실패');
    expect(sessionStorage.getItem('consult:submission')).toMatch(/^[A-Za-z0-9-]{8,64}$/);
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
