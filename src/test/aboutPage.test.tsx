import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { getPageMeta } from '../lib/pageMeta';
import { profile } from '../data/profile';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('사무소 소개(/about)', () => {
  it('상단 메뉴 첫 항목에서 사무소 소개로 간다', () => {
    renderAt('/');
    const nav = within(screen.getByRole('navigation', { name: '주요 메뉴' }));
    expect(nav.getAllByRole('link')[0]).toHaveTextContent('사무소 소개');
    expect(nav.getByRole('link', { name: '사무소 소개' })).toHaveAttribute('href', '/about');
  });

  it('대표 사진 카드, 인사말 전문, 서명, 약력을 보여준다', () => {
    renderAt('/about');
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('heading', { level: 1, name: '사무소 소개' })).toBeInTheDocument();
    expect(main.getByRole('img', { name: '대표 행정사 정재훈' })).toBeInTheDocument();

    const letter = within(screen.getByRole('region', { name: profile.greetingTitle }));
    expect(letter.getByText('안녕하세요. 정명 행정사사무소 대표 행정사 정재훈입니다.')).toBeInTheDocument();
    for (const paragraph of profile.greeting) expect(letter.getByText(paragraph)).toBeInTheDocument();

    const bio = within(letter.getByLabelText('약력'));
    expect(bio.getByText('중앙대학교 행정대학원 석사과정')).toBeInTheDocument();
    expect(bio.getByText('DHL 법률사무소 고문')).toBeInTheDocument();
    expect(bio.getByText('DHL 법률사무소 (변호사 이동호)')).toBeInTheDocument();
  });

  it('약속 3가지와 찾아오시는 길(상담 시간·주차·전화)을 보여준다', () => {
    renderAt('/about');
    const promises = within(screen.getByRole('region', { name: '세 가지 약속' }));
    expect(promises.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['정확하게', '명쾌하게', '변호사와 한 공간에서']);

    const visit = within(screen.getByRole('region', { name: '찾아오시는 길' }));
    expect(visit.getByText('경기도 광명시 새빛공원로 67 광명역자이타워 B동 13층 1305호')).toBeInTheDocument();
    expect(visit.getByText('월~금 10:00~17:00')).toBeInTheDocument();
    expect(visit.getByText('1시간 30분 무료')).toBeInTheDocument();
    expect(visit.getByRole('link', { name: '02-897-6251' })).toHaveAttribute('href', 'tel:02-897-6251');
    expect(visit.getByRole('link', { name: /오시는 길 자세히 보기/ })).toHaveAttribute('href', '/location');
  });

  it('검색 노출용 고유 제목과 설명을 갖는다', () => {
    const meta = getPageMeta('/about');
    expect(meta.title).toBe('사무소 소개 | 정명 행정사사무소');
    expect(meta.description).toContain('광명KTX역 5번출구 앞');
    expect(meta.canonical).toBe('https://jungmyungoffice.com/about');
    expect(meta.robots).toBe('index, follow');
  });
});
