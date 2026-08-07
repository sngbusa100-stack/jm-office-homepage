import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceFlowSteps } from '../components/ServiceFlowSteps';
import { SERVICE_FLOW_STEPS } from '../data/serviceFlow';
import { findService } from '../data/services';

function renderFor(slug: string) {
  const service = findService(slug)!;
  return render(
    <MemoryRouter>
      <ServiceFlowSteps service={service} />
    </MemoryRouter>,
  );
}

describe('업무분야 4단계 진행 표시', () => {
  it('비자 사이트와 같은 문구를 쓴다', () => {
    expect(SERVICE_FLOW_STEPS).toEqual(['설명', '요건·서류 조회', '내 상황 진단', '상담 준비']);
  });

  it('내부 진단이 있는 분야는 3단계가 진단 경로를 가리킨다', () => {
    renderFor('dui');
    expect(screen.getByRole('link', { name: /내 상황 진단/ })).toHaveAttribute('href', '/check/dui');
  });

  it('인허가 분야도 3단계가 진단 경로를 가리킨다', () => {
    renderFor('license');
    expect(screen.getByRole('link', { name: /내 상황 진단/ })).toHaveAttribute('href', '/check/permit');
  });

  it('비자 분야는 외부 이동임을 알린다', () => {
    renderFor('immigration');
    const link = screen.getByRole('link', { name: /내 상황 진단/ });
    expect(link.getAttribute('href')).toContain('jm-visa-precheck');
    expect(screen.getByText(/다국어 진단센터로 이동합니다/)).toBeInTheDocument();
  });

  it('진단이 없는 분야는 페이지 안의 확인 목록을 가리킨다', () => {
    renderFor('documents');
    expect(screen.getByRole('link', { name: /상담 전 확인 목록/ })).toHaveAttribute('href', '#preparation-review');
  });

  it('현재 단계를 접근성 속성으로 알린다', () => {
    renderFor('dui');
    expect(screen.getByText('설명').closest('li')).toHaveAttribute('aria-current', 'step');
  });
});
