import { Link, useParams } from 'react-router-dom';
import { findCheck } from '../data/checks';
import type { ResultLevel } from '../types/content';
import { classifyAnswers, summarize, LEVEL_ORDER } from '../domain/diagnosis';
import { safeSessionGet, safeSessionSet } from '../lib/browserStorage';
import { NotFoundPage } from './NotFoundPage';

const LEVEL_LABEL: Record<ResultLevel, string> = {
  urgent: '긴급 확인',
  documents: '서류 보완',
  official: '공식 확인',
  ready: '확인됨',
};

export function CheckResultPage() {
  const { domain } = useParams();
  const definition = findCheck(domain);
  if (!definition) return <NotFoundPage />;

  const raw = safeSessionGet(`check:${definition.domain}`);
  let answers: Record<string, string> | null = null;
  if (raw) {
    try {
      answers = JSON.parse(raw) as Record<string, string>;
    } catch {
      answers = null;
    }
  }
  if (!answers) {
    return (
      <div className="page-shell section narrow-page">
        <h1>진단 결과</h1>
        <p>저장된 답변이 없습니다. 진단을 먼저 진행해 주세요.</p>
        <Link className="button button--primary" to={`/check/${definition.domain}`}>진단 시작 →</Link>
      </div>
    );
  }
  const result = classifyAnswers(definition, answers);
  const summary = summarize(definition, result);
  const grouped = LEVEL_ORDER.map((level) => ({
    level,
    items: result.items.filter((i) => i.level === level),
  })).filter((g) => g.items.length > 0);

  function saveSummaryForConsult() {
    safeSessionSet('consult:summary', JSON.stringify(summary));
  }

  return (
    <div className="page-shell section narrow-page">
      <h1>진단 결과 — {definition.title}</h1>

      {summary.counts.urgent > 0 && (
        <section className="card level-urgent">
          <h2>지금 바로 확인이 필요합니다</h2>
          <p>
            법정 기한과 관련된 항목이 있습니다. 이 사이트의 개업을 기다리지 마시고
            국민권익위원회 상담전화(국번 없이 110) 또는 관할 기관에 즉시 확인하세요.
          </p>
        </section>
      )}

      {grouped.map((group) => (
        <section key={group.level} className={`result-group level-${group.level}`}>
          <h2>{LEVEL_LABEL[group.level]} ({group.items.length})</h2>
          {group.items.map((item) => (
            <article className="card" key={item.questionId}>
              <h3>{item.questionText}</h3>
              <p className="answer">내 답변: {item.answerLabel}</p>
              <p>{item.note}</p>
              {item.lawRef && <p className="law-ref">근거: {item.lawRef}</p>}
            </article>
          ))}
        </section>
      ))}

      <p className="note">
        이 결과는 답변을 정리한 일반 정보이며, 처분·인용 여부에 대한 판단이나 법률 자문이 아닙니다.
        최종 판단은 관할 기관이 합니다.
      </p>

      <div className="button-row">
        <Link className="button button--accent" to="/consult" onClick={saveSummaryForConsult}>
          상담 안내 보기 →
        </Link>
        <Link className="button button--ghost" to={`/check/${definition.domain}`}>다시 진단하기</Link>
      </div>
    </div>
  );
}
