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
    expect(screen.getByRole('heading', { name: /먼저 확인할 항목/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /공식 기준·조회 경로/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /직접 준비와 검토가 필요한 부분/ })).toBeInTheDocument();
  });

  it('모든 업무분야는 조회 카드·공식 출처·직접 준비 구분을 갖는다', () => {
    for (const service of services) {
      expect(service.quickChecks.length).toBeGreaterThanOrEqual(3);
      expect(service.officialSources.length).toBeGreaterThan(0);
      expect(service.selfService.length).toBeGreaterThan(0);
      expect(service.professionalReview.length).toBeGreaterThan(0);
    }
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
    expect(screen.getAllByRole('link', { name: /내 상황 셀프 진단하기/ })[0]).toHaveAttribute('href', '/check/dui');
    expect(screen.getAllByRole('link', { name: /기한이 급하면 상담부터/ })[0]).toHaveAttribute(
      'href',
      '/consult?topic=dui&priority=urgent',
    );
    renderAt('/services/immigration');
    expect(screen.queryByText(/비자 진단센터는 공개 준비 중/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /정명 비자 진단센터 열기/ })[0]).toHaveAttribute(
      'href',
      'https://jm-visa-precheck.vercel.app/?utm_content=jm_main',
    );
    expect(screen.getByRole('link', { name: /E-7 전문인력/ })).toHaveAttribute(
      'href',
      'https://jm-visa-precheck.vercel.app/visa/e7?utm_content=jm_main',
    );
  });

  it('없는 분야 slug는 404를 보여준다', () => {
    renderAt('/services/nope');
    expect(screen.getByText(/페이지를 찾을 수 없습니다/)).toBeInTheDocument();
  });
});
