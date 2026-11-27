import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { findPreOpenPhrases } from '../../scripts/pre-open-phrases.mjs';

// 개업 상태(isOpen=true, 필수값 모두 있음)를 가정한다(docs/2026-10-19-go-live-check-plan.md 2-2).
vi.mock('../data/office', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/office')>();
  return {
    ...actual,
    office: {
      ...actual.office,
      isOpen: true,
      kakaoChannelUrl: 'https://pf.kakao.com/_test',
      registrationNumber: 'TEST-1',
      businessNumber: '000-00-00000',
    },
  };
});

const { renderPage } = await import('../prerender/entry');
const { getIndexablePaths } = await import('../lib/pageMeta');
const { AppRouter } = await import('../app/AppRouter');
const { checks } = await import('../data/checks');

/** HTML에서 화면에 보이는 글만 남긴다(React 텍스트 경계 주석 포함 제거). */
function visibleText(html: string): string {
  return html
    .replace(/<!--.*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

describe('개업 뒤 화면 문구', () => {
  it.each(getIndexablePaths())('%s 에 개업 전 문구가 남지 않는다', (path) => {
    expect(findPreOpenPhrases(visibleText(renderPage(path)))).toEqual([]);
  });

  it('개업 전 안내 띠가 사라지고 등록번호가 보인다', () => {
    const text = visibleText(renderPage('/'));
    expect(text).not.toContain('사전 공개');
    expect(text).toContain('행정사 등록번호 TEST-1');
  });

  it('홈 FAQ는 상담 신청 방법을 안내한다', () => {
    const text = visibleText(renderPage('/'));
    expect(text).toContain('상담은 어떻게 신청하나요?');
    expect(text).toContain('온라인 상담 신청서 또는 카카오톡 채널로 문의해 주세요.');
  });

  it('개인정보처리방침은 사이트 상담 신청, 전화·이메일·카카오톡 채널·방문 상담, 위임 업무에 적용된다고 적는다', () => {
    expect(visibleText(renderPage('/privacy'))).toContain('이 방침은 온라인 신청과 카카오톡 채널을 통한 상담 접수, 접수 후 전화·이메일·방문 등으로 진행하는 상담, 위임받아 처리하는 행정사 업무에 적용됩니다.');
  });

  it('진단 결과의 긴급 안내에도 개업 전 문구가 없다', async () => {
    sessionStorage.clear();
    const answers = Object.fromEntries(checks.dui.questions.map((q) => [q.id, q.options[0].id]));
    answers['dui-elapsed'] = 'over90';
    sessionStorage.setItem('check:dui', JSON.stringify(answers));
    render(
      <MemoryRouter initialEntries={['/check/dui/result']}>
        <AppRouter />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/지금 바로 확인이 필요합니다/)).toBeInTheDocument();
    expect(findPreOpenPhrases(document.body.textContent ?? '')).toEqual([]);
    expect((document.body.textContent ?? '').replace(/\s+/g, ' ')).toContain('상담 회신을 기다리지 마시고 국민권익위원회 상담전화');
  });
});
