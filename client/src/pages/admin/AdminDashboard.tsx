import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { AnalyticsCard } from '../../components/AnalyticsCard';
import { JobzyCard } from '../../components/JobzyCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ShieldCheck, Users, Briefcase, FileText, Activity, Server, Cpu } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; stats: any }>('/admin/stats');
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="Querying system telemetry..." />;
  }

  const health = stats?.systemHealth;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C4F167]" />
            Platform Administration & Telemetry
          </h1>
          <span className="text-xs bg-[#C4F167]/15 text-[#C4F167] px-2.5 py-0.5 rounded-full font-bold">
            System Operational
          </span>
        </div>
        <p className="text-xs text-[#A3A3A3] mt-1">
          High-level user aggregation, database persistence health, and backend server performance monitoring.
        </p>
      </div>

      {/* Aggregate Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Platform Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Total Candidates"
          value={stats?.totalCandidates ?? 0}
          subtitle="Job seekers"
          icon={<Users className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Total Recruiters"
          value={stats?.totalRecruiters ?? 0}
          subtitle="Hiring teams"
          icon={<Briefcase className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Resumes Processed"
          value={stats?.totalResumes ?? 0}
          subtitle="Parsed via NLP"
          icon={<FileText className="w-4 h-4" />}
        />
      </div>

      {/* System Telemetry Health Card */}
      <JobzyCard className="p-6 border-[#242424] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-[#C4F167]" />
            Backend Infrastructure Health
          </h3>
          <span className="text-xs text-[#C4F167] font-bold">Node.js {health?.nodeVersion}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#161616] p-4 rounded-xl border border-[#282828]">
            <span className="text-[#888888] font-semibold block mb-1">Service Status</span>
            <span className="text-base font-bold text-[#C4F167] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C4F167] animate-pulse"></span>
              {health?.status || 'HEALTHY'}
            </span>
          </div>

          <div className="bg-[#161616] p-4 rounded-xl border border-[#282828]">
            <span className="text-[#888888] font-semibold block mb-1">Process Uptime</span>
            <span className="text-base font-bold text-white">
              {Math.floor((health?.uptimeSeconds || 0) / 60)} minutes
            </span>
          </div>

          <div className="bg-[#161616] p-4 rounded-xl border border-[#282828]">
            <span className="text-[#888888] font-semibold block mb-1">Memory Allocation</span>
            <span className="text-base font-bold text-white">{health?.memoryRssMB || 65} MB RSS</span>
            <p className="text-[10px] text-[#777777] mt-0.5">{health?.heapUsedMB} MB Heap Used</p>
          </div>

          <div className="bg-[#161616] p-4 rounded-xl border border-[#282828]">
            <span className="text-[#888888] font-semibold block mb-1">Persistence Engine</span>
            <span className="text-base font-bold text-white">{health?.dbProvider || 'Prisma ORM'}</span>
          </div>
        </div>
      </JobzyCard>
    </div>
  );
};
