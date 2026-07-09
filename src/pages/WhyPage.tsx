import { why } from '../data/why';
import { ConsultCta } from '../components/ConsultCta';

export function WhyPage() {
  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>{why.headline}</h1>
        <p>{why.intro}</p>
      </header>

      <section aria-labelledby="duties">
        <h2 id="duties">{why.duties.title}</h2>
        <ul className="check-list">
          {why.duties.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section aria-labelledby="when">
        <h2 id="when">{why.when.title}</h2>
        <div className="grid-2">
          {why.when.items.map((item) => (
            <article className="card" key={item.situation}>
              <h3>{item.situation}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="comparison">
        <h2 id="comparison">{why.comparison.title}</h2>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">행정사·변호사·법무사 역할 비교</caption>
            <thead><tr><th scope="col">자격</th><th scope="col">주요 영역</th></tr></thead>
            <tbody>
              {why.comparison.rows.map((row) => (
                <tr key={row.role}><th scope="row">{row.role}</th><td>{row.focus}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">{why.comparison.note}</p>
      </section>

      <section aria-labelledby="diy">
        <h2 id="diy">{why.diy.title}</h2>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">혼자 진행과 전문가 조력 비교</caption>
            <thead><tr><th scope="col">항목</th><th scope="col">혼자 진행</th><th scope="col">전문가와 진행</th></tr></thead>
            <tbody>
              {why.diy.rows.map((row) => (
                <tr key={row.aspect}><th scope="row">{row.aspect}</th><td>{row.diy}</td><td>{row.pro}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">{why.diy.note}</p>
      </section>

      <section aria-labelledby="myths">
        <h2 id="myths">{why.misconceptions.title}</h2>
        {why.misconceptions.items.map((item) => (
          <details key={item.myth}>
            <summary>{item.myth}</summary>
            <p>{item.fact}</p>
          </details>
        ))}
      </section>

      <ConsultCta />
    </div>
  );
}
