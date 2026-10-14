// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

// 개업 후 상태를 가정한다. 사전 렌더링된 폼이 스크립트 실행 전에 제출되면
// 브라우저가 기본 GET으로 보내 성함·연락처가 주소창·서버 기록에 남는다.
vi.mock('../data/office', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/office')>();
  return {
    ...actual,
    office: {
      isOpen: true,
      phone: '02-0000-0000',
      kakaoChannelUrl: 'https://pf.kakao.com/_test',
      address: '경기도 광명시 테스트로 1',
      registrationNumber: 'TEST-1',
      businessNumber: '000-00-00000',
      formEndpoint: 'https://jungmyungoffice.com/api/consult',
    },
  };
});

const { renderPage } = await import('../prerender/entry');

describe('사전 렌더링된 상담 폼', () => {
  it('개업 후에도 스크립트가 붙기 전에는 입력·제출할 수 없다', () => {
    const html = renderPage('/consult');
    const controls = html.match(/<(input|textarea|select)\b[^>]*\bname="[^"]+"[^>]*>|<button\b[^>]*type="submit"[^>]*>/g) ?? [];
    // company는 봇 차단용 숨김 칸(개인정보 아님)이고, 제출 버튼이 막히면 함께 제출되지 않는다.
    const userControls = controls.filter((control) => !control.includes('name="company"'));
    expect(userControls.length).toBeGreaterThanOrEqual(5);
    for (const control of userControls) expect(control).toContain('disabled=""');
  });
});
