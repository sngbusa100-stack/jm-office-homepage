import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { checks } from '../data/checks';
import type { CheckDomain } from '../types/content';
import { safeSessionSet } from '../lib/browserStorage';
import { NotFoundPage } from './NotFoundPage';

export function CheckPage() {
  const { domain } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const definition = domain && domain in checks ? checks[domain as CheckDomain] : undefined;
  if (!definition) return <NotFoundPage />;

  const question = definition.questions[index];
  const total = definition.questions.length;
  const selected = answers[question.id];
  const isLast = index === total - 1;

  function goNext() {
    if (!selected || !definition) return;
    if (isLast) {
      safeSessionSet(`check:${definition.domain}`, JSON.stringify(answers));
      navigate(`/check/${definition.domain}/result`);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="page-shell section narrow-page">
      <h1>{definition.title}</h1>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={`전체 ${total}문항 중 ${index + 1}번째`}
        className="progress"
      >
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <fieldset className="question-card card">
        <legend>{index + 1}. {question.text}</legend>
        {question.help && <p className="note">{question.help}</p>}
        {question.options.map((option) => (
          <label key={option.id} className="option-row">
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={selected === option.id}
              onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
            />
            {option.label}
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
