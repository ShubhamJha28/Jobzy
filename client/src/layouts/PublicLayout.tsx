import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { JobzyNavbar } from '../components/JobzyNavbar';
import { JobzyLogo } from '../components/JobzyLogo';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--text-primary)] transition-colors duration-250">
      <JobzyNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] bg-[#080808] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-250">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <JobzyLogo size="md" withTagline={true} />
            <p className="text-xs text-[#888888] leading-relaxed">
              Complete AI-Powered Talent Intelligence & Recruitment Platform. Connecting candidates and recruiters through explainable matching.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">For Candidates</h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li><Link to="/candidate/analyze" className="hover:text-[#C4F167]">Resume Analyzer</Link></li>
              <li><Link to="/candidate/optimizer" className="hover:text-[#C4F167]">AI Resume Optimizer</Link></li>
              <li><Link to="/candidate/builder" className="hover:text-[#C4F167]">ATS Resume Builder</Link></li>
              <li><Link to="/candidate/jobs" className="hover:text-[#C4F167]">Job Recommendations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">For Recruiters</h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li><Link to="/recruiter/bulk-screening" className="hover:text-[#C4F167]">Bulk Resume Screening</Link></li>
              <li><Link to="/recruiter/ranking" className="hover:text-[#C4F167]">AI Candidate Ranking</Link></li>
              <li><Link to="/recruiter/interviews" className="hover:text-[#C4F167]">Interview Management</Link></li>
              <li><Link to="/recruiter/analytics" className="hover:text-[#C4F167]">Recruitment Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Enterprise Access</h4>
            <p className="text-xs text-[#A3A3A3] mb-2">Next-generation hiring intelligence:</p>
            <div className="space-y-2 text-xs text-[#888888]">
              <p><span className="text-[#C4F167] font-semibold">Candidates:</span> ATS audits & resume optimization</p>
              <p><span className="text-[#C4F167] font-semibold">Recruiters:</span> Batch screening & explainable ranking</p>
              <div className="pt-1.5 flex flex-col gap-1">
                <Link to="/register" className="text-white hover:text-[#C4F167] transition-colors font-semibold">
                  Create Free Account →
                </Link>
                <Link to="/login" className="text-[#A3A3A3] hover:text-white transition-colors">
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666]">
          <p>© {new Date().getFullYear()} JOBZY Talent Intelligence Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security & Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
