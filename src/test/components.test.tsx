import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';

function renderLayout() {
  return render(
    <MemoryRouter>
      <Layout>
        <p>본문</p>
      </Layout>
    </MemoryRouter>,
  );
}

describe('공통 레이아웃', () => {
  it('개업 준비 중 안내를 표시한다', () => {
    renderLayout();
    expect(screen.getAllByText(/개업 준비 중/).length).toBeGreaterThan(0);
  });

  it('본문 건너뛰기 링크와 주요 메뉴를 제공한다', () => {
    renderLayout();
    expect(screen.getByText('본문으로 건너뛰기')).toHaveAttribute('href', '#main');
    expect(screen.getByRole('link', { name: '셀프 진단' })).toHaveAttribute('href', '/check');
    expect(screen.getByRole('link', { name: '상담 안내' })).toHaveAttribute('href', '/consult');
  });

  it('푸터에 가짜 연락처가 없고 면책 링크가 있다', () => {
    renderLayout();
    expect(screen.queryByText(/02-1234/)).toBeNull();
    expect(screen.getByRole('link', { name: '면책 고지' })).toBeInTheDocument();
  });
});
