import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { checkPath } from '../domain/diagnosis';
import { diagnosisForm } from '../../api/_diagnosis-routing.mjs';
import type { CheckDefinition } from '../types/content';
import { findCheck } from '../data/checks';
import { safeSessionSet } from '../lib/browserStorage';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { NotFoundPage } from './NotFoundPage';
import { trackFunnelEvent } from '../lib/funnel';

export function CheckPage() {
  const { domain } = useParams();
  const definition = findCheck(domain);
  return definition ? <Questionnaire key={definition.domain} definition={definition} /> : <NotFoundPage />;
}

function Questionnaire({ definition }: { definition: CheckDefinition }) {
  const navigate = useNavigate();
  const legend = useRef<HTMLLegendElement>(null);
  const previousIndex = useRef(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (previousIndex.current !== index) {
      legend.current?.focus();
      previousIndex.current = index;
    }
  }, [index]);

  useEffect(() => {
    void trackFunnelEvent({
      event: 'diagnosis_start',
      domain: definition.domain,
      path: `/check/${definition.domain}`,
    });
  }, [definition]);

  const path = checkPath(definition, answers);
  const question = path.questions[index];
  const total = path.questions.length;
  const pendingBranch = definition.questions.some((item) => item.showWhen && Object.keys(item.showWhen)
    .some((id) => !answers[id] && path.questions.some((visible) => visible.id === id)));
  const selected = answers[question.id];
  const isLast = index === total - 1;

  function goNext() {
    if (!selected) return;
    if (isLast) {
      safeSessionSet(`check:${definition.domain}`, JSON.stringify({ form: diagnosisForm(definition), answers: path.answers }));
      void trackFunnelEvent({
        event: 'diagnosis_complete',
        domain: definition.domain,
        path: `/check/${definition.domain}`,
      });
      navigate(`/check/${definition.domain}/result`);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="page-shell section narrow-page">
      <Breadcrumbs parents={[{ name: '셀프 진단', to: '/check' }]} current={definition.title} />
      <h1>{definition.title}</h1>
      <p className="question-position">{index + 1}번째 질문 <span>{pendingBranch ? '답변에 따라 질문 수가 달라져요' : `전체 ${total}문항`}</span></p>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={pendingBranch ? `진행 중, ${index + 1}번째 질문` : `전체 ${total}문항 중 ${index + 1}번째`}
        className="progress"
      >
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <fieldset className="question-card card" aria-describedby={question.help ? "question-help" : undefined}>
        <legend ref={legend} tabIndex={-1}>{question.text}</legend>
        {question.help && <p id="question-help" className="question-help">{question.help}</p>}
        {question.options.map((option) => (
          <label key={option.id} className="option-row">
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={selected === option.id}
              onChange={() => setAnswers((prev) => checkPath(definition, { ...prev, [question.id]: option.id }).answers)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="button-row">
        <button className="button button--ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          이전
        </button>
        <button className="button button--primary" disabled={!selected} onClick={goNext}>
          {isLast ? '결과 보기' : '다음'}
        </button>
      </div>
    </div>
  );
}
