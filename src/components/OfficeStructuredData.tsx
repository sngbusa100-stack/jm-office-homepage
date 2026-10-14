import { office } from '../data/office';
import { SITE_URL } from '../lib/pageMeta';
import { buildOfficeJsonLd } from '../lib/officeContact';

/** 검색엔진용 사무소 정보(schema.org LegalService). 사전 렌더링 HTML에도 그대로 들어간다. */
export function OfficeStructuredData() {
  const data = buildOfficeJsonLd(office, SITE_URL);
  if (!data) return null;
  // JSON 안의 '<'를 이스케이프해 </script> 조기 종료를 막는다.
  const json = JSON.stringify(data).replaceAll('<', '\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
