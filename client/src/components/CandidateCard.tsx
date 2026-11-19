import React from 'react';
import { ScoreIndicator } from './ScoreIndicator';
import { SkillBadge } from './SkillBadge';
import { JobzyButton } from './JobzyButton';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { Briefcase, GraduationCap, MapPin, Bookmark, Calendar } from 'lucide-react';

export interface CandidateCardData {
  id: string;
  userId?: string;
  name: string;
  title: string;
  avatar?: string;
  overallScore: number;
  skillScore?: number;
  experienceYears: number;
  location?: string;
  skills: string[];
  missingRequirements?: string[];
  applicationStatus?: string;
  isShortlisted?: boolean;
  rank?: number;
}

interface CandidateCardProps {
  candidate: CandidateCardData;
  onViewDetails?: (candidate: CandidateCardData) => void;
  onToggleShortlist?: (candidate: CandidateCardData) => void;
  onScheduleInterview?: (candidate: CandidateCardData) => void;
  onSelectForCompare?: (candidate: CandidateCardData) => void;
  isCompareSelected?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onViewDetails,
  onToggleShortlist,
  onScheduleInterview,
  onSelectForCompare,
  isCompareSelected = false,
}) => {
  return (
    <div className="bg-[#111111] border border-[#242424] hover:border-[#383838] transition-all duration-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      {/* Left info */}
      <div className="flex items-start gap-4">
        {candidate.rank && (
          <div className="w-8 h-8 rounded-lg bg-[#191919] border border-[#2a2a2a] flex items-center justify-center font-bold text-xs text-[#C4F167] shrink-0">
            #{candidate.rank}
          </div>
        )}

        <img
          src={candidate.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidate.name)}`}
          alt={candidate.name}
          className="w-12 h-12 rounded-xl object-cover border border-[#2e2e2e]"
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="font-bold text-white text-base hover:text-[#C4F167] cursor-pointer" onClick={() => onViewDetails?.(candidate)}>
              {candidate.name}
            </h4>
            {candidate.applicationStatus && (
              <ApplicationStatusBadge status={candidate.applicationStatus} size="sm" />
            )}
          </div>

          <p className="text-xs text-[#A3A3A3] font-medium">{candidate.title}</p>

          <div className="flex items-center gap-3 text-xs text-[#A3A3A3] pt-0.5">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-[#C4F167]" />
              {candidate.experienceYears} yrs exp
            </span>
            {candidate.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {candidate.location}
              </span>
            )}
          </div>

          {/* Skill pills */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {candidate.skills.slice(0, 5).map((s, idx) => (
              <SkillBadge key={idx} name={s} status="matched" size="sm" />
            ))}
            {candidate.missingRequirements && candidate.missingRequirements.length > 0 && (
              <SkillBadge name={`Missing: ${candidate.missingRequirements[0]}`} status="missing" size="sm" />
            )}
          </div>
        </div>
      </div>

      {/* Right Score & Actions */}
      <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#222222]">
        <ScoreIndicator score={candidate.overallScore} size="md" label="Compatibility" />

        <div className="flex items-center gap-2">
          {onSelectForCompare && (
            <JobzyButton
              size="sm"
              variant={isCompareSelected ? 'primary' : 'secondary'}
              onClick={() => onSelectForCompare(candidate)}
            >
              {isCompareSelected ? 'Selected' : 'Compare'}
            </JobzyButton>
          )}

          {onToggleShortlist && (
            <button
              onClick={() => onToggleShortlist(candidate)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                candidate.isShortlisted
                  ? 'bg-[#C4F167]/15 border-[#C4F167] text-[#C4F167]'
                  : 'bg-[#191919] border-[#2a2a2a] text-[#A3A3A3] hover:text-white'
              }`}
              title="Toggle Shortlist"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}

          {onScheduleInterview && (
            <JobzyButton
              size="sm"
              variant="outline"
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
              onClick={() => onScheduleInterview(candidate)}
            >
              Interview
            </JobzyButton>
          )}

          {onViewDetails && (
            <JobzyButton size="sm" variant="secondary" onClick={() => onViewDetails(candidate)}>
              View Match
            </JobzyButton>
          )}
        </div>
      </div>
    </div>
  );
};
