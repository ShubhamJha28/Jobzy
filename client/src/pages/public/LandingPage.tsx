import React from 'react';
import { Link } from 'react-router-dom';
import { JobzyButton } from '../../components/JobzyButton';
import { JobzyCard } from '../../components/JobzyCard';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { SkillBadge } from '../../components/SkillBadge';
import { AntiMetalButton } from '../../components/ui/anti-metal-button';
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
    <div className="space-y-24 py-10">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-xs font-semibold text-[#C4F167] mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Talent Intelligence 2.0</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
          Your Next Opportunity Starts With a{' '}
          <span className="text-[#C4F167] underline decoration-[#C4F167]/30 decoration-wavy">
            Better Match.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#A3A3A3] max-w-2xl mx-auto mt-6 leading-relaxed font-normal">
          Analyze your resume, uncover hidden skill gaps, match with precision opportunities, and make smarter career moves with explainable AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link to="/candidate/analyze">
            <AntiMetalButton
              label="Analyze My Resume"
              className="h-12 w-60 text-sm font-semibold shadow-lime-glow"
              accentFrom="#C4F167"
              accentTo="#A8DE3B"
              dotColor="#000000"
            />
          </Link>
          <Link to="/candidate/jobs">
            <JobzyButton size="lg" variant="secondary" className="h-12">
              Explore JOBZY Platform
            </JobzyButton>
          </Link>
        </div>

        {/* 2. INTERACTIVE DASHBOARD PREVIEW */}
        <div className="mt-16 max-w-5xl mx-auto relative group">
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
