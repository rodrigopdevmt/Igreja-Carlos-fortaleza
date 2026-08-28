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
            <Route path="sunday-school" element={<SundaySchoolPage />} />
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
