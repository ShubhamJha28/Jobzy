import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { JobzyNavbar } from '../components/JobzyNavbar';
import { JobzyFooter } from '../components/JobzyFooter';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--text-primary)] transition-colors duration-250">
      <JobzyNavbar />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Interactive Halftone Dotted Footer - Anchored flush to the bottom */}
      {!isAuthPage && <JobzyFooter />}
    </div>
  );
};
