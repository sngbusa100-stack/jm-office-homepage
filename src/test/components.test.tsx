import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { office } from '../data/office';

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
  // 2026-11-15 개업 전환: 개업 상태면 준비 띠가 없어야 한다.
  it('개업 상태에 맞는 안내 띠를 보여준다', () => {
    renderLayout();
    const count = screen.queryAllByText(/개업 준비 중/).length;
    if (office.isOpen) expect(count).toBe(0);
    else expect(count).toBeGreaterThan(0);
  });

  it('본문 건너뛰기 링크와 주요 메뉴를 제공한다', () => {
    renderLayout();
    expect(screen.getByText('본문으로 건너뛰기')).toHaveAttribute('href', '#main');
    expect(screen.getByRole('link', { name: '업무분야' })).toHaveAttribute('href', '/services');
    expect(screen.getByRole('link', { name: '행정사가 필요한 이유' })).toHaveAttribute('href', '/why');
  });

  it('상단 메뉴는 주인님이 정한 순서이고 상담 버튼은 메뉴 밖에 상시 노출한다', () => {
    renderLayout();
    const nav = screen.getByRole('navigation', { name: '주요 메뉴' });
    const links = Array.from(nav.querySelectorAll('a')).map((a) => [a.textContent, a.getAttribute('href')]);
    expect(links).toEqual([
      ['사무소 소개', '/about'],
      ['업무분야', '/services'],
      ['셀프 진단', '/check'],
      ['행정사가 필요한 이유', '/why'],
      ['오시는 길', '/location'],
    ]);
    const consult = screen.getByRole('link', { name: '상담 문의' });
    expect(consult).toHaveAttribute('href', '/consult');
    expect(nav.contains(consult)).toBe(false);
  });

  it('푸터에 가짜 연락처가 없고 면책 링크가 있다', () => {
    renderLayout();
    expect(screen.queryByText(/02-1234/)).toBeNull();
    expect(screen.getByRole('link', { name: '면책 고지' })).toBeInTheDocument();
  });

  it('첫 렌더에서는 맨 위로 스크롤하지 않고, 다른 경로로 이동하면 스크롤하고 main에 초점을 준다', () => {
    const scrollTo = vi.mocked(window.scrollTo);
    scrollTo.mockClear();
    render(
      <MemoryRouter>
        <Layout>
          <Link to="/other">이동</Link>
        </Layout>
      </MemoryRouter>,
    );
    expect(scrollTo).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(screen.getByRole('main'));
    fireEvent.click(screen.getByRole('link', { name: '이동' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    expect(screen.getByRole('main')).toHaveFocus();
  });
});
