import type { ProfilePromise } from '../data/profile';

/** 대표의 약속 3가지. 홈 인사말과 /about이 함께 쓴다. */
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
