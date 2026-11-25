import { Link } from 'react-router-dom';
import { processGuide } from '../data/process';

/**
 * '의뢰 절차와 보수' 화면(/process)으로 가는 안내 상자.
 * 위쪽 메뉴에 없는 화면이라 이 상자가 들어가는 곳(홈 진행 절차, 업무 상세 진행 절차 아래)이 입구다.
 * 2026-11-26 푸터 링크를 빼면서 작은 글자 링크 대신 이 상자로 바꿨다.
 */
export function ProcessFeeCard() {
  return (
    <div className="card process-fee-card">
      <div>
        <h3>{processGuide.headline}</h3>
        <p>{processGuide.summary}</p>
      </div>
      <Link className="button button--primary" to="/process">의뢰 절차와 보수 보기 →</Link>
    </div>
  );
}
