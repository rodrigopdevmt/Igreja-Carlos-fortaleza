import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { AuroraBackdrop } from '../common/AuroraBackdrop';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[#1A1A1A] text-[#F8F5EC] flex antialiased selection:bg-[#DAA017]/30 selection:text-[#F8F5EC] overflow-hidden">
      <AuroraBackdrop intensity="medium" showGrid={true} />

      <div className="relative z-10 flex flex-1 min-w-0">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>
          <footer className="h-12 border-t border-[#DAA017]/10 flex items-center px-8 bg-[#1A1A1A]/70 backdrop-blur-sm text-[10px] text-[#F8F5EC]/40 uppercase tracking-[0.3em] justify-center shrink-0">
            Uma Igreja, Uma Familia, Uma Missao
          </footer>
        </div>
      </div>
    </div>
  );
};
