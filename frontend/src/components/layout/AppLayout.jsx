import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import GlobalSearchModal from './GlobalSearchModal';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-workspace-bg text-workspace-text flex flex-col">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area offset by Sidebar width (w-64 = 16rem = 256px) */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <GlobalSearchModal />
    </div>
  );
}
