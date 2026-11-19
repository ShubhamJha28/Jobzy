import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { AnalyticsCard } from '../../components/AnalyticsCard';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  Briefcase,
  Users,
  FileCheck2,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Layers,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

export const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        apiRequest<{ success: boolean; stats: any }>('/recruiters/dashboard-stats'),
        apiRequest<{ success: boolean; analytics: any }>('/recruiters/analytics'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="Aggregating recruitment intelligence..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1f1f1f]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Recruiter Operations Hub</h1>
            <span className="text-xs bg-[#C4F167]/15 text-[#C4F167] px-2.5 py-0.5 rounded-full font-bold border border-[#C4F167]/30">
              {stats?.company?.name || 'TechVanguard Innovations'}
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Real-time pipeline overview, candidate ranking, batch screening, and interview orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/recruiter/bulk-screening">
            <JobzyButton size="sm" variant="outline" leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}>
              Bulk Screen
            </JobzyButton>
          </Link>
          <Link to="/recruiter/jobs/create">
            <JobzyButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Create Job
            </JobzyButton>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <AnalyticsCard
          title="Active Openings"
          value={stats?.activeJobs ?? 0}
          subtitle="Published jobs"
          icon={<Briefcase className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Total Applicants"
          value={stats?.totalApplications ?? 0}
          subtitle="In pipeline"
          icon={<Users className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Resumes Screened"
          value={stats?.resumesProcessed ?? 0}
          subtitle="Processed via AI"
          icon={<FileCheck2 className="w-4 h-4" />}
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
          subtitle="Scheduled"
          icon={<Calendar className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Pending Review"
          value={stats?.pendingReview ?? 0}
          subtitle="Awaiting action"
          icon={<Sparkles className="w-4 h-4" />}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel Chart */}
        <JobzyCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recruitment Conversion Funnel
            </h3>
            <span className="text-xs text-[#A3A3A3]">End-to-End Pipeline</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.funnel || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" horizontal={false} />
                <XAxis type="number" stroke="#666666" fontSize={11} />
                <YAxis dataKey="stage" type="category" stroke="#A3A3A3" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px' }}
                  labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {(analytics?.funnel || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#C4F167'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </JobzyCard>

        {/* Match Score Distribution */}
        <JobzyCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Applicant Compatibility Distribution
            </h3>
            <span className="text-xs text-[#C4F167] font-semibold">Weighted Scoring</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.scoreDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis dataKey="range" stroke="#A3A3A3" fontSize={11} />
                <YAxis stroke="#666666" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px' }}
                  labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(analytics?.scoreDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-score-${index}`} fill={entry.fill || '#C4F167'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </JobzyCard>
      </div>

      {/* Recent Applicants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Pipeline Applicants</h2>
          <Link to="/recruiter/ranking" className="text-xs text-[#C4F167] font-semibold hover:underline">
            View All Ranked Candidates →
          </Link>
        </div>

        <JobzyCard className="p-0 overflow-hidden border-[#242424]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#D1D1D1]">
              <thead className="bg-[#161616] border-b border-[#242424] text-[11px] uppercase tracking-wider text-[#888888]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Opening</th>
                  <th className="py-3 px-4">ATS Score</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {stats?.recentApplicants?.map((applicant: any) => (
                  <tr key={applicant.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                      <img
                        src={applicant.candidateAvatar}
                        alt={applicant.candidateName}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <span>{applicant.candidateName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#A3A3A3]">{applicant.jobTitle}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#C4F167] bg-[#C4F167]/10 px-2 py-0.5 rounded-md">
                        {applicant.atsScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <ApplicationStatusBadge status={applicant.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-[#777777]">
                      {new Date(applicant.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/recruiter/ranking?jobId=${applicant.jobId}`}>
                        <JobzyButton size="sm" variant="secondary">
                          View Match
                        </JobzyButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </JobzyCard>
      </div>
    </div>
  );
};
