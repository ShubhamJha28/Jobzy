import React from 'react';
import { Link } from 'react-router-dom';
import { GradFlow } from 'gradflow';
import { useTheme } from '../../context/ThemeContext';
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
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative space-y-24 pt-10 pb-24 z-10">
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <GradFlow
          className="w-full h-full"
          config={
            isDark
              ? {
                  type: 'fold',
                  color1: '#000000',
                  color2: '#000000',
                  color3: '#e0fe9e',
                  speed: 0.5,
                  scale: 1,
                  noise: 0.12,
                }
              : {
                  type: 'fold',
                  color1: '#f8fafc',
                  color2: '#f1f5f9',
                  color3: '#84cc16',
                  speed: 0.5,
                  scale: 1,
                  noise: 0.12,
                }
          }
          interactive
        />
      </div>
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
          <Link
            to="/#explore-jobs"
            onClick={() => {
              const el = document.getElementById('explore-jobs');
              if (el) {
                const navbarOffset = 96;
                const rect = el.getBoundingClientRect();
                const targetY = window.scrollY + rect.top - navbarOffset;
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
              }
            }}
          >
            <AntiMetalButton
              label="Explore JOBZY Platform"
              className="h-12 w-64 text-sm font-semibold border border-[#2a2a2a]"
              accentFrom="#262626"
              accentTo="#161616"
              dotColor="#C4F167"
            />
          </Link>
        </div>

        {/* 2. INTERACTIVE DASHBOARD PREVIEW */}
        <div id="features" className="mt-16 max-w-5xl mx-auto relative group scroll-mt-24 sm:scroll-mt-28">
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
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28">
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

      {/* 4. TRANSPARENT INVESTMENT PRICING PLANS */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-[#C4F167] uppercase tracking-widest">
            Transparent Investment
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Plans Designed for Both Sides of Talent
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Whether you're an ambitious engineer optimizing your career or a high-growth recruitment team screening hundreds of candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Candidate Free */}
          <JobzyCard className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase text-[#A3A3A3] tracking-wider">Candidate Basic</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-[#888888]">/forever</span>
              </div>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Essential resume parsing, ATS check, and precision job matching for individuals.
              </p>

              <ul className="space-y-2.5 text-xs text-[#D1D1D1] pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> 3 Resume uploads</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Instant ATS readability score</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> 10 Job compatibility analyses</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Application tracking stages</li>
              </ul>
            </div>

            <Link to="/register?role=candidate">
              <JobzyButton variant="secondary" size="md" className="w-full">
                Get Started Free
              </JobzyButton>
            </Link>
          </JobzyCard>

          {/* Candidate Pro */}
          <JobzyCard className="p-8 space-y-6 flex flex-col justify-between border-[#C4F167] relative shadow-lime-glow">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-[#C4F167] tracking-wider">Candidate Pro</span>
                <span className="text-[10px] bg-[#C4F167] text-black font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Most Popular
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$19</span>
                <span className="text-xs text-[#888888]">/month</span>
              </div>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Unlimited AI resume optimization, bullet rewrites, and skill bridge roadmaps.
              </p>

              <ul className="space-y-2.5 text-xs text-[#D1D1D1] pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Unlimited AI bullet rewriters</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Executive summary generator</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Full Skill Gap Radar & Roadmap</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Interactive ATS Resume Builder</li>
              </ul>
            </div>

            <Link to="/register?role=candidate">
              <JobzyButton variant="primary" size="md" className="w-full">
                Upgrade to Pro
              </JobzyButton>
            </Link>
          </JobzyCard>

          {/* Recruiter Scale */}
          <JobzyCard className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase text-[#A3A3A3] tracking-wider">Recruiter Enterprise</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$149</span>
                <span className="text-xs text-[#888888]">/month</span>
              </div>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Batch resume screening, AI candidate ranking, and interview coordination for hiring teams.
              </p>

              <ul className="space-y-2.5 text-xs text-[#D1D1D1] pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Bulk screen up to 500 resumes/batch</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> AI Candidate Ranking Leaderboard</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Side-by-side Candidate Comparison</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Integrated Video Interview Scheduler</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C4F167]" /> Recruitment conversion analytics</li>
              </ul>
            </div>

            <Link to="/register?role=recruiter">
              <JobzyButton variant="secondary" size="md" className="w-full">
                Contact Enterprise Sales
              </JobzyButton>
            </Link>
          </JobzyCard>
        </div>
      </section>

      {/* 5. CANDIDATE & RECRUITER VALUE PROPOSITION */}
      <section id="explore-jobs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28 relative">
        <div id="jobs" className="sr-only" aria-hidden="true" />
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
