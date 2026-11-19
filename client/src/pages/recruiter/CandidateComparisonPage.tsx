import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { SkillBadge } from '../../components/SkillBadge';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ArrowLeft, CheckCircle2, AlertTriangle, Users, Award } from 'lucide-react';

export const CandidateComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const candidateIdsParam = searchParams.get('candidateIds');

  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (jobId && candidateIdsParam) {
      loadComparison();
    }
  }, [jobId, candidateIdsParam]);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      const ids = candidateIdsParam?.split(',') || [];
      const res = await apiRequest<{ success: boolean; job: any; candidates: any[] }>(
        '/matching/compare',
        {
          method: 'POST',
          body: JSON.stringify({ jobId, candidateIds: ids }),
        }
      );

      if (res.success) {
        setComparisonData(res);
      }
    } catch (err) {
      console.error('Failed to load comparison matrix:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="Generating comparative talent matrix..." />;
  }

  if (!comparisonData || comparisonData.candidates?.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-12 h-12 text-[#666666] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Candidates Selected For Comparison</h3>
        <p className="text-xs text-[#A3A3A3] mt-1 mb-4">
          Select up to 5 candidates on the ranking leaderboard to compare qualifications side by side.
        </p>
        <Link to={`/recruiter/ranking?jobId=${jobId || ''}`}>
          <JobzyButton size="sm" variant="primary">
            Go to Leaderboard
          </JobzyButton>
        </Link>
      </div>
    );
  }

  const candidates: any[] = comparisonData.candidates;

  return (
    <div className="space-y-8">
      <Link
        to={`/recruiter/ranking?jobId=${jobId}`}
        className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Ranking Leaderboard
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Side-by-Side Candidate Comparison Matrix
          </h1>
          <span className="text-xs bg-[#C4F167]/15 text-[#C4F167] px-2.5 py-0.5 rounded-full font-bold">
            {candidates.length} Profiles Evaluated
          </span>
        </div>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Comparing candidates against: <span className="text-white font-bold">{comparisonData.job?.title}</span>
        </p>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#111111]">
              <th className="p-4 text-xs font-bold uppercase text-[#888888] w-48">
                Criteria Dimension
              </th>
              {candidates.map((c) => (
                <th key={c.id} className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#2e2e2e] mb-2"
                    />
                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                    <p className="text-[11px] text-[#A3A3A3] line-clamp-1">{c.title}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] text-xs">
            {/* Overall Score Row */}
            <tr className="bg-[#141414]">
              <td className="p-4 font-bold text-white">Overall Compatibility</td>
              {candidates.map((c) => (
                <td key={c.id} className="p-4 text-center">
                  <ScoreIndicator score={c.overallScore} size="md" />
                </td>
              ))}
            </tr>

            {/* Experience alignment */}
            <tr>
              <td className="p-4 font-semibold text-[#D1D1D1]">Documented Experience</td>
              {candidates.map((c) => (
                <td key={c.id} className="p-4 text-center">
                  <span className="font-bold text-white text-sm">{c.experienceYears} Years</span>
                  <p className="text-[10px] text-[#888888] mt-0.5">Non-overlapping</p>
                </td>
              ))}
            </tr>

            {/* Skill Match Score */}
            <tr className="bg-[#141414]/50">
              <td className="p-4 font-semibold text-[#D1D1D1]">Mandatory Skills Score</td>
              {candidates.map((c) => (
                <td key={c.id} className="p-4 text-center">
                  <span className="font-bold text-[#C4F167] text-sm">
                    {Math.round(c.categoryScores?.requiredSkills ?? 90)}%
                  </span>
                </td>
              ))}
            </tr>

            {/* Technical Skills Pills */}
            <tr>
              <td className="p-4 font-semibold text-[#D1D1D1]">Extracted Skills</td>
              {candidates.map((c) => (
                <td key={c.id} className="p-4">
                  <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                    {c.skills.slice(0, 5).map((s: string, si: number) => (
                      <SkillBadge key={si} name={s} status="matched" size="sm" />
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Project Complexity */}
            <tr className="bg-[#141414]/50">
              <td className="p-4 font-semibold text-[#D1D1D1]">Project Complexity</td>
              {candidates.map((c) => {
                const hasEnterprise = c.projects?.some((p: any) => p.complexity === 'ENTERPRISE');
                const hasHigh = c.projects?.some((p: any) => p.complexity === 'HIGH');
                const badge = hasEnterprise ? 'Enterprise' : hasHigh ? 'High' : 'Moderate';

                return (
                  <td key={c.id} className="p-4 text-center">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        hasEnterprise
                          ? 'bg-[#C4F167]/20 text-[#C4F167] border border-[#C4F167]/40'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {badge}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Missing Requirements */}
            <tr>
              <td className="p-4 font-semibold text-[#D1D1D1]">Missing Skills / Gaps</td>
              {candidates.map((c) => (
                <td key={c.id} className="p-4 text-center">
                  {c.missingRequirements?.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {c.missingRequirements.map((m: string, mi: number) => (
                        <SkillBadge key={mi} name={m} status="missing" size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#C4F167] font-semibold">Zero critical gaps ✓</span>
                  )}
                </td>
              ))}
            </tr>

            {/* ATS Readability */}
            <tr className="bg-[#141414]/50">
              <td className="p-4 font-semibold text-[#D1D1D1]">ATS Readability Score</td>
              {candidates.map((c) => (
                <td key={c.id} className="p-4 text-center">
                  <span className="font-bold text-white">{c.atsScore}%</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
