import { diagnosisForm } from '../../api/_diagnosis-routing.mjs';
import { checks } from '../data/checks';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { office } from '../data/office';
import { submitErrorMessage } from '../pages/ConsultPage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('상담 페이지 (개업 전)', () => {
  beforeEach(() => sessionStorage.clear());

  it('개업 전에는 채널 주소가 있어도 카드·동의·장애 안내에서 카카오 접수를 권하지 않는다', () => {
    const { isOpen, kakaoChannelUrl } = office;
    try {
      Object.assign(office, { isOpen: false, kakaoChannelUrl: 'https://pf.kakao.com/_test/chat' });
      renderAt('/consult');
      expect(screen.getByRole('button', { name: /상담 신청하기/ })).toBeDisabled();
      expect(screen.getByRole('region', { name: '상담 채널' }).querySelector('a')).toBeNull();
      expect(screen.getByLabelText(/개인정보 수집·이용에 동의/).closest('label')).not.toHaveTextContent('카카오');
      for (const kind of ['closed', 'storage', 'outage'] as const) {
        expect(submitErrorMessage(kind)).not.toContain('카카오');
      }
    } finally {
      Object.assign(office, { isOpen, kakaoChannelUrl });
    }
  });

  it.runIf(office.isOpen)('개업 상태에서는 접수 폼이 열려 있다', () => {
    renderAt('/consult');
    expect(screen.queryAllByText(/개업 후 시작됩니다/)).toHaveLength(0);
    expect(screen.getByRole('button', { name: /상담 신청하기/ })).toBeEnabled();
  });

  it('진단 요약이 있으면 상담 내용에 미리 채운다', () => {
    sessionStorage.setItem('consult:summary', JSON.stringify({
      domain: 'dui', title: '음주운전 면허 구제 사전 점검',
      counts: { urgent: 1, documents: 2, official: 0, ready: 3 },
    }));
    sessionStorage.setItem('consult:diagnosis', JSON.stringify({
      domain: 'dui', form: diagnosisForm(checks.dui), answers: { 'dui-disposition': 'revoke' }, counts: { ready: 1 },
    }));
    renderAt('/consult');
    const textarea = screen.getByLabelText(/상담 내용/) as HTMLTextAreaElement;
    expect(textarea.value).toContain('음주운전');
    expect(textarea.value).toContain('먼저 확인할 일정 1');
  });

  it('함께 남긴 진단이 문항을 고치기 전 판이면 요약도 채우지 않는다', () => {
    sessionStorage.setItem('consult:summary', JSON.stringify({
      domain: 'dui', title: '음주운전 면허 구제 사전 점검',
      counts: { urgent: 1, documents: 0, official: 0, ready: 0 },
    }));
    sessionStorage.setItem('consult:diagnosis', JSON.stringify({
      domain: 'dui', form: 'old', answers: { 'dui-disposition': 'revoke' }, counts: { ready: 1 },
    }));
    renderAt('/consult');
    const textarea = screen.getByLabelText(/상담 내용/) as HTMLTextAreaElement;
    expect(textarea.value).not.toContain('셀프 진단 요약');
    sessionStorage.clear();
  });

  it('긴급 대안 채널(110)을 안내한다', () => {
    renderAt('/consult');
    expect(screen.getAllByText(/110/).length).toBeGreaterThan(0);
  });

  it('외국인종합안내센터(1345)를 분야와 상관없이 안내한다', () => {
    renderAt('/consult');
    expect(screen.getByText(/외국인종합안내센터\(국번 없이 1345\)/)).toBeInTheDocument();
  });

  it('고지 페이지들이 열린다', () => {
    renderAt('/privacy');
    expect(screen.getByRole('heading', { level: 1, name: /개인정보/ })).toBeInTheDocument();
    renderAt('/disclaimer');
    expect(screen.getByRole('heading', { level: 1, name: /면책/ })).toBeInTheDocument();
  });
});
