import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { BarChart3, TrendingUp, Users, Target, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export const RecruiterAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; analytics: any }>('/recruiters/analytics');
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="Compiling recruitment analytics..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#C4F167]" />
          Recruitment & Talent Intelligence Analytics
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Quantitative metrics across pipeline conversion, talent score distributions, and skill demand patterns.
        </p>
      </div>

      {/* Grid of 4 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <JobzyCard className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Applicant Pipeline Funnel
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.funnel || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" horizontal={false} />
                <XAxis type="number" stroke="#666666" fontSize={11} />
                <YAxis dataKey="stage" type="category" stroke="#A3A3A3" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {(analytics?.funnel || []).map((entry: any, index: number) => (
                    <Cell key={`funnel-${index}`} fill={entry.fill || '#C4F167'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </JobzyCard>

        {/* Score Distribution */}
        <JobzyCard className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Match Score Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.scoreDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis dataKey="range" stroke="#A3A3A3" fontSize={11} />
                <YAxis stroke="#666666" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(analytics?.scoreDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`bar-${index}`} fill={entry.fill || '#C4F167'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </JobzyCard>

        {/* Applications Over Time Area Chart */}
        <JobzyCard className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Monthly Applications & Interviews Velocity
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.applicationsTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4F167" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C4F167" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="month" stroke="#A3A3A3" fontSize={11} />
                <YAxis stroke="#666666" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#C4F167" fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="interviews" stroke="#E0FE9E" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </JobzyCard>

        {/* Skill Demand Frequency */}
        <JobzyCard className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Top In-Demand Technical Competencies
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.skillDemand || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis dataKey="skill" stroke="#A3A3A3" fontSize={10} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#666666" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px' }}
                />
                <Bar dataKey="demand" fill="#C4F167" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </JobzyCard>
      </div>
    </div>
  );
};
