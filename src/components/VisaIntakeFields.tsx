import type { ReactNode } from 'react';
import {
  CURRENT_STATUS_OPTIONS,
  DATED_STAGES,
  GOAL_OPTIONS,
  GOALS_WITH_VISA_DIAGNOSIS,
  LANGUAGE_OPTIONS,
  REQUESTER_HEADLINE,
  REQUESTER_OPTIONS,
  STAFF_COUNT_OPTIONS,
  STAGE_OPTIONS,
  STAY_STATUS_OPTIONS,
  VIOLATION_OPTIONS,
  intakeWording,
} from '../data/visaIntake';
import type { IntakeOption, Requester, VisaIntakeAnswers } from '../data/visaIntake';

interface Props {
  answers: VisaIntakeAnswers;
  onChange: (patch: Partial<VisaIntakeAnswers>) => void;
  disabled: boolean;
  /** 비자 진단에서 넘어온 답(체류 상태·위반 이력)이 있으면 그 질문은 다시 묻지 않는다. */
  fromDiagnosis: { stayStatus?: string; violation?: string } | null;
}

function RadioGroup({
  legend, name, options, value, onSelect, disabled, required = true, hint,
}: {
  legend: string;
  name: string;
  options: IntakeOption[];
  value: string;
  onSelect: (value: string) => void;
  disabled: boolean;
  required?: boolean;
  hint?: ReactNode;
}) {
  return (
    <fieldset className="intake-group">
      <legend>{legend}{!required && <span className="intake-optional"> (선택)</span>}</legend>
      {hint && <p className="note">{hint}</p>}
      {options.map((option) => (
        <label className="intake-choice" key={`${name}-${option.value || 'blank'}`}>
          <input
            type="radio"
            name={`visa-${name}`}
            value={option.value}
            checked={value === option.value}
            onChange={() => onSelect(option.value)}
            required={required}
            disabled={disabled}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export function VisaIntakeFields({ answers, onChange, disabled, fromDiagnosis }: Props) {
  const words = intakeWording(answers.requester);
  const stayStatus = fromDiagnosis?.stayStatus || answers.stayStatus;
  const inKorea = stayStatus !== '' && stayStatus !== 'overseas';
  const asksArrival = stayStatus === 'overseas' || answers.goal === 'first-entry';
  const proxy = answers.requester !== '' && answers.requester !== 'self';
  const goalOptions = fromDiagnosis
    ? GOAL_OPTIONS.filter((option) => GOALS_WITH_VISA_DIAGNOSIS.includes(option.value))
    : GOAL_OPTIONS;
  const deadlineMode = answers.deadlineDate === 'none' || answers.deadlineDate === 'unsure'
    ? answers.deadlineDate
    : 'date';

  return (
    <section className="visa-intake" aria-labelledby="visa-intake-title">
      <h3 id="visa-intake-title">비자 상담에 필요한 질문</h3>
      <p className="note">
        상황을 정확히 이해하려고 여쭙니다. 모르시면 &lsquo;잘 모르겠음&rsquo;을 고르셔도 됩니다.
        외국인등록번호·여권번호는 묻지 않습니다.
      </p>

      <RadioGroup
        legend="누구의 일로 문의하시나요?"
        name="requester"
        options={REQUESTER_OPTIONS}
        value={answers.requester}
        onSelect={(requester) => onChange({ requester })}
        disabled={disabled}
      />
      {proxy && (
        <div className="intake-proxy">
          <p className="note" role="status">{REQUESTER_HEADLINE[answers.requester as Requester]}</p>
          <label className="agree">
            <input
              type="checkbox"
              name="visa-subjectNotified"
              checked={answers.subjectNotified}
              onChange={(e) => onChange({ subjectNotified: e.target.checked })}
              required
              disabled={disabled}
            />
            비자를 받을 분에게 이 상담 신청 사실을 알렸습니다. 그분의 이름·연락처·외국인등록번호는 적지 않겠습니다.
          </label>
          <p className="note">만 14세 미만 아동의 일이라면 부모 등 법정대리인이 신청해 주세요.</p>
        </div>
      )}
      {answers.requester === 'company' && (
        <RadioGroup
          legend="이번에 처리할 직원은 몇 명인가요?"
          name="staffCount"
          options={STAFF_COUNT_OPTIONS}
          value={answers.staffCount}
          onSelect={(staffCount) => onChange({ staffCount })}
          disabled={disabled}
          required={false}
        />
      )}

      {fromDiagnosis?.stayStatus ? (
        <p className="note">체류 상태는 비자 진단에서 답하신 내용을 사용합니다.</p>
      ) : (
        <RadioGroup
          legend={words.stay}
          name="stayStatus"
          options={STAY_STATUS_OPTIONS}
          value={answers.stayStatus}
          onSelect={(value) => onChange({ stayStatus: value })}
          disabled={disabled}
        />
      )}
      {stayStatus === 'expired' && (
        <p className="note level-urgent-note" role="alert">
          체류기간이 지났다면 빠른 확인이 필요합니다. 사무소 회신을 기다리지 마시고
          외국인종합안내센터 1345(해외 +82-2-1345)에도 확인해 주세요.
        </p>
      )}
      {inKorea && (
        <label>체류기간 만료일 <span className="intake-optional">(선택)</span>
          <input
            type="date"
            name="visa-expiryDate"
            value={answers.expiryDate}
            onChange={(e) => onChange({ expiryDate: e.target.value })}
            disabled={disabled}
          />
          <span className="note">외국인등록증, 최근 받은 허가 문자, 하이코리아(hikorea.go.kr)에서 확인할 수 있어요. 모르시면 비워 두세요.</span>
        </label>
      )}

      {inKorea && (
        <label>{words.currentStatus}
          <select
            name="visa-currentStatus"
            value={answers.currentStatus}
            onChange={(e) => onChange({ currentStatus: e.target.value })}
            required
            disabled={disabled}
          >
            <option value="" disabled>선택해 주세요</option>
            {CURRENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <span className="note">외국인등록증 앞면 &lsquo;체류자격&rsquo; 칸의 영문·숫자예요(예: E-7). 등록증이 없으면 여권의 입국 도장이나 받은 비자를 보세요.</span>
        </label>
      )}
      {inKorea && answers.currentStatus === 'other' && (
        <label>체류자격 코드 <span className="intake-optional">(예: D-8)</span>
          <input
            type="text"
            name="visa-currentStatusCode"
            maxLength={8}
            value={answers.currentStatusCode}
            onChange={(e) => onChange({ currentStatusCode: e.target.value })}
            disabled={disabled}
          />
        </label>
      )}

      <RadioGroup
        legend={words.goal}
        name="goal"
        options={goalOptions}
        value={answers.goal}
        onSelect={(goal) => onChange({ goal })}
        disabled={disabled}
      />
      <label>원하는 체류자격 <span className="intake-optional">(선택, 예: E-7)</span>
        <input
          type="text"
          name="visa-desiredStatusCode"
          maxLength={8}
          value={answers.desiredStatusCode}
          onChange={(e) => onChange({ desiredStatusCode: e.target.value })}
          disabled={disabled}
        />
      </label>
      {asksArrival && (
        <div className="intake-inline">
          <label>{words.target} <span className="intake-optional">(선택)</span>
            <input
              type="month"
              name="visa-targetMonth"
              value={answers.targetMonth === 'undecided' ? '' : answers.targetMonth}
              onChange={(e) => onChange({ targetMonth: e.target.value })}
              disabled={disabled || answers.targetMonth === 'undecided'}
            />
          </label>
          <label className="agree">
            <input
              type="checkbox"
              checked={answers.targetMonth === 'undecided'}
              onChange={(e) => onChange({ targetMonth: e.target.checked ? 'undecided' : '' })}
              disabled={disabled}
            />
            아직 정해지지 않음
          </label>
        </div>
      )}

      <RadioGroup
        legend={words.stage}
        name="stage"
        options={STAGE_OPTIONS}
        value={answers.stage}
        onSelect={(stage) => onChange({ stage })}
        disabled={disabled}
      />
      {DATED_STAGES.includes(answers.stage) && (
        <div className="intake-dates">
          <p className="note" role="alert">
            정해진 기한이 짧을 수 있습니다. 받은 문서는 버리지 말고 상담 때 보여 주세요.
            재신청과 서류 준비는 상담해 드립니다. 행정심판·소송의 청구와 대리는 행정사 업무가 아니어서,
            필요하면 변호사 상담을 안내해 드립니다.
          </p>
          <div className="intake-inline">
            <label>받은 날짜
              <input
                type="date"
                name="visa-receivedDate"
                value={answers.receivedDate === 'unsure' ? '' : answers.receivedDate}
                onChange={(e) => onChange({ receivedDate: e.target.value })}
                required={answers.receivedDate !== 'unsure'}
                disabled={disabled || answers.receivedDate === 'unsure'}
              />
            </label>
            <label className="agree">
              <input
                type="checkbox"
                checked={answers.receivedDate === 'unsure'}
                onChange={(e) => onChange({ receivedDate: e.target.checked ? 'unsure' : '' })}
                disabled={disabled}
              />
              잘 모르겠음
            </label>
          </div>
          <fieldset className="intake-group">
            <legend>문서에 적힌 마감일</legend>
            <p className="note">받은 문자나 문서에 적힌 날짜를 적어 주세요.</p>
            {[
              { value: 'date', label: '날짜가 있음' },
              { value: 'none', label: '마감일 없음' },
              { value: 'unsure', label: '잘 모르겠음' },
            ].map((option) => (
              <label className="intake-choice" key={option.value}>
                <input
                  type="radio"
                  name="visa-deadlineMode"
                  checked={answers.deadlineDate === '' ? false : deadlineMode === option.value}
                  onChange={() => onChange({ deadlineDate: option.value === 'date' ? 'date-pending' : option.value })}
                  required
                  disabled={disabled}
                />
                {option.label}
              </label>
            ))}
            {deadlineMode === 'date' && answers.deadlineDate !== '' && (
              <input
                type="date"
                name="visa-deadlineDate"
                aria-label="마감일"
                value={answers.deadlineDate === 'date-pending' ? '' : answers.deadlineDate}
                onChange={(e) => onChange({ deadlineDate: e.target.value || 'date-pending' })}
                required
                disabled={disabled}
              />
            )}
          </fieldset>
        </div>
      )}
      {answers.stage === 'appeal-ongoing' && (
        <p className="note" role="status">
          행정심판·소송의 청구와 대리는 행정사 업무가 아니어서, 필요하면 변호사 상담을 안내해 드립니다.
          관련 서류 준비는 상담해 드립니다.
        </p>
      )}

      {fromDiagnosis?.violation ? null : (
        <RadioGroup
          legend={words.violation}
          name="violation"
          options={VIOLATION_OPTIONS}
          value={answers.violation}
          onSelect={(violation) => onChange({ violation })}
          disabled={disabled}
          required={false}
          hint="자세한 내용이나 형사재판·벌금형 같은 내용은 여기에 적지 마세요. 답하지 않아도 상담을 받으실 수 있어요."
        />
      )}

      <label>{words.language}
        <select
          name="visa-language"
          value={answers.language}
          onChange={(e) => onChange({ language: e.target.value })}
          required
          disabled={disabled}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      {answers.language === 'other' && (
        <label>언어 이름
          <input
            type="text"
            name="visa-languageOther"
            maxLength={30}
            value={answers.languageOther}
            onChange={(e) => onChange({ languageOther: e.target.value })}
            disabled={disabled}
          />
        </label>
      )}
      {asksArrival && (
        <label>{words.nationality} <span className="intake-optional">(선택)</span>
          <input
            type="text"
            name="visa-nationality"
            maxLength={40}
            list="visa-nationality-list"
            value={answers.nationality}
            onChange={(e) => onChange({ nationality: e.target.value })}
            disabled={disabled}
          />
          <datalist id="visa-nationality-list">
            {['베트남', '중국', '필리핀', '인도네시아', '우즈베키스탄', '네팔', '캄보디아', '태국', '몽골', '미국', '일본'].map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
          <span className="note">나라마다 비자 서류가 달라서 여쭤요. 답하지 않아도 됩니다.</span>
        </label>
      )}
    </section>
  );
}

