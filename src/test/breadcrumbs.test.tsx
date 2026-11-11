import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { findService } from '../data/services';
import { findCheck } from '../data/checks';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

function jsonLdBlocks(container: HTMLElement) {
  return [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent ?? '{}'));
}

describe('빵부스러기', () => {
  beforeEach(() => sessionStorage.clear());

  it('업무 상세에 홈 › 업무 분야 › 업무명을 보이고 BreadcrumbList를 낸다', () => {
    const service = findService('dui')!;
    const { container } = renderAt('/services/dui');
    const nav = within(screen.getByRole('navigation', { name: '현재 위치' }));
    expect(nav.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/');
    expect(nav.getByRole('link', { name: '업무 분야' })).toHaveAttribute('href', '/services');
    expect(nav.getByText(service.name)).toHaveAttribute('aria-current', 'page');
    const list = jsonLdBlocks(container).find((d) => d['@type'] === 'BreadcrumbList');
    expect(list.itemListElement.map((i: { name: string }) => i.name)).toEqual(['홈', '업무 분야', service.name]);
    expect(list.itemListElement[1].item).toBe('https://jungmyungoffice.com/services');
  });

  it('진단 화면에 홈 › 셀프 진단 › 진단 제목을 보이고, 결과 화면에는 넣지 않는다', () => {
    const definition = findCheck('dui')!;
    const { container } = renderAt('/check/dui');
    const nav = within(screen.getByRole('navigation', { name: '현재 위치' }));
    expect(nav.getByRole('link', { name: '셀프 진단' })).toHaveAttribute('href', '/check');
    expect(nav.getByText(definition.title)).toHaveAttribute('aria-current', 'page');
    const list = jsonLdBlocks(container).find((d) => d['@type'] === 'BreadcrumbList');
    expect(list.itemListElement).toHaveLength(3);
  });

  it('진단 결과 화면에는 빵부스러기가 없다', () => {
    renderAt('/check/dui/result');
    expect(screen.queryByRole('navigation', { name: '현재 위치' })).toBeNull();
  });
});
