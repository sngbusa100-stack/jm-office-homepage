import { describe, expect, it } from 'vitest';
import REPLY_LABELS from '../../api/_reply-labels.mjs';
import { buildReplyLabels } from '../lib/replyLabels';

describe('회신 초안 라벨 동기화', () => {
  it('진단 문항·비자 질문·사무소 정보와 정확히 일치한다(불일치 시 npx vite-node scripts/gen-reply-labels.ts)', () => {
    expect(REPLY_LABELS).toEqual(buildReplyLabels());
  });

  it('서명에는 휴대폰이 아니라 사무실 전화·이메일을 쓴다', () => {
    expect(REPLY_LABELS.office.phone).toMatch(/^0\d{1,2}-\d{3,4}-\d{4}$/);
    expect(REPLY_LABELS.office.phone.startsWith('010')).toBe(false);
    expect(REPLY_LABELS.office.email).toContain('@');
  });
});
