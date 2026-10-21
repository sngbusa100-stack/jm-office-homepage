import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildInquiryContract } from '../lib/inquiryContract';
// @ts-expect-error — 서버 모듈(.mjs)은 타입 선언 없이 값만 비교한다.
import { CONNECTOR_STATUS_RULES } from '../../api/_store.mjs';
// @ts-expect-error — 서버 모듈(.mjs)
import { VISA_INTAKE_VALUES } from '../../api/_visa-intake.mjs';
// @ts-expect-error — 서버 모듈(.mjs)
import { TOPICS } from '../../api/_validate.mjs';
// @ts-expect-error — 서버 모듈(.mjs)
import { DEADLINE_REPORTS, URGENT_REASONS } from '../../api/_urgency.mjs';

const CONTRACT_PATH = join(__dirname, '../../api/_inquiry-contract.json');

// 홈페이지 접수 레코드와 로컬 행정심판 시스템(store.py)이 같은 필드·값을 쓰도록 고정한다.
// 로컬 저장소는 scripts/sync-inquiry-contract.mjs로 복사한 사본을 자기 테스트에서 대조한다.
// 계약을 바꿀 때: UPDATE_INQUIRY_CONTRACT=1 로 이 테스트를 실행하면 파일을 다시 쓴다(npm run contract:inquiry).
describe('접수 연동 계약 (api/_inquiry-contract.json)', () => {
  const expected = buildInquiryContract();
  if (process.env.UPDATE_INQUIRY_CONTRACT === '1') {
    writeFileSync(CONTRACT_PATH, `${JSON.stringify(expected, null, 2)}\n`);
  }
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8'));

  it('계약 파일이 현재 코드에서 만든 계약과 같다(다르면 npm run contract:inquiry 후 로컬에 복사)', () => {
    expect(contract).toEqual(expected);
  });

  it('로컬이 반드시 보관할 필드는 모두 접수 레코드에 있는 필드다', () => {
    for (const field of contract.localMustKeep) expect(contract.recordFields).toContain(field);
    for (const field of ['name', 'phone', 'visaIntake', 'visaDiagnosis', 'attribution', 'consent']) {
      expect(contract.localMustKeep).toContain(field);
    }
  });

  it('연동 API 상태 값은 서버 검증 규칙과 같다', () => {
    expect(contract.connectorStatus).toEqual(CONNECTOR_STATUS_RULES);
  });

  it('비자 접수 질문의 모든 서버 허용값에 한국어 라벨이 있다', () => {
    for (const [key, values] of Object.entries(VISA_INTAKE_VALUES as Record<string, string[]>)) {
      const options = contract.visaIntakeLabels[key]?.options ?? {};
      for (const value of values) {
        expect(options[value], `${key}.${value} 라벨 없음`).toBeTruthy();
      }
    }
  });

  it('상담 분야 6개 모두 처리 경로가 있다(사건 전환 2개, 회신 처리 4개)', () => {
    expect(Object.keys(contract.topics).sort()).toEqual([...TOPICS].sort());
    expect(Object.values(contract.topics).filter((r) => (r as { route: string }).route === 'case')).toHaveLength(2);
  });

  it('연동기 GET은 저장하지 않는 회신 초안과 긴급 근거를 함께 돌려준다', () => {
    expect(contract.connectorGetExtras).toEqual(['replyDraft', 'urgentReasons']);
    expect(contract.recordFields).not.toContain('replyDraft');
    expect(contract.recordFields).not.toContain('urgentReasons');
  });

  it('기한 자가 응답은 로컬이 반드시 보관하고, 모든 서버 허용값·긴급 근거에 한국어 라벨이 있다', () => {
    expect(contract.recordFields).toContain('deadlineReport');
    expect(contract.localMustKeep).toContain('deadlineReport');
    expect(Object.keys(contract.deadlineReportLabels.options)).toEqual(DEADLINE_REPORTS);
    expect(contract.deadlineReportLabels.question).toBeTruthy();
    expect(Object.keys(contract.urgentReasonLabels)).toEqual(URGENT_REASONS);
  });

  it('미처리 기준은 주인님이 승인한 값이다(2026-10-19: 72시간 지연, 긴급 24시간, 30일 경고, 90일 자동 종결)', () => {
    expect(contract.staleRules).toEqual({ delayHours: 72, urgentDelayHours: 24, warnDays: 30, autoCloseDays: 90 });
  });
});
