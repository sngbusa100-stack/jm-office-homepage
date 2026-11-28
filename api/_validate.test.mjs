import { describe, expect, it } from 'vitest';
import {
  TOPICS,
  formatTelegramMessage,
  sanitizeAttribution,
  sanitizeDiagnosis,
  validateConsultPayload,
} from './_validate.mjs';
import { forms } from './_check-levels.mjs';

const DUI_FORM = forms.dui;

const valid = {
  name: '홍길동',
  phone: '010-1234-5678',
  topic: TOPICS[0],
  message: '음주운전 셀프 진단 후 문의드립니다.',
  consent: true,
  company: '',
};

describe('상담 접수 검증', () => {
  it('UTM 4종만 정리하고 임의 필드는 버린다', () => {
    expect(sanitizeAttribution({
      source: 'naver',
      medium: 'blog',
      campaign: 'dui',
      content: 'top',
      name: '홍길동',
    })).toEqual({
      source: 'naver',
      medium: 'blog',
      campaign: 'dui',
      content: 'top',
    });
  });

  it('정상 입력을 통과시키고 값을 정리한다', () => {
    const result = validateConsultPayload({ ...valid, name: '  홍길동  ' });
    expect(result.ok).toBe(true);
    expect(result.value.name).toBe('홍길동');
  });

  it('허니팟이 채워지면 spam으로 분류한다', () => {
    const result = validateConsultPayload({ ...valid, company: 'http://spam' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('spam');
  });

  it.each([
    ['name', { name: '' }],
    ['phone', { phone: '123' }],
    ['topic', { topic: '없는 분야' }],
    ['consent', { consent: false }],
    ['message', { message: 'a'.repeat(2001) }],
  ])('%s 오류를 잡는다', (field, patch) => {
    const result = validateConsultPayload({ ...valid, ...patch });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain(field);
  });

  it('객체가 아닌 본문도 안전하게 처리한다', () => {
    expect(validateConsultPayload(null).ok).toBe(false);
    expect(validateConsultPayload('문자열').ok).toBe(false);
  });

  it('진단·유입경로가 있으면 정리해 담고, 없으면 필드를 만들지 않는다', () => {
    const withExtras = validateConsultPayload({
      ...valid,
      diagnosis: { domain: 'dui', form: DUI_FORM, answers: { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' }, counts: { ready: 1, urgent: 1 } },
      sourcePath: '/check/dui/result',
      utmSource: 'naver_blog',
      attribution: {
        source: 'naver',
        medium: 'blog',
        campaign: 'dui',
        content: 'top',
        name: '홍길동',
      },
    });
    expect(withExtras.ok).toBe(true);
    expect(withExtras.value.diagnosis).toEqual({
      domain: 'dui',
      form: DUI_FORM,
      answers: { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' },
      counts: { ready: 1, urgent: 1 },
    });
    expect(withExtras.value.sourcePath).toBe('/check/dui/result');
    expect(withExtras.value.utmSource).toBe('naver_blog');
    expect(withExtras.value.attribution).toEqual({
      source: 'naver',
      medium: 'blog',
      campaign: 'dui',
      content: 'top',
    });

    const without = validateConsultPayload(valid);
    expect(without.ok).toBe(true);
    expect(without.value).not.toHaveProperty('diagnosis');
    expect(without.value).not.toHaveProperty('sourcePath');
    expect(without.value).not.toHaveProperty('utmSource');
    expect(without.value).not.toHaveProperty('attribution');
  });

  it('비자 진단은 서버 비자 규격으로 다시 검증해 접수에 담는다', () => {
    const result = validateConsultPayload({
      ...valid,
      topic: '출입국 · 비자',
      visaDiagnosis: {
        schemaVersion: 1,
        visaSlug: 'e7',
        language: 'ko',
        consent: true,
        answers: {
          stayStatus: 'valid',
          violationStatus: 'none',
          e7Occupation: 'confirmed',
          e7Contract: 'ready',
          e7Wage: 'meets',
        },
      },
      visaIntake: { requester: 'self', currentStatus: 'work', goal: 'change', stage: 'not-applied', language: 'ko' },
    });
    expect(result.ok).toBe(true);
    expect(result.value.visaDiagnosis).toMatchObject({
      visaSlug: 'e7',
      level: 'checked',
      questionCount: 5,
    });
  });

  it.each(['family-sponsor', 'company'])('대리 신청(%s)은 접수 대상자의 체류 답만 사용한다', (requester) => {
    const result = validateConsultPayload({
      ...valid,
      topic: '출입국 · 비자',
      sourcePath: '/result?visa=e7',
      visaDiagnosis: {
        schemaVersion: 1, visaSlug: 'e7', language: 'ko', consent: true,
        answers: { stayStatus: 'expired', stayHistory: 'current', e7Occupation: 'confirmed', e7Contract: 'ready', e7Wage: 'meets' },
      },
      visaIntake: { requester, subjectNotified: true, stayStatus: 'overseas', goal: 'permanent', stage: 'not-applied', language: 'ko' },
    });
    expect(result.ok).toBe(true);
    expect(result.value).not.toHaveProperty('visaDiagnosis');
    expect(result.value).not.toHaveProperty('sourcePath');
    expect(result.value.visaIntake).toMatchObject({ stayStatus: 'overseas', deadlineFirst: false });
    expect(result.value.visaIntake).not.toHaveProperty('violation');
  });

  it('비자 진단이 첨부되면 출입국·비자 분야만 허용한다', () => {
    const visaDiagnosis = {
      schemaVersion: 1,
      visaSlug: 'e7',
      language: 'ko',
      consent: true,
      answers: {
        stayStatus: 'valid',
        violationStatus: 'none',
        e7Occupation: 'confirmed',
        e7Contract: 'ready',
        e7Wage: 'meets',
      },
    };
    const mismatched = validateConsultPayload({
      ...valid,
      topic: '음주운전 면허 구제',
      visaDiagnosis,
      visaIntake: { requester: 'self' },
    });
    expect(mismatched.ok).toBe(false);
    expect(mismatched.errors).toContain('topic');
  });

  it('셀프 진단은 상담 분야와 진단 분야가 같을 때만 담고, 다르면 진단과 진단 경로를 버린다', () => {
    const diagnosis = { domain: 'dui', form: DUI_FORM, answers: { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' }, counts: { ready: 1, urgent: 1 } };
    const matched = validateConsultPayload({ ...valid, topic: '음주운전 면허 구제', diagnosis, sourcePath: '/check/dui/result' });
    expect(matched.value.diagnosis).toMatchObject({ domain: 'dui' });

    const mismatched = validateConsultPayload({ ...valid, topic: '인허가', diagnosis, sourcePath: '/check/dui/result' });
    expect(mismatched.ok).toBe(true);
    expect(mismatched.value).not.toHaveProperty('diagnosis');
    expect(mismatched.value).not.toHaveProperty('sourcePath');
  });

  it('비자 진단과 함께 온 메인 셀프 진단은 버린다(긴급 판정이 섞이지 않게)', () => {
    const result = validateConsultPayload({
      ...valid,
      topic: '출입국 · 비자',
      diagnosis: { domain: 'dui', form: DUI_FORM, answers: { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' }, counts: { ready: 1, urgent: 1 } },
      visaDiagnosis: {
        schemaVersion: 1,
        visaSlug: 'e7',
        language: 'ko',
        consent: true,
        answers: { stayStatus: 'valid', violationStatus: 'none', e7Occupation: 'confirmed', e7Contract: 'ready', e7Wage: 'meets' },
      },
      visaIntake: { requester: 'self', currentStatus: 'work', goal: 'change', stage: 'not-applied', language: 'ko' },
    });
    expect(result.ok).toBe(true);
    expect(result.value).toHaveProperty('visaDiagnosis');
    expect(result.value).not.toHaveProperty('diagnosis');
  });

  it('멱등성 키(submissionId)는 형식이 맞을 때만 담는다', () => {
    const good = validateConsultPayload({ ...valid, submissionId: 'abc-123-DEF-456' });
    expect(good.value.submissionId).toBe('abc-123-DEF-456');
    const bad = validateConsultPayload({ ...valid, submissionId: '너무 이상한 값!!' });
    expect(bad.ok).toBe(true);
    expect(bad.value).not.toHaveProperty('submissionId');
  });

  it('이메일은 선택이며, 입력 시 형식 오류를 잡고 정상이면 담는다', () => {
    expect(validateConsultPayload(valid).ok).toBe(true); // 이메일 없이 유효
    expect(validateConsultPayload(valid).value).not.toHaveProperty('email');

    const withEmail = validateConsultPayload({ ...valid, email: 'a@b.co' });
    expect(withEmail.ok).toBe(true);
    expect(withEmail.value.email).toBe('a@b.co');

    const bad = validateConsultPayload({ ...valid, email: '이상한값' });
    expect(bad.ok).toBe(false);
    expect(bad.errors).toContain('email');
  });

  it('손상된 진단 데이터는 접수를 막지 않고 제외한다', () => {
    const result = validateConsultPayload({ ...valid, diagnosis: '이상한 값' });
    expect(result.ok).toBe(true);
    expect(result.value).not.toHaveProperty('diagnosis');
  });

  it('기한 자가 응답(deadlineReport)은 허용값만 담고, 틀린 값은 접수를 막지 않고 버린다', () => {
    for (const report of ['soon', 'later', 'unknown', 'none']) {
      const result = validateConsultPayload({ ...valid, deadlineReport: report });
      expect(result.ok).toBe(true);
      expect(result.value.deadlineReport).toBe(report);
    }
    for (const bad of ['urgent', '', 1, true, { v: 'soon' }]) {
      const result = validateConsultPayload({ ...valid, deadlineReport: bad });
      expect(result.ok).toBe(true);
      expect(result.value).not.toHaveProperty('deadlineReport');
    }
    expect(validateConsultPayload(valid).value).not.toHaveProperty('deadlineReport');
  });

  it('주소의 priority 값만으로는 긴급 자가 응답이 생기지 않는다', () => {
    const result = validateConsultPayload({ ...valid, priority: 'urgent' });
    expect(result.ok).toBe(true);
    expect(result.value).not.toHaveProperty('deadlineReport');
    expect(result.value).not.toHaveProperty('priority');
  });
});

describe('진단 데이터 정리 (진단 정의 대조·등급 재계산)', () => {
  it('없는 도메인은 진단 전체를 제외한다', () => {
    expect(sanitizeDiagnosis(null)).toBeNull();
    expect(sanitizeDiagnosis({})).toBeNull();
    expect(sanitizeDiagnosis({ domain: '없는도메인', answers: { q: 'a' } })).toBeNull();
  });

  it('없는 문항·선택지는 버리고 실제 정의만 남긴다', () => {
    const result = sanitizeDiagnosis({
      domain: 'dui',
      form: DUI_FORM,
      answers: { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90', '가짜문항': 'x', 'dui-bac': '가짜선택지' },
    });
    expect(result.answers).toEqual({ 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' });
  });

  it('counts는 클라이언트 값을 무시하고 서버가 재계산한다 (긴급 위조 차단)', () => {
    const forged = sanitizeDiagnosis({
      domain: 'dui',
      form: DUI_FORM,
      answers: { 'dui-disposition': 'suspend' }, // ready 등급 1개
      counts: { urgent: 99 },
    });
    expect(forged.counts).toEqual({ ready: 1 });

    const realUrgent = sanitizeDiagnosis({
      domain: 'dui',
      form: DUI_FORM,
      answers: { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' }, // urgent 등급
    });
    expect(realUrgent.counts).toEqual({ ready: 1, urgent: 1 });
  });

  it('문항 판 표시가 없거나 지금 문항과 다르면 진단 전체를 제외한다(문항을 고치기 전에 열어 둔 화면)', () => {
    const answers = { 'dui-disposition': 'suspend', 'dui-elapsed': 'd61to90' };
    expect(sanitizeDiagnosis({ domain: 'dui', answers })).toBeNull();
    expect(sanitizeDiagnosis({ domain: 'dui', form: 'old', answers })).toBeNull();
    expect(sanitizeDiagnosis({ domain: 'dui', form: DUI_FORM, answers })).toMatchObject({ form: DUI_FORM, answers });
    // 접수는 막지 않고 진단만 뺀다
    const result = validateConsultPayload({ ...valid, topic: '음주운전 면허 구제', diagnosis: { domain: 'dui', answers } });
    expect(result.ok).toBe(true);
    expect(result.value).not.toHaveProperty('diagnosis');
  });

  it('덮어쓰기 규칙의 등급으로 긴급 개수를 센다(화면 결과와 같게)', () => {
    // 처분 통지 61~90일이지만 이미 행정심판을 청구함 → 기한은 지난 일이라 긴급이 아님
    const filed = sanitizeDiagnosis({
      domain: 'dui', form: DUI_FORM,
      answers: { 'dui-disposition': 'revoke', 'dui-elapsed': 'd61to90', 'dui-procedure': 'appeal' },
    });
    expect(filed.counts.urgent).toBeUndefined();
    // 이의신청을 하지 않았으면 그대로 긴급
    const none = sanitizeDiagnosis({
      domain: 'dui', form: DUI_FORM,
      answers: { 'dui-disposition': 'revoke', 'dui-elapsed': 'd61to90', 'dui-procedure': 'no' },
    });
    expect(none.counts.urgent).toBe(1);
  });

  it('문자열이 아닌 답변 값은 건너뛴다', () => {
    const result = sanitizeDiagnosis({
      domain: 'dui',
      form: DUI_FORM,
      answers: { 'dui-elapsed': 7, 'dui-disposition': 'suspend' },
    });
    expect(result.answers).toEqual({ 'dui-disposition': 'suspend' });
  });
});

describe('텔레그램 메시지 포맷', () => {
  const sample = { name: '홍길동', phone: '010-1234-5678', topic: TOPICS[0], message: '문의합니다' };

  it('정상 저장 시 개인정보(이름·연락처·분야·내용) 없이 접수번호만 알린다', () => {
    const text = formatTelegramMessage(sample, {
      origin: 'https://example.com',
      inquiryId: 'JM-20260718-AB12',
    });
    expect(text).toContain('새 상담 접수');
    expect(text).toContain('접수번호: JM-20260718-AB12');
    // 누르면 관리 화면이 그 접수를 바로 펼친다. 주소에는 접수번호만 붙는다.
    expect(text).toContain('상세 보기: https://jungmyungoffice.com/admin#JM-20260718-AB12');
    expect(text).not.toContain('홍길동');
    expect(text).not.toContain('010-1234-5678');
    expect(text).not.toContain(TOPICS[0]);
    expect(text).not.toContain('문의합니다');
    expect(text).not.toContain('https://example.com');
  });

  it('긴급 건은 근거와 상관없이 같은 한 줄만 넣어 비자 여부도 드러나지 않는다', () => {
    const texts = [['diagnosis'], ['visaIntake'], ['visaDiagnosis'], ['selfReported'], ['diagnosis', 'visaIntake', 'selfReported']]
      .map((urgentReasons) => formatTelegramMessage(sample, { inquiryId: 'JM-1', urgentReasons }));
    for (const text of texts) {
      expect(text).toBe(texts[0]);
      expect(text.match(/⏰/g)).toHaveLength(1);
      expect(text).toContain('⏰ 기한 우선 확인 — 근거는 관리 화면에서');
    }
    const normal = formatTelegramMessage(sample, { inquiryId: 'JM-1' });
    expect(normal).not.toContain('⏰');
  });

  it.each(TOPICS)('평상시 긴급 알림에도 분야(%s)가 드러나지 않는다', (topic) => {
    const text = formatTelegramMessage({ ...sample, topic }, {
      inquiryId: 'JM-1',
      urgentReasons: ['diagnosis', 'visaIntake', 'visaDiagnosis', 'selfReported'],
    });
    expect(text).not.toContain(topic);
    for (const hint of ['비자', '진단', '음주', '영업', '보훈', '인허가', '토지']) expect(text).not.toContain(hint);
  });

  it('저장 장애 알림에는 장애와 식별번호만 담는다', () => {
    const failed = formatTelegramMessage(sample, {
      inquiryId: 'JM-20260718-AB12',
      storeError: true,
      urgentReasons: ['selfReported'],
      origin: 'https://example.com',
    });
    expect(failed.split('\n')).toEqual(['⚠ 홈페이지 접수 저장 확인 필요', '확인번호: JM-20260718-AB12']);
  });
});
