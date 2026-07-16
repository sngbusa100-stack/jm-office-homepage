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

function renderPage() {
  return render(
    <MemoryRouter>
      <ConsultPage />
    </MemoryRouter>,
  );
}

describe('상담 폼 제출 (개업 후 상태 모킹)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
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
  });
});
