import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

export { buildSitemapXml, getIndexablePaths, getPageMeta, SITE_URL } from '../lib/pageMeta';
export { applyPage, escapeHtml, toSpaFallback } from './html';

/** 경로 하나를 브라우저 없이 HTML로 렌더링한다. 빌드 때 사전 렌더링에만 쓴다. */
export function renderPage(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <AppRouter />
    </StaticRouter>,
  );
}
