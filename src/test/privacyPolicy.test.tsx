import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
// @ts-expect-error — 서버 모듈(.mjs)은 타입 선언 없이 값만 비교한다.
import { CONSENT_VERSION } from '../../api/_store.mjs';
import { OVERSEAS_TRANSFERS, PRIVACY_EFFECTIVE_DATE, PRIVACY_HISTORY } from '../data/privacyPolicy';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

function koreanDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

// 개인정보 보호법 제30조①(법률 제21445호, 2026-09-11 시행)과 시행령 제31조①의 기재사항(보고서 2-1 2번).
describe('개인정보처리방침 법정 기재사항', () => {
  it('법정 기재사항마다 절이 있다', () => {
    renderAt('/privacy');
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '');
    for (const title of [
      '처리 목적', '처리하는 개인정보 항목', '보유 기간과 파기', '제3자 제공', '처리 위탁과 국외 이전',
      '정보주체의 권리와 행사 방법', '안전성 확보 조치', '자동 수집 장치(쿠키 등)', '개인정보 보호책임자',
      '권익침해 구제 방법', '시행일과 변경 이력',
    ]) {
      expect(headings.some((h) => h.includes(title)), `${title} 절 없음`).toBe(true);
    }
  });

  it('보호책임자로 대표 행정사 정재훈과 공개된 사무소 연락처를 적는다', () => {
    renderAt('/privacy');
    const section = within(screen.getByRole('region', { name: '개인정보 보호책임자' }));
    expect(section.getByText(/대표 행정사 정재훈/)).toBeInTheDocument();
    expect(section.getByRole('link', { name: 'sngbusa10@naver.com' })).toHaveAttribute('href', 'mailto:sngbusa10@naver.com');
    expect(section.getByRole('link', { name: '02-897-6251' })).toHaveAttribute('href', 'tel:02-897-6251');
  });

  it('국외 이전은 수탁자별로 이전받는 자·연락처·국가·항목·시기와 방법·목적·보유 기간을 표로 적는다', () => {
    renderAt('/privacy');
    const section = within(screen.getByRole('region', { name: '처리 위탁과 국외 이전' }));
    const table = within(section.getByRole('table'));
    for (const header of ['이전받는 자(연락처)', '국가', '이전 항목', '시기와 방법', '이용 목적', '보유·이용 기간']) {
      expect(table.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
    expect(table.getAllByRole('row')).toHaveLength(OVERSEAS_TRANSFERS.length + 1);
    for (const name of ['Vercel Inc.', 'Upstash, Inc.', 'Telegram Messenger Inc.']) {
      expect(table.getByText(new RegExp(name.replace('.', '\\.')))).toBeInTheDocument();
    }
    expect(section.getByText(/제28조의8제1항제3호/)).toBeInTheDocument();
    expect(section.getByText(/거부/)).toBeInTheDocument();
    // 예전 방침의 '사무소 연락처(개업 후 게시)'는 같은 페이지에 연락처가 이미 있어 틀린 문장이었다.
    expect(section.queryByText(/개업 후 게시/)).toBeNull();
  });

  it('Telegram으로는 평상시 접수번호만 가고, 저장 장애 때만 접수 내용이 간다고 적는다', () => {
    const telegram = OVERSEAS_TRANSFERS.find((row) => row.recipient.startsWith('Telegram'))!;
    expect(telegram.items).toContain('평상시 접수번호');
    expect(telegram.items).toContain('저장 장애');
  });

  it('파기 뒤 남는 항목에 진행 단계를 포함한다', () => {
    renderAt('/privacy');
    const section = within(screen.getByRole('region', { name: '보유 기간과 파기' }));
    expect(section.getByText(/접수번호, 접수일시, 상담 분야, 최종 상태, 진행 단계, 메모 개수/)).toBeInTheDocument();
  });

  it('처리되지 않은 문의는 접수 후 90일에 종결로 보고 그때부터 120일 뒤 파기한다고 적는다', () => {
    renderAt('/privacy');
    const section = within(screen.getByRole('region', { name: '보유 기간과 파기' }));
    expect(section.getByText(/처리되지 않은 상담 문의는 접수 후 90일이 지나면 종결로 보고, 그때부터 120일 뒤 파기합니다/)).toBeInTheDocument();
  });

  it('안전조치는 실제로 구현된 것만 적는다(HTTPS·관리자 인증·연동 토큰 분리·자동 파기·IP 해시)', () => {
    renderAt('/privacy');
    const text = screen.getByRole('region', { name: '안전성 확보 조치' }).textContent ?? '';
    for (const word of ['HTTPS', '관리자', '연동', '자동 파기', '해시']) expect(text).toContain(word);
  });

  it('상담 화면의 기한 질문 답을 수집 항목과 파기 대상에 적는다(동의 문구와 일치)', () => {
    renderAt('/privacy');
    const items = screen.getByRole('region', { name: '처리하는 개인정보 항목' }).textContent ?? '';
    expect(items).toContain('처분서·통지서 기한 질문의 답');
    const retention = screen.getByRole('region', { name: '보유 기간과 파기' }).textContent ?? '';
    expect(retention).toMatch(/파기 방법:[^\n]*기한 질문의 답/);
  });

  it('기한 질문 추가로 바뀐 방침은 이전 시행일(2026-10-19)을 변경 이력에 남긴다', () => {
    expect(PRIVACY_EFFECTIVE_DATE > '2026-10-19').toBe(true);
    expect(PRIVACY_HISTORY.map((entry) => entry.date)).toContain('2026-10-19');
  });

  it('시행일이 동의 문구 버전과 같고 화면에 표시된다', () => {
    expect(PRIVACY_EFFECTIVE_DATE).toBe(CONSENT_VERSION);
    renderAt('/privacy');
    expect(screen.getByText(new RegExp(`${koreanDate(PRIVACY_EFFECTIVE_DATE)}부터 시행`))).toBeInTheDocument();
  });

  it('상담 신청 동의 문구에 국외 이전과 거부 시 대안을 적는다', () => {
    renderAt('/consult');
    const consent = screen.getByLabelText(/개인정보 수집·이용에 동의/).closest('label')!;
    expect(consent.textContent).toContain('국외 이전');
    expect(consent.textContent).toContain('Vercel');
    expect(consent.textContent).toContain('전화');
  });
});
