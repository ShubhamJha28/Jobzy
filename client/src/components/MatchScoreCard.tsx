import React from 'react';
import { ScoreIndicator } from './ScoreIndicator';
import { JobzyCard } from './JobzyCard';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MatchScoreCardProps {
  overallScore: number;
  categoryScores?: {
    requiredSkills?: number;
    experience?: number;
    technicalDepth?: number;
    projects?: number;
    education?: number;
    preferredSkills?: number;
  };
  atsScore?: number;
  confidence?: number;
  className?: string;
}

export const MatchScoreCard: React.FC<MatchScoreCardProps> = ({
  overallScore,
  categoryScores,
  atsScore,
  confidence = 0.94,
  className = '',
}) => {
  const categories = [
    { label: 'Required Skills (30%)', score: categoryScores?.requiredSkills ?? 95 },
    { label: 'Experience Alignment (20%)', score: categoryScores?.experience ?? 90 },
    { label: 'Technical Depth (15%)', score: categoryScores?.technicalDepth ?? 88 },
    { label: 'Project Relevance (15%)', score: categoryScores?.projects ?? 85 },
    { label: 'Education (10%)', score: categoryScores?.education ?? 90 },
    { label: 'Preferred Skills (10%)', score: categoryScores?.preferredSkills ?? 80 },
  ];

  return (
    <JobzyCard className={`border-[#2a2a2a] ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#242424]">
        <div className="flex items-center gap-5">
          <ScoreIndicator score={overallScore} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#C4F167]">
                Job Compatibility
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-[#1a1a1a] text-[#A3A3A3] px-2 py-0.5 rounded-full border border-[#2a2a2a]">
                <ShieldCheck className="w-3 h-3 text-[#C4F167]" />
                {Math.round(confidence * 100)}% Confidence
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {overallScore >= 85 ? 'Exceptional Candidate Match' : overallScore >= 70 ? 'Strong Candidate Match' : 'Moderate Match'}
            </h3>
            <p className="text-xs text-[#A3A3A3] mt-0.5 max-w-sm">
              Weighted deterministic & AI contextual evaluation across 6 recruitment criteria.
            </p>
          </div>
        </div>

        {atsScore !== undefined && (
          <div className="flex items-center gap-4 bg-[#161616] px-5 py-3 rounded-xl border border-[#262626]">
            <ScoreIndicator score={atsScore} size="sm" />
            <div>
              <span className="text-xs text-[#A3A3A3] font-medium block">ATS Readability</span>
              <span className="text-sm font-bold text-white">
                {atsScore >= 80 ? 'Optimal' : atsScore >= 60 ? 'Standard' : 'Needs Review'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category breakdown bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#A3A3A3] font-medium">{cat.label}</span>
              <span className="font-semibold text-white">{Math.round(cat.score)}%</span>
            </div>
            <div className="h-2 w-full bg-[#1e1e1e] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C4F167] to-[#E0FE9E] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </JobzyCard>
  );
};
