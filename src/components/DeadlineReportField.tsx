import { DEADLINE_REPORT_OPTIONS, DEADLINE_REPORT_QUESTION } from '../data/deadlineReport';
import type { DeadlineReport } from '../data/deadlineReport';

interface Props {
  value: DeadlineReport | '';
  onChange: (value: DeadlineReport) => void;
  disabled: boolean;
}

/**
 * 처분서·통지서 기한 자가 응답(출입국·비자 외 분야, 선택). 기본값은 없다 —
 * 업무 페이지의 기한 우선 진입(?priority=urgent)이어도 고객이 고르지 않은 답을 만들지 않는다.
 * '2주 안·지남'과 '모름'은 서버(api/_urgency.mjs)에서 기한 우선 확인 건으로 분류된다.
 */
export function DeadlineReportField({ value, onChange, disabled }: Props) {
  return (
    <fieldset className="intake-group">
      <legend>{DEADLINE_REPORT_QUESTION}<span className="intake-optional"> (선택)</span></legend>
      {DEADLINE_REPORT_OPTIONS.map((option) => (
        <label className="intake-choice" key={option.value}>
          <input
            type="radio"
            name="deadlineReport"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
