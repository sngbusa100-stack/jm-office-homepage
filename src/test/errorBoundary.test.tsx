import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('비밀 오류 내용');
  return <p>정상 화면</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('자식이 오류를 던지면 대체 화면을 보이고 오류 내용은 드러내지 않는다', () => {
    render(<ErrorBoundary resetKey="/a"><Bomb explode /></ErrorBoundary>);
    expect(screen.getByRole('heading', { level: 1, name: '화면을 불러오지 못했습니다' })).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새로 고침' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '홈으로' })).toHaveAttribute('href', '/');
    expect(screen.queryByText(/비밀 오류 내용/)).toBeNull();
  });

  it('resetKey가 바뀌면 오류 상태를 풀고 정상 자식을 다시 그린다', () => {
    const { rerender } = render(<ErrorBoundary resetKey="/a"><Bomb explode /></ErrorBoundary>);
    expect(screen.getByRole('heading', { name: '화면을 불러오지 못했습니다' })).toBeInTheDocument();
    rerender(<ErrorBoundary resetKey="/b"><Bomb explode={false} /></ErrorBoundary>);
    expect(screen.getByText('정상 화면')).toBeInTheDocument();
  });
});
