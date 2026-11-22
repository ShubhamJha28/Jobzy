import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { JobzyNavbar } from '../components/JobzyNavbar';
import { JobzySidebar } from '../components/JobzySidebar';
import { useAuth } from '../context/AuthContext';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const CandidateLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <LoadingIndicator label="Authenticating candidate session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--text-primary)] transition-colors duration-250">
      <JobzyNavbar />
      <div className="flex-1 flex overflow-hidden">
        <JobzySidebar role="CANDIDATE" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
