import React from 'react';
import { ScoreIndicator } from './ScoreIndicator';
import { SkillBadge } from './SkillBadge';
import { JobzyButton } from './JobzyButton';
import { Building2, MapPin, DollarSign, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface JobCardData {
  id: string;
  title: string;
  description: string;
  company?: {
    name: string;
    logo?: string;
  };
  location?: string;
  isRemote?: boolean;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  requiredSkills?: string[] | string;
  matchScore?: number;
  applied?: boolean;
}

interface JobCardProps {
  job: JobCardData;
  onApply?: (job: JobCardData) => void;
  onAnalyze?: (job: JobCardData) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, onAnalyze }) => {
  const skills: string[] = Array.isArray(job.requiredSkills)
    ? job.requiredSkills
    : typeof job.requiredSkills === 'string'
    ? JSON.parse(job.requiredSkills || '[]')
    : [];

  const formatSalary = () => {
    if (!job.salaryMin) return 'Competitive';
    const minK = Math.round(job.salaryMin / 1000);
    const maxK = job.salaryMax ? Math.round(job.salaryMax / 1000) : null;
    return maxK ? `$${minK}k - $${maxK}k` : `$${minK}k+`;
  };

  return (
    <div className="bg-[#111111] border border-[#242424] hover:border-[#383838] transition-all duration-200 rounded-2xl p-6 flex flex-col justify-between group">
      <div>
        {/* Top Company & Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center font-bold text-base text-[#C4F167] shrink-0">
              {job.company?.name ? job.company.name.charAt(0) : 'J'}
            </div>
            <div>
              <span className="text-xs text-[#A3A3A3] font-medium block">
                {job.company?.name || 'Enterprise Tech'}
              </span>
              <Link to={`/candidate/jobs/${job.id}`}>
                <h3 className="font-bold text-white text-base group-hover:text-[#C4F167] transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          {job.matchScore !== undefined && (
            <div className="shrink-0 flex items-center gap-1.5 bg-[#161616] px-3 py-1.5 rounded-xl border border-[#2a2a2a]">
              <Sparkles className="w-3.5 h-3.5 text-[#C4F167]" />
              <span className="text-xs font-bold text-[#C4F167]">{Math.round(job.matchScore)}% Match</span>
            </div>
          )}
        </div>

        {/* Metadata pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A3A3A3] mt-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#C4F167]" />
            {job.isRemote ? 'Remote' : job.location || 'San Francisco, CA'}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#C4F167]" />
            {formatSalary()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {job.employmentType?.replace('_', ' ') || 'Full Time'}
          </span>
        </div>

        <p className="text-xs text-[#888888] line-clamp-2 mt-3 leading-relaxed">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {skills.slice(0, 4).map((s, i) => (
            <SkillBadge key={i} name={s} status="neutral" size="sm" />
          ))}
          {skills.length > 4 && (
            <span className="text-[11px] text-[#A3A3A3] self-center">+{skills.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-[#1e1e1e]">
        {onAnalyze && (
          <JobzyButton
            size="sm"
            variant="ghost"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#C4F167]" />}
            onClick={() => onAnalyze(job)}
          >
            Check Fit
          </JobzyButton>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Link to={`/candidate/jobs/${job.id}`}>
            <JobzyButton size="sm" variant="secondary">
              Details
            </JobzyButton>
          </Link>

          {onApply && (
            <JobzyButton
              size="sm"
              variant={job.applied ? 'secondary' : 'primary'}
              disabled={job.applied}
              onClick={() => onApply(job)}
            >
              {job.applied ? 'Applied' : 'Apply'}
            </JobzyButton>
          )}
        </div>
      </div>
    </div>
  );
};
