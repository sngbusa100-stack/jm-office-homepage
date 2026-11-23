import { processGuide } from '../data/process';
import { ConsultCta } from '../components/ConsultCta';

export function ProcessPage() {
  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>{processGuide.headline}</h1>
        <p>{processGuide.intro}</p>
      </header>

      <section aria-labelledby="steps">
        <h2 id="steps">{processGuide.steps.title}</h2>
        <ol className="process-grid">
          {processGuide.steps.items.map((step) => (
            <li key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="fees">
        <h2 id="fees">{processGuide.fees.title}</h2>
        <ul className="check-list">
          {processGuide.fees.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <ConsultCta />
    </div>
  );
}
