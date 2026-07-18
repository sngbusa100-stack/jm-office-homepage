import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

describe('접근성', () => {
  it.each(['/', '/why', '/services', '/check', '/check/dui', '/consult', '/privacy', '/disclaimer'])(
    '%s: h1이 정확히 1개 있다',
    (path) => {
      render(<MemoryRouter initialEntries={[path]}><AppRouter /></MemoryRouter>);
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    },
  );

  it('진단 화면의 진행률에 ARIA 값이 있다', () => {
    render(<MemoryRouter initialEntries={['/check/dui']}><AppRouter /></MemoryRouter>);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
  });

  it('경로가 바뀌면 문서 제목이 바뀐다', () => {
    render(<MemoryRouter initialEntries={['/why']}><AppRouter /></MemoryRouter>);
    expect(document.title).toContain('행정사가 필요한 이유');
  });

  it('업무 상세 경로에는 분야별 문서 제목과 설명이 적용된다', () => {
    render(<MemoryRouter initialEntries={['/services/dui']}><AppRouter /></MemoryRouter>);
    expect(document.title).toContain('음주운전 면허 구제');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      expect.stringContaining('면허 정지·취소'),
    );
  });
});
