import {
  CURRENT_STATUS_OPTIONS,
  DATED_STAGES,
  GOAL_OPTIONS,
  GOALS_WITH_VISA_DIAGNOSIS,
  LANGUAGE_OPTIONS,
  REQUESTER_OPTIONS,
  STAFF_COUNT_OPTIONS,
  STAGE_OPTIONS,
  STAY_STATUS_OPTIONS,
  VIOLATION_OPTIONS,
  buildVisaIntakePayload,
  describeVisaIntake,
  EMPTY_VISA_INTAKE,
  intakeWording,
} from '../data/visaIntake';
// @ts-expect-error — 서버 모듈(.mjs)은 타입 선언 없이 값만 비교한다.
import { VISA_INTAKE_VALUES, GOALS_WITH_VISA_DIAGNOSIS as SERVER_GOALS, DATED_STAGES as SERVER_DATED } from '../../api/_visa-intake.mjs';
// @ts-expect-error — 서버 모듈(.mjs)
import { CONSENT_VERSION } from '../../api/_store.mjs';
import { PRIVACY_EFFECTIVE_DATE } from '../data/privacyPolicy';

const values = (options: { value: string }[]) => options.map((o) => o.value).filter(Boolean);

describe('비자 접수 질문 — 화면과 서버 값 동기화', () => {
  it.each([
    ['requester', REQUESTER_OPTIONS],
    ['staffCount', STAFF_COUNT_OPTIONS],
    ['stayStatus', STAY_STATUS_OPTIONS],
    ['currentStatus', CURRENT_STATUS_OPTIONS],
    ['goal', GOAL_OPTIONS],
    ['stage', STAGE_OPTIONS],
    ['violation', VIOLATION_OPTIONS],
    ['language', LANGUAGE_OPTIONS],
  ] as const)('%s 선택지 값이 서버 허용값과 같다', (key, options) => {
    expect(values(options)).toEqual(VISA_INTAKE_VALUES[key]);
  });

  it('진단 경유 목적·날짜 필요 단계 목록이 서버와 같다', () => {
    expect(GOALS_WITH_VISA_DIAGNOSIS).toEqual(SERVER_GOALS);
    expect(DATED_STAGES).toEqual(SERVER_DATED);
  });

  it('체류 상태 라벨은 비자 진단 사이트와 같은 말을 쓰고 임박 기준이 사무소 기준임을 밝힌다', () => {
    expect(STAY_STATUS_OPTIONS.find((o) => o.value === 'near-expiry')?.label).toContain('약 2개월 이내, 사무소 안내 기준');
    expect(STAY_STATUS_OPTIONS.find((o) => o.value === 'overseas')?.label).toBe('현재 해외에 있음');
  });

  it('동의 문구 버전과 개인정보처리방침 시행일이 같다', () => {
    expect(PRIVACY_EFFECTIVE_DATE).toBe(CONSENT_VERSION);
  });
});

describe('비자 접수 질문 — 문구와 전송값', () => {
  it('회사·가족 문의는 비자를 받을 사람을 주어로 묻는다', () => {
    expect(intakeWording('company').stay).toContain('직원은');
    expect(intakeWording('family-sponsor').currentStatus).toContain('초청하려는 가족의');
    expect(intakeWording('self').stay).not.toContain('직원');
  });

  it('화면 조건에 맞지 않는 칸은 보내지 않는다', () => {
    const payload = buildVisaIntakePayload({
      ...EMPTY_VISA_INTAKE,
      requester: 'self', staffCount: '2-5', stayStatus: 'overseas', currentStatus: 'work',
      goal: 'first-entry', nationality: '베트남', stage: 'waiting', receivedDate: '2026-10-01',
    });
    expect(payload).not.toHaveProperty('staffCount');
    expect(payload).not.toHaveProperty('currentStatus');
    expect(payload).not.toHaveProperty('receivedDate');
    expect(payload).toMatchObject({ nationality: '베트남', language: 'ko' });
  });

  it('관리자 화면은 값을 우리말 라벨로 보여 준다', () => {
    const rows = describeVisaIntake({ requester: 'company', stage: 'denied', deadlineDate: 'unsure', deadlineFirst: true });
    expect(rows.map((r) => r.answer)).toEqual([
      '회사에서 외국인 직원을 채용하거나 관리합니다',
      '허가되지 않았다(불허)는 결과를 받음',
      '잘 모르겠음',
    ]);
  });
});
