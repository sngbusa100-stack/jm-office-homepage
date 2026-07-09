import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('상담 페이지 (개업 전)', () => {
  beforeEach(() => sessionStorage.clear());

  it('개업 전에는 접수 불가 안내와 비활성 폼을 보여준다', () => {
    renderAt('/consult');
    expect(screen.getAllByText(/개업 후 시작됩니다/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /상담 신청하기/ })).toBeDisabled();
    expect(screen.queryByText(/02-1234/)).toBeNull();
  });

  it('진단 요약이 있으면 상담 내용에 미리 채운다', () => {
    sessionStorage.setItem('consult:summary', JSON.stringify({
      domain: 'dui', title: '음주운전 면허 구제 사전 점검',
      counts: { urgent: 1, documents: 2, official: 0, ready: 3 },
    }));
    renderAt('/consult');
    const textarea = screen.getByLabelText(/상담 내용/) as HTMLTextAreaElement;
    expect(textarea.value).toContain('음주운전');
    expect(textarea.value).toContain('긴급 확인 1');
  });

  it('긴급 대안 채널(110)을 안내한다', () => {
    renderAt('/consult');
    expect(screen.getAllByText(/110/).length).toBeGreaterThan(0);
  });

  it('고지 페이지들이 열린다', () => {
    renderAt('/privacy');
    expect(screen.getByRole('heading', { level: 1, name: /개인정보/ })).toBeInTheDocument();
    renderAt('/disclaimer');
    expect(screen.getByRole('heading', { level: 1, name: /면책/ })).toBeInTheDocument();
  });
});
