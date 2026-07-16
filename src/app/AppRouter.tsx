import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { WhyPage } from '../pages/WhyPage';
import { ServicePage } from '../pages/ServicePage';
import { CheckSelectPage } from '../pages/CheckSelectPage';
import { CheckPage } from '../pages/CheckPage';
import { CheckResultPage } from '../pages/CheckResultPage';
import { ConsultPage } from '../pages/ConsultPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { DisclaimerPage } from '../pages/DisclaimerPage';
import { AdminPage } from '../pages/AdminPage';

export function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/why" element={<WhyPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/check" element={<CheckSelectPage />} />
        <Route path="/check/:domain" element={<CheckPage />} />
        <Route path="/check/:domain/result" element={<CheckResultPage />} />
        <Route path="/consult" element={<ConsultPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
