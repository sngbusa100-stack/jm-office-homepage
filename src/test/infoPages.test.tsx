import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { services } from '../data/services';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('정보 페이지', () => {
  it('/why는 업무 범위·비교표·오해 바로잡기를 보여준다', () => {
    renderAt('/why');
    expect(screen.getAllByText(/행정사법 제2조/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/변호사/).length).toBeGreaterThan(0);
    expect(screen.getByText(/흔한 오해/)).toBeInTheDocument();
  });

  it.each(services.map((s) => s.slug))('/services/%s 상세 페이지가 열린다', (slug) => {
    renderAt(`/services/${slug}`);
    const service = services.find((s) => s.slug === slug)!;
    expect(screen.getByRole('heading', { level: 1, name: service.headline })).toBeInTheDocument();
  });

  it('/services는 모든 업무 분야의 전체 목록을 보여준다', () => {
    renderAt('/services');
    expect(screen.getByRole('heading', { level: 1, name: /업무 분야/ })).toBeInTheDocument();
    for (const service of services) {
      expect(screen.getByRole('link', { name: new RegExp(service.name) })).toHaveAttribute(
        'href',
        `/services/${service.slug}`,
      );
    }
  });

  it('진단이 연결된 분야는 진단 버튼, 출입국은 준비중 안내를 보여준다', () => {
    renderAt('/services/dui');
    expect(screen.getByRole('link', { name: /내 상황 셀프 진단하기/ })).toHaveAttribute('href', '/check/dui');
    renderAt('/services/immigration');
    expect(screen.getByText(/비자 진단센터는 공개 준비 중/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /비자 진단센터/ })).not.toBeInTheDocument();
  });

  it('없는 분야 slug는 404를 보여준다', () => {
    renderAt('/services/nope');
    expect(screen.getByText(/페이지를 찾을 수 없습니다/)).toBeInTheDocument();
  });
});
