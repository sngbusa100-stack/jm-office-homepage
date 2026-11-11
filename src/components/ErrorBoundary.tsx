import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { office } from '../data/office';

interface Props {
  children: ReactNode;
  /** 값이 바뀌면(예: 주소 이동) 오류 상태를 풀고 다시 그린다. */
  resetKey?: string;
}

interface State {
  failed: boolean;
}

/** 화면 그리기 중 오류가 나면 대체 화면을 보여 준다. 오류 내용은 화면에 내지 않는다. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page-shell section narrow-page" role="alert">
        <h1>화면을 불러오지 못했습니다</h1>
        <p>잠시 후 다시 시도해 주세요.</p>
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={() => window.location.reload()}>새로 고침</button>
          <a className="button button--ghost" href="/">홈으로</a>
          {office.phone && <a className="button button--ghost" href={`tel:${office.phone}`}>{office.phone}</a>}
        </div>
      </div>
    );
  }
}
