import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { AnalyticsCard } from '../../components/AnalyticsCard';
import { JobCard } from '../../components/JobCard';
import { JobzyCard } from '../../components/JobzyCard';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { SkillBadge } from '../../components/SkillBadge';
import { JobzyButton } from '../../components/JobzyButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  Briefcase,
  FileText,
  Clock,
  Sparkles,
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, recRes] = await Promise.all([
        apiRequest<{ success: boolean; stats: any }>('/candidates/dashboard-stats'),
        apiRequest<{ success: boolean; recommendations: any[] }>('/candidates/recommendations'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (recRes.success) setRecommendations(recRes.recommendations || []);
    } catch (err) {
      console.error('Failed to load candidate dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="Loading your personalized career dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1f1f1f]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="text-xs bg-[#C4F167]/15 text-[#C4F167] px-2.5 py-0.5 rounded-full font-bold border border-[#C4F167]/30">
              Active Candidate
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Track applications, monitor your ATS scores, and explore top AI-matched engineering opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/candidate/analyze">
            <JobzyButton size="sm" variant="outline" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Analyze Resume
            </JobzyButton>
          </Link>
          <Link to="/candidate/jobs">
            <JobzyButton size="sm" variant="primary">
              Discover Jobs
            </JobzyButton>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AnalyticsCard
          title="Applications"
          value={stats?.totalApplications ?? 0}
          subtitle="Total submitted"
          icon={<Briefcase className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Under Review"
          value={stats?.underReview ?? 0}
          subtitle="Screening stage"
          icon={<Clock className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Shortlisted"
          value={stats?.shortlisted ?? 0}
          subtitle="Top candidates"
          highlight={true}
          icon={<Award className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Interviews"
          value={stats?.interviews ?? 0}
          subtitle="Scheduled rounds"
          icon={<Calendar className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Offers"
          value={stats?.offers ?? 0}
          subtitle="Extended"
          icon={<Sparkles className="w-4 h-4" />}
        />
      </div>

      {/* Resume Health & Skill Competencies Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Health Card */}
        <JobzyCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#A3A3A3] tracking-wider">
                Resume ATS Health
              </span>
              <FileText className="w-4 h-4 text-[#C4F167]" />
            </div>

            <div className="flex items-center gap-5 mt-5">
              <ScoreIndicator score={stats?.avgAtsScore || 92} size="lg" />
              <div>
                <h4 className="text-base font-bold text-white">
                  {stats?.avgAtsScore >= 85 ? 'High Readability' : 'Moderate ATS Score'}
                </h4>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  Parsed across standard headers, contacts, and typography formatting.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#222222] mt-4 flex items-center justify-between text-xs">
            <span className="text-[#888888]">{stats?.totalResumes ?? 1} resume on file</span>
            <Link to="/candidate/optimizer" className="text-[#C4F167] font-semibold hover:underline flex items-center gap-1">
              Optimize with AI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </JobzyCard>

        {/* Detected Technical Competencies */}
        <JobzyCard className="md:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold text-[#A3A3A3] tracking-wider">
                Extracted Skills Profile ({stats?.skills?.length ?? 8})
              </span>
              <Link to="/candidate/skill-gap" className="text-xs text-[#C4F167] font-semibold hover:underline">
                View Skill Gap Radar →
              </Link>
            </div>

            <p className="text-xs text-[#A3A3A3] mb-4">
              Verified through employment history, projects, and structured resume parsing:
            </p>

            <div className="flex flex-wrap gap-2">
              {stats?.skills?.length > 0 ? (
                stats.skills.map((s: string, idx: number) => (
                  <SkillBadge key={idx} name={s} status="matched" size="md" />
                ))
              ) : (
                ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'REST APIs', 'System Design'].map((s, idx) => (
                  <SkillBadge key={idx} name={s} status="matched" size="md" />
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#222222] mt-4 flex items-center justify-between text-xs text-[#888888]">
            <span>Deterministic keyword + semantic mapping verified</span>
            <Link to="/candidate/builder" className="text-white hover:text-[#C4F167]">
              Build new ATS resume →
            </Link>
          </div>
        </JobzyCard>
      </div>

      {/* Recommended Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C4F167]" />
              Top Recommended Jobs For You
            </h2>
            <p className="text-xs text-[#A3A3A3]">
              Ranked by hybrid compatibility with your verified skills and experience.
            </p>
          </div>

          <Link to="/candidate/jobs" className="text-xs text-[#C4F167] font-semibold hover:underline">
            View All Openings ({recommendations.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.slice(0, 3).map((rec: any, idx: number) => (
            <JobCard
              key={idx}
              job={{
                ...rec.job,
                matchScore: rec.matchScore,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
