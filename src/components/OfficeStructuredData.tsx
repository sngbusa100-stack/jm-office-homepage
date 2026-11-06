import { office } from '../data/office';
import { SITE_URL } from '../lib/pageMeta';
import { buildOfficeJsonLd, buildSiteChannelJsonLd, serializeJsonLd } from '../lib/officeContact';

/**
 * 검색엔진용 사무소 정보(schema.org LegalService)와 네이버 연관채널용 Organization(같은 @id).
 * 홈(루트 페이지)에만 넣고, 사전 렌더링 HTML에도 그대로 들어간다.
 */
export function OfficeStructuredData() {
  const blocks = [buildOfficeJsonLd(office, SITE_URL), buildSiteChannelJsonLd(office, SITE_URL)].filter(
    (data): data is Record<string, unknown> => data !== null,
  );
  return (
    <>
      {blocks.map((data) => (
        <script
          key={String(data['@type'])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
    </>
  );
}
