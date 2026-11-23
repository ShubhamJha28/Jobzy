import React from 'react';
import { Link } from 'react-router-dom';
import { GradFlow } from 'gradflow';
import { useTheme } from '../../context/ThemeContext';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { Check, Sparkles } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Animated GradFlow */}
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

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#C4F167] uppercase tracking-widest">
          Transparent Investment
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Plans Designed for Both Sides of Talent
        </h1>
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

          <Link to="/register">
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

          <Link to="/register">
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

          <Link to="/register">
            <JobzyButton variant="secondary" size="md" className="w-full">
              Start Recruiter Trial
            </JobzyButton>
          </Link>
        </JobzyCard>
      </div>
    </div>
  </div>
  );
};
