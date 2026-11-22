import React from 'react';
import { Link } from 'react-router-dom';
import { JobzyButton } from '../../components/JobzyButton';
import { JobzyCard } from '../../components/JobzyCard';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { SkillBadge } from '../../components/SkillBadge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Users,
  BarChart3,
  Search,
  Zap,
  Target,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24">
      {/* 1. CINEMATIC MOTIONSITE HERO WITH VIDEO BACKGROUND */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-8 pt-10 pb-8 overflow-hidden">
        {/* Background Video (100% opacity, seamless cover) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4"
          />
          {/* Subtle bottom gradient to blend smoothly into page content */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#000000] pointer-events-none" />
        </div>

        {/* Top spacer to align bottom-centered */}
        <div className="flex-1 min-h-[30px]" />

        {/* Main Hero Copy */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-[#7d7d7d] via-[#2a2a2a] to-[#0a0a0a] border-0 text-[12.5px] text-[#f2f2f2] tracking-tight mb-5 shadow-lg">
            <svg
              className="w-4 h-4 text-[#C4F167] drop-shadow-[0_0_6px_rgba(196,241,103,0.7)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
            </svg>
            <span className="font-normal">Operational AI Infrastructure</span>
          </div>

          {/* H1 Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-medium tracking-[-0.045em] leading-[1.12] text-white flex flex-col items-center">
            <span className="block overflow-hidden py-1">
              Train <em className="font-instrument italic font-normal text-[#C4F167] drop-shadow-[0_0_25px_rgba(196,241,103,0.4)]">AI agents</em> on your
            </span>
            <span className="block overflow-hidden py-1">
              workflows in minutes.
            </span>
          </h1>

          {/* Lede */}
          <p className="max-w-[490px] mx-auto mt-4 text-[15.5px] text-[#9a9a9a] leading-[1.55] tracking-[-0.015em] font-normal">
            Deploy adaptive AI agents that learn, execute, and scale operational tasks across your business.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <Link
              to="/register"
              className="btn-liquid btn-liquid-solid h-[44px] px-6 text-sm font-semibold text-black rounded-md"
            >
              Start for Free
            </Link>
            <a
              href="#dashboard-preview"
              className="btn-liquid btn-liquid-ghost h-[44px] px-6 text-sm font-medium text-white rounded-md"
            >
              See it in action
            </a>
          </div>
        </div>

        {/* Stats Footer at bottom of Hero */}
        <div className="relative z-10 w-full max-w-6xl mx-auto mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[13.5px] text-[#d8d8d8] tracking-[-0.015em]">
          {/* Stat 1 */}
          <div className="inline-flex items-center gap-3.5">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="hero-stat-pill-l" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C4F167" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#3a3a3a" stopOpacity="0.62" />
                </linearGradient>
                <linearGradient id="hero-stat-pill-r" x1="13" y1="2" x2="24" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3a3a3a" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#C4F167" stopOpacity="0.75" />
                </linearGradient>
              </defs>
              <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#hero-stat-pill-l)" />
              <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#hero-stat-pill-r)" />
              <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#C4F167" />
            </svg>
            <span>4.2M+ workflows automated</span>
          </div>

          {/* Stat 2 */}
          <div className="inline-flex items-center gap-3.5">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#C4F167" />
              <path d="M12 7.1v7.4" stroke="#111" strokeWidth="1.85" strokeLinecap="round" />
              <path d="M8.15 12.35L12 16.2l3.85-3.85" stroke="#111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>92% reduction in manual operations</span>
          </div>

          {/* Stat 3 */}
          <div className="inline-flex items-center gap-3.5">
            <svg className="w-10 h-5 flex-shrink-0" viewBox="0 0 40 22" fill="none">
              <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
              <polygon points="7,5 8.5,8 6,8" fill="#1a1a1a" />
              <polygon points="13.5,5 12,8 14.5,8" fill="#1a1a1a" />
              <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
              <circle cx="8.9" cy="11.5" r="0.7" fill="#1a1a1a" />
              <circle cx="11.5" cy="11.5" r="0.7" fill="#1a1a1a" />

              <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
              <circle cx="17.8" cy="9.8" r="1.7" fill="#111111" />
              <circle cx="22.6" cy="9.8" r="1.7" fill="#111111" />
              <ellipse cx="20.2" cy="12.2" rx="1.2" ry="0.8" fill="#111111" />
              <path d="M18.2 13.8c.8 1.1 3.2 1.1 4 0" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" />

              <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
              <text x="30.2" y="15.1" fill="#ffffff" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="12.5" textAnchor="middle">e</text>
            </svg>
            <span>180+ operational teams onboarded</span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE DASHBOARD PREVIEW */}
      <section id="dashboard-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#C4F167]/30 to-[#E0FE9E]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>

          <div className="relative bg-[#0d0d0d] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-6 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#333333]"></div>
                <div className="w-3 h-3 rounded-full bg-[#222222]"></div>
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a]"></div>
                <span className="text-xs font-mono text-[#666666] ml-2">jobzy-talent-intelligence-v2.6.sh</span>
              </div>
              <span className="text-xs font-semibold text-[#C4F167] bg-[#C4F167]/10 px-2.5 py-0.5 rounded-full border border-[#C4F167]/20">
                LIVE PLATFORM PREVIEW
              </span>
            </div>

            {/* Dashboard Content Mock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Card 1: Resume Compatibility */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#A3A3A3] font-medium">Job Compatibility</span>
                    <span className="text-[11px] bg-[#C4F167]/15 text-[#C4F167] px-2 py-0.5 rounded-full font-bold">
                      Top 2%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <ScoreIndicator score={94} size="md" />
                    <div>
                      <p className="text-sm font-bold text-white">Alex Rivera</p>
                      <p className="text-xs text-[#888888]">Sr. Full Stack Engineer</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#A3A3A3] mt-4 pt-3 border-t border-[#222222]">
                  Exceeds required seniority: 5.5 yrs vs 4.0 yrs required.
                </p>
              </div>

              {/* Card 2: ATS Readability */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#A3A3A3] font-medium">ATS Readability</span>
                    <CheckCircle2 className="w-4 h-4 text-[#C4F167]" />
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <ScoreIndicator score={92} size="md" />
                    <div>
                      <p className="text-sm font-bold text-white">Parser Score</p>
                      <p className="text-xs text-[#C4F167]">Optimal Typography</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#A3A3A3] mt-4 pt-3 border-t border-[#222222]">
                  Zero table errors. Contact & employment headers parsed cleanly.
                </p>
              </div>

              {/* Card 3: Skills Breakdown */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
                <span className="text-xs text-[#A3A3A3] font-medium block mb-3">Extracted Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  <SkillBadge name="React.js" status="matched" size="sm" />
                  <SkillBadge name="TypeScript" status="matched" size="sm" />
                  <SkillBadge name="Node.js" status="matched" size="sm" />
                  <SkillBadge name="PostgreSQL" status="matched" size="sm" />
                  <SkillBadge name="AWS Cloud" status="matched" size="sm" />
                  <SkillBadge name="Redis (Gap)" status="missing" size="sm" />
                </div>
                <p className="text-[11px] text-[#888888] mt-4">
                  1 missing preferred skill identified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#C4F167] uppercase tracking-widest">
            Architecture & Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
            How JOBZY Operates Under the Hood
          </h2>
          <p className="text-sm text-[#A3A3A3] mt-3">
            A unified two-sided intelligence engine that bridges applicants and hiring teams without black-box rejections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#111111] border border-[#242424] rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-[#C4F167] text-black flex items-center justify-center font-black text-base mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Format Document Parsing</h3>
            <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
              Upload PDF or DOCX resumes. Our tokenizer extracts structured personal contacts, employment timelines, projects, and education while auditing ATS formatting hazards.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#242424] rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-[#C4F167] text-black flex items-center justify-center font-black text-base mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Hybrid Compatibility Scoring</h3>
            <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
              Evaluates mandatory skills (30%), non-overlapping experience (20%), technical depth (15%), and project architecture (15%) with transparent, explainable evidence.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#242424] rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-[#C4F167] text-black flex items-center justify-center font-black text-base mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-white">End-to-End Pipeline Action</h3>
            <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
              Recruiters rank hundreds of applicants in seconds and schedule technical interviews. Candidates optimize bullet points and track pipeline progression in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CANDIDATE & RECRUITER VALUE PROPOSITION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Candidate feature box */}
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#C4F167]/15 border border-[#C4F167]/30 flex items-center justify-center text-[#C4F167]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">For Ambitious Candidates</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Stop guessing why your applications disappear into ATS black holes. Get clear, quantified compatibility scores, pinpoint skill gaps, and optimize your bullet points with AI.
            </p>

            <ul className="space-y-3 text-xs text-[#D1D1D1]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                <span>Deterministic ATS readability & formatting compliance auditor</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                <span>AI bullet rewriter that emphasizes quantifiable scale & achievements</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                <span>Targeted learning roadmap for bridging missing technical requirements</span>
              </li>
            </ul>

            <Link to="/candidate/dashboard" className="inline-block pt-2">
              <JobzyButton variant="primary" size="md">
                Launch Candidate Portal
              </JobzyButton>
            </Link>
          </div>

          {/* Recruiter feature box */}
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#C4F167]/15 border border-[#C4F167]/30 flex items-center justify-center text-[#C4F167]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">For Modern Recruiters</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Cut manual screening time by 80%. Batch upload up to 50 resumes per opening, automatically rank applicants with explainable evidence, and compare top contenders side-by-side.
            </p>

            <ul className="space-y-3 text-xs text-[#D1D1D1]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                <span>Asynchronous background queue for screening dozens of resumes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                <span>Configurable weighted scoring & automated shortlist criteria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                <span>Integrated interview scheduling and recruitment funnel analytics</span>
              </li>
            </ul>

            <Link to="/recruiter/dashboard" className="inline-block pt-2">
              <JobzyButton variant="primary" size="md">
                Launch Recruiter Portal
              </JobzyButton>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#111111] via-[#161616] to-[#111111] border border-[#2a2a2a] rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Upgrade Your Recruitment Intelligence?
            </h2>
            <p className="text-sm sm:text-base text-[#A3A3A3]">
              Join thousands of candidates and engineering teams matching on genuine qualifications, not keyword stuffing.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <JobzyButton size="lg" variant="primary">
                  Create Free Account
                </JobzyButton>
              </Link>
              <Link to="/login">
                <JobzyButton size="lg" variant="secondary">
                  Sign In to Account
                </JobzyButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
