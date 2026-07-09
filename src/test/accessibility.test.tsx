import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

describe('접근성', () => {
  it.each(['/', '/why', '/check', '/check/dui', '/consult', '/privacy', '/disclaimer'])(
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
});
