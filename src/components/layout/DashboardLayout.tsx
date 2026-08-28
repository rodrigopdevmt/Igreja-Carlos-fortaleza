import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { AuroraBackdrop } from '../common/AuroraBackdrop';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8F5EC] flex flex-col antialiased selection:bg-[#DAA017]/30 selection:text-[#F8F5EC]">
      {/* Background Ambience */}
      <AuroraBackdrop intensity="medium" showGrid={true} />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
          <footer className="h-12 border-t border-[#DAA017]/10 flex items-center px-8 bg-[#1A1A1A] text-[10px] text-[#F8F5EC]/50 uppercase tracking-[0.3em] justify-center shrink-0">
            Mais que uma igreja, somos boas novas para o mundo.
          </footer>
        </div>
      </div>
    </div>
  );
};
