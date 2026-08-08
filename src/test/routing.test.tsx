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

describe('라우팅', () => {
  it('홈에서 업무 분야가 셀프 진단보다 먼저 나온다', () => {
    const { container } = renderAt('/');
    const headings = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent ?? '');
    const services = headings.findIndex((t) => t.includes('업무 분야'));
    const check = headings.findIndex((t) => t.includes('셀프 진단'));
    expect(services).toBeGreaterThanOrEqual(0);
    expect(check).toBeGreaterThanOrEqual(0);
    expect(services).toBeLessThan(check);
  });

  it('홈의 주 버튼은 업무 분야로 간다', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /업무 분야 살펴보기/ })).toHaveAttribute('href', '/services');
  });

  it('홈에는 진단 진입과 행정사 필요성 안내가 있다', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/셀프 진단/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/행정사가 필요한 이유/).length).toBeGreaterThan(0);
  });

  it('인허가 진단 경로가 열린다', () => {
    renderAt('/check/permit');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('인허가 신청 사전 점검');
  });

  it('없는 주소는 404와 복구 경로를 보여준다', () => {
    renderAt('/no-such-page');
    expect(screen.getByText(/페이지를 찾을 수 없습니다/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /홈으로/ })).toHaveAttribute('href', '/');
  });

  it('객체 프로토타입 이름을 진단 도메인으로 오인하지 않는다', () => {
    renderAt('/check/toString');
    expect(screen.getByText(/페이지를 찾을 수 없습니다/)).toBeInTheDocument();
  });
});
