import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CandidateLayout } from './layouts/CandidateLayout';
import { RecruiterLayout } from './layouts/RecruiterLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { PricingPage } from './pages/public/PricingPage';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { ResumeManager } from './pages/candidate/ResumeManager';
import { ResumeAnalyzer } from './pages/candidate/ResumeAnalyzer';
import { ResumeOptimizer } from './pages/candidate/ResumeOptimizer';
import { ResumeBuilder } from './pages/candidate/ResumeBuilder';
import { JobDiscovery } from './pages/candidate/JobDiscovery';
import { JobDetails } from './pages/candidate/JobDetails';
import { MyApplications } from './pages/candidate/MyApplications';
import { SkillGapAnalysis } from './pages/candidate/SkillGapAnalysis';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { JobManagement } from './pages/recruiter/JobManagement';
import { CreateJobPage } from './pages/recruiter/CreateJobPage';
import { BulkScreeningPage } from './pages/recruiter/BulkScreeningPage';
import { CandidateRankingPage } from './pages/recruiter/CandidateRankingPage';
import { CandidateComparisonPage } from './pages/recruiter/CandidateComparisonPage';
import { ShortlistsPage } from './pages/recruiter/ShortlistsPage';
import { InterviewsPage } from './pages/recruiter/InterviewsPage';
import { RecruiterAnalyticsPage } from './pages/recruiter/RecruiterAnalyticsPage';
import { CompanyProfilePage } from './pages/recruiter/CompanyProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSimulationBanner } from './components/AdminSimulationBanner';
import Demo from './components/ui/demo';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AdminSimulationBanner />
          <Routes>
            {/* Standalone Component Demo */}
            <Route path="/demo" element={<Demo />} />

            {/* Public Website */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="pricing" element={<PricingPage />} />
            </Route>

            {/* Candidate Portal */}
            <Route path="/candidate" element={<CandidateLayout />}>
              <Route index element={<Navigate to="/candidate/dashboard" replace />} />
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="resumes" element={<ResumeManager />} />
              <Route path="analyze" element={<ResumeAnalyzer />} />
              <Route path="optimizer" element={<ResumeOptimizer />} />
              <Route path="builder" element={<ResumeBuilder />} />
              <Route path="jobs" element={<JobDiscovery />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="skill-gap" element={<SkillGapAnalysis />} />
              <Route path="profile" element={<CandidateProfilePage />} />
            </Route>

            {/* Recruiter Portal */}
            <Route path="/recruiter" element={<RecruiterLayout />}>
              <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="jobs" element={<JobManagement />} />
              <Route path="jobs/create" element={<CreateJobPage />} />
              <Route path="bulk-screening" element={<BulkScreeningPage />} />
              <Route path="ranking" element={<CandidateRankingPage />} />
              <Route path="compare" element={<CandidateComparisonPage />} />
              <Route path="shortlists" element={<ShortlistsPage />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="analytics" element={<RecruiterAnalyticsPage />} />
              <Route path="company" element={<CompanyProfilePage />} />
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
