import type { ProfilePromise } from '../data/profile';

/** 대표의 약속(정확하게·명쾌하게). 홈 인사말과 /about이 함께 쓴다. 세 번째 '변호사와 한 공간에서'는 2026-11-06 인사말 문단과 겹쳐 뺐다. */
export function PromiseList({ promises }: { promises: ProfilePromise[] }) {
  return (
    <ol className="promise-list">
      {promises.map((promise) => (
        <li key={promise.rest}>
          <h3>
            {promise.mark && <span className="slogan-mark">{promise.mark}</span>}
            {promise.rest}
          </h3>
          <p>{promise.detail}</p>
        </li>
      ))}
    </ol>
  );
}
