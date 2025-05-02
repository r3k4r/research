'use client';

import { useState } from 'react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import ProviderHeader from '@/components/provider/ProviderHeader';
import { NotificationProvider } from '@/components/NotificationContext';

export default function ProviderDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="min-h-screen flex">
        <ProviderSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <ProviderHeader setIsSidebarOpen={setIsSidebarOpen} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
