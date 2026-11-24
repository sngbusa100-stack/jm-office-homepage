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
    expect(section.getByRole('link', { name: 'jungmyungoffice@naver.com' })).toHaveAttribute('href', 'mailto:jungmyungoffice@naver.com');
    expect(section.getByRole('link', { name: '02-899-1849' })).toHaveAttribute('href', 'tel:02-899-1849');
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

  it('Telegram으로는 평상시 접수번호와 저장 장애 때의 확인번호를 안내한다', () => {
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

  // 위임 업무 문장(50번 F2 대조표 2·3·4·8번 줄) — 서류를 받기 전에 공개한다.
  it('위임 업무에서 받는 서류와 고유식별·민감정보 처리 조건을 적는다', () => {
    renderAt('/privacy');
    const purpose = screen.getByRole('region', { name: '처리 목적' }).textContent ?? '';
    expect(purpose).toContain('위임 업무 수행');
    expect(purpose).toContain('업무처리부');
    const items = screen.getByRole('region', { name: '처리하는 개인정보 항목' }).textContent ?? '';
    for (const word of ['업무를 맡기신 뒤', '자료 요청서', '여권·외국인등록증 사본', '따로 동의를 받은 뒤', '뒷자리를 가린 사본']) {
      expect(items, word).toContain(word);
    }
    // 상담 신청 단계에서는 여전히 받지 않는다.
    expect(items).toContain('상담 신청 단계에서 받지 않습니다');
  });

  it('위임 업무 자료의 보유 기간과 법정 보존 항목을 적고, 예고 문장은 남기지 않는다', () => {
    renderAt('/privacy');
    const retention = screen.getByRole('region', { name: '보유 기간과 파기' }).textContent ?? '';
    for (const word of [
      '업무를 맡기신 경우', '계약이 끝나는 날부터 최대 1년', '기관의 최종 결과', '고유식별번호는 가려서 보관',
      '행정사법 제24조', '국세기본법 제85조의3', '사건마다 따로 암호화한 저장 공간', '종이 서류는 파쇄',
    ]) {
      expect(retention, word).toContain(word);
    }
    expect(retention).not.toContain('다시 공개합니다');
    // 대행기관 등록 전이라 대행 접수대장은 적지 않는다(등록 뒤 제출 대행을 시작할 때 더한다).
    expect(retention).not.toContain('접수대장');
    expect(screen.getByRole('region', { name: '안전성 확보 조치' }).textContent ?? '').toContain('디스크 전체를 암호화');
  });

  it('상담 신청 동의 문구에 국외 이전과 거부 시 대안을 적는다', () => {
    renderAt('/consult');
    const consent = screen.getByLabelText(/개인정보 수집·이용에 동의/).closest('label')!;
    expect(consent.textContent).toContain('국외 이전');
    expect(consent.textContent).toContain('Vercel');
    expect(consent.textContent).toContain('전화');
  });
});
