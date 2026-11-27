import { describe, expect, it } from 'vitest';
import { buildConsultBrief, classifyDiagnosis, consultBriefText } from './_consult-brief.mjs';
import { TOPICS } from './_validate.mjs';
import LABELS from './_reply-labels.mjs';

const titles = (sections) => sections.map((s) => s.title);
const section = (sections, title) => sections.find((s) => s.title === title);

describe('상담 준비 메모', () => {
  it.each(TOPICS)('모든 상담 분야(%s)에 물어볼 것·받아 둘 서류·진행 순서가 있다', (topic) => {
    const brief = buildConsultBrief({ topic });
    expect(titles(brief)).toEqual(expect.arrayContaining(['한눈에', '통화·회신 때 물어볼 것', '받아 둘 서류', '진행 순서']));
  });

  it('파기된 접수·빈 값은 메모를 만들지 않는다', () => {
    expect(buildConsultBrief(null)).toBeNull();
    expect(buildConsultBrief({ topic: TOPICS[0], purged: true })).toBeNull();
  });

  it('모르는 분야는 직접 분류하라고 알린다', () => {
    const brief = buildConsultBrief({ topic: '기타' });
    expect(section(brief, '한눈에').lines.join('\n')).toContain('연동 계약에 없는 분야');
  });

  it('진단 답은 고객이 결과 화면에서 본 등급·안내·근거로, 급한 것부터 보여 준다', () => {
    const record = {
      topic: '음주운전 면허 구제',
      diagnosis: { domain: 'dui', answers: { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' }, counts: { urgent: 1 } },
    };
    const brief = buildConsultBrief(record);
    const shown = section(brief, '고객이 셀프 진단에서 본 안내(급한 것부터)').lines;
    expect(shown[0]).toMatch(/^\[먼저 확인할 일정\] .*61~90일 됐어요: .*\(행정심판법 제27조\)$/);
    expect(shown[1]).toMatch(/^\[상담 때 참고할 내용\] /);
    expect(section(brief, '한눈에').lines).toContain('⏰ 기한 우선 — 근거: 셀프 진단');
    // 이미 답한 처분 종류는 다시 묻지 않고, 기한 질문이 맨 앞이다.
    const asks = section(brief, '통화·회신 때 물어볼 것').lines;
    expect(asks[0]).toMatch(/— 기한$/);
    expect(asks.join('\n')).not.toContain('면허 정지인지 취소인지');
  });

  it('진단이 없으면 비자 접수 답처럼 이미 받은 답을 되짚는다', () => {
    const brief = buildConsultBrief({
      topic: '출입국 · 비자',
      visaIntake: { stayStatus: 'valid', expiryDate: '2027-01-31', language: 'vi' },
    });
    expect(section(brief, '고객이 이미 알려 준 것(증빙 전)').lines).toContain('체류기간 만료일: 2027-01-31');
    expect(section(brief, '내부 메모').lines[0]).toMatch(/^연락 언어: .* — 발송 전 번역·검수 필요$/);
  });

  it('고객 성함·연락처·상담 내용은 메모에 넣지 않는다', () => {
    const text = consultBriefText(buildConsultBrief({
      id: 'JM-20261122-ABCD', name: '홍길동', phone: '010-1234-5678', email: 'a@b.c',
      topic: '인허가', message: '공장 등록 문의',
    }));
    for (const secret of ['홍길동', '010-1234-5678', 'a@b.c', '공장 등록 문의']) expect(text).not.toContain(secret);
    expect(text).toMatch(/^■ 한눈에\n- 분야: 인허가 \(업무 안내: 인허가 대리\)/);
  });

  it('선택지 목록에 없는 옛 답은 버린다', () => {
    expect(classifyDiagnosis({ domain: 'dui', answers: { 'dui-bac': 'high' } })).toEqual([]);
    expect(classifyDiagnosis({ domain: 'nope', answers: {} })).toEqual([]);
  });
});

describe('문항 판이 다른 옛 접수 기록(2026-11-27)', () => {
  const answers = { 'dui-disposition': 'revoke', 'dui-elapsed': 'd61to90', 'dui-history': 'none' };
  const record = (form) => ({ id: 'JM-OLD', name: '홍길동', topic: '음주운전 면허 구제', diagnosis: { domain: 'dui', form, answers, counts: { urgent: 1 } } });

  it('판이 다르면 지금 문항의 등급·안내를 붙이지 않고 남긴 답만 보여 준다', () => {
    const text = consultBriefText(buildConsultBrief(record('old-form')));
    expect(text).toContain('이전 셀프 진단에 남긴 답변');
    expect(text).not.toContain('[먼저 확인할 일정]');
    expect(text).not.toMatch(/셀프 진단\(.+\): /);
  });

  it('판 표시가 없는 기록(판 표시 전 시험 접수)과 지금 판은 지금 문항으로 본다', () => {
    for (const form of [undefined, LABELS.brief.checks.dui.form]) {
      const text = consultBriefText(buildConsultBrief(record(form)));
      expect(text).toContain('[먼저 확인할 일정]');
    }
  });
});
