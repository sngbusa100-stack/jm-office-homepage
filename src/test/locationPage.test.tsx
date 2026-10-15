import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { office } from '../data/office';
import { getPageMeta } from '../lib/pageMeta';
import { mapLinks } from '../lib/officeContact';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('오시는 길', () => {
  beforeEach(() => sessionStorage.clear());

  it('상단 주요 메뉴에서 오시는 길 페이지로 갈 수 있다', () => {
    renderAt('/');
    const nav = within(screen.getByRole('navigation', { name: '주요 메뉴' }));
    expect(nav.getByRole('link', { name: '오시는 길' })).toHaveAttribute('href', '/location');
  });

  it('주소·교통 안내·지도 바로가기·연락처를 보여준다', () => {
    renderAt('/location');
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('heading', { level: 1, name: '오시는 길' })).toBeInTheDocument();
    expect(main.getByText('경기도 광명시 새빛공원로 67 광명역자이타워 B1305호')).toBeInTheDocument();
    expect(main.getByText('광명KTX역 5번출구 앞')).toBeInTheDocument();
    const maps = mapLinks(office.mapQuery!);
    for (const [name, href] of [['네이버 지도', maps.naver], ['카카오맵', maps.kakao]]) {
      const link = main.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(main.getByRole('link', { name: '02-897-6251' })).toHaveAttribute('href', 'tel:02-897-6251');
    expect(main.getByText(/02-897-6254/)).toBeInTheDocument();
    expect(main.getByRole('link', { name: 'sngbusa10@naver.com' })).toHaveAttribute('href', 'mailto:sngbusa10@naver.com');
  });

  it('검색 노출용 고유 제목과 설명을 갖는다', () => {
    const meta = getPageMeta('/location');
    expect(meta.title).toBe('오시는 길 | 정명 행정사사무소');
    expect(meta.description).toContain('광명KTX역 5번출구 앞');
    expect(meta.canonical).toBe('https://jungmyungoffice.com/location');
    expect(meta.robots).toBe('index, follow');
  });
});
