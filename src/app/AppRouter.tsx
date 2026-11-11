import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { WhyPage } from '../pages/WhyPage';
import { ServicePage } from '../pages/ServicePage';
import { ServicesPage } from '../pages/ServicesPage';
import { CheckSelectPage } from '../pages/CheckSelectPage';
import { CheckPage } from '../pages/CheckPage';
import { CheckResultPage } from '../pages/CheckResultPage';
import { ConsultPage } from '../pages/ConsultPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { DisclaimerPage } from '../pages/DisclaimerPage';
import { LocationPage } from '../pages/LocationPage';

// 관리자 화면만 따로 내려받는다. 다른 페이지는 사전 렌더링 본문이 있어야 하므로 lazy로 바꾸지 않는다.
const AdminPage = lazy(() => import('../pages/AdminPage').then((m) => ({ default: m.AdminPage })));

export function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/why" element={<WhyPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/check" element={<CheckSelectPage />} />
        <Route path="/check/:domain" element={<CheckPage />} />
        <Route path="/check/:domain/result" element={<CheckResultPage />} />
        <Route path="/consult" element={<ConsultPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/admin" element={(
          <Suspense fallback={<p className="page-shell section">불러오는 중…</p>}>
            <AdminPage />
          </Suspense>
        )} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
