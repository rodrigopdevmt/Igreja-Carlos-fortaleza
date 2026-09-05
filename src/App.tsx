import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChurchProvider } from '@/context/ChurchContext';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { MembersPage } from '@/pages/MembersPage';
import { CredentialsPage } from '@/pages/CredentialsPage';
import { FinancePage } from '@/pages/FinancePage';
import { CamerasPage } from '@/pages/CamerasPage';
import { LivesPage } from '@/pages/LivesPage';
import { GroupsPage } from '@/pages/GroupsPage';
import { AgendaPage } from '@/pages/AgendaPage';
import { SundaySchoolPage } from '@/pages/SundaySchoolPage';
import { LeadershipPage } from '@/pages/LeadershipPage';
import { PrayerRequestPage } from '@/pages/PrayerRequestPage';
import { ServiceScalePage } from '@/pages/ServiceScalePage';
import { MonthlyProgramPage } from '@/pages/MonthlyProgramPage';
import { BiblePage } from '@/pages/BiblePage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ChurchProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing / Institutional Home Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Prayer Request Page */}
          <Route path="/oracao" element={<PrayerRequestPage />} />

          {/* Mission Control / Management System Sub-Routes */}
          <Route path="/demo" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/demo/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="credentials" element={<CredentialsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="cameras" element={<CamerasPage />} />
            <Route path="lives" element={<LivesPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="monthly-program" element={<MonthlyProgramPage />} />
            <Route path="service-scale" element={<ServiceScalePage />} />
            <Route path="sunday-school" element={<SundaySchoolPage />} />
            <Route path="leadership" element={<LeadershipPage />} />
            <Route path="bible" element={<BiblePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ChurchProvider>
  );
}
