import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Search,
  Sparkles,
  BarChart3,
  Calendar,
  Bookmark,
  Users,
  Settings,
  ShieldCheck,
  Building2,
  FileCheck2,
  SlidersHorizontal,
  Compass,
  Hammer,
} from 'lucide-react';

interface SidebarProps {
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
}

export const JobzySidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();

  const candidateLinks = [
    { label: 'Overview', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'My Resumes', path: '/candidate/resumes', icon: FileText },
    { label: 'Resume Analyzer', path: '/candidate/analyze', icon: FileCheck2 },
    { label: 'AI Optimizer', path: '/candidate/optimizer', icon: Sparkles },
    { label: 'Resume Builder', path: '/candidate/builder', icon: Hammer },
    { label: 'Find Jobs', path: '/candidate/jobs', icon: Compass },
    { label: 'Applications', path: '/candidate/applications', icon: Bookmark },
    { label: 'Skill Gap Radar', path: '/candidate/skill-gap', icon: BarChart3 },
    { label: 'Profile', path: '/candidate/profile', icon: Settings },
  ];

  const recruiterLinks = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Job Openings', path: '/recruiter/jobs', icon: BriefcaseIcon },
    { label: 'Bulk Screening', path: '/recruiter/bulk-screening', icon: FileCheck2 },
    { label: 'Candidate Ranking', path: '/recruiter/ranking', icon: Users },
    { label: 'Shortlists', path: '/recruiter/shortlists', icon: Bookmark },
    { label: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
    { label: 'Analytics', path: '/recruiter/analytics', icon: BarChart3 },
    { label: 'Company Profile', path: '/recruiter/company', icon: Building2 },
  ];

  const adminLinks = [
    { label: 'System Health', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Audit Logs', path: '/admin/logs', icon: ShieldCheck },
  ];

  const links = role === 'CANDIDATE' ? candidateLinks : role === 'RECRUITER' ? recruiterLinks : adminLinks;

  return (
    <aside className="w-64 bg-[#080808] border-r border-[#1e1e1e] flex flex-col justify-between p-4 shrink-0 hidden md:flex print:hidden">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-[#666666] uppercase tracking-wider">
          {role} Workspace
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C4F167] text-[#000000] font-bold shadow-lime-sm'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#000000]' : 'text-current'}`} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-[#111111] border border-[#222222] rounded-xl text-[11px] text-[#A3A3A3] space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-[#C4F167]"></span>
          Intelligence Engine
        </div>
        <p className="text-[10px] text-[#777777]">
          Hybrid Deterministic + AI scoring actively analyzing 80+ competency dimensions.
        </p>
      </div>
    </aside>
  );
};

function BriefcaseIcon(props: any) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
