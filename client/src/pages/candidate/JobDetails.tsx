import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { SkillBadge } from '../../components/SkillBadge';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any | null>(null);
  const [userMatch, setUserMatch] = useState<any | null>(null);
  const [userApp, setUserApp] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; job: any; userMatch: any; userApplication: any }>(
        `/jobs/${id}`
      );
      if (res.success) {
        setJob(res.job);
        setUserMatch(res.userMatch);
        setUserApp(res.userApplication);
      }
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setIsApplying(true);
      const res = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId: id }),
      });
      if (res.success) {
        setUserApp(res.application);
        alert('🎉 Application submitted successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="Loading job specifications..." />;
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-white">Job Opening Not Found</h3>
        <Link to="/candidate/jobs" className="text-xs text-[#C4F167] mt-2 inline-block">
          ← Return to job listings
        </Link>
      </div>
    );
  }

  const reqSkills: string[] = job.requiredSkills ? JSON.parse(job.requiredSkills) : [];
  const prefSkills: string[] = job.preferredSkills ? JSON.parse(job.preferredSkills) : [];
  const responsibilities: string[] = job.responsibilities ? JSON.parse(job.responsibilities) : [];

  return (
    <div className="space-y-8">
      <Link
        to="/candidate/jobs"
        className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Discover Jobs
      </Link>

      {/* Header Banner */}
      <div className="bg-[#111111] border border-[#242424] p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#191919] border border-[#2e2e2e] flex items-center justify-center font-black text-2xl text-[#C4F167] shrink-0">
            {job.company?.name ? job.company.name.charAt(0) : 'J'}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#C4F167] uppercase tracking-wider">
                {job.company?.name || 'Enterprise'}
              </span>
              {userApp && <ApplicationStatusBadge status={userApp.status} size="sm" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A3A3A3] pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C4F167]" />
                {job.isRemote ? 'Remote' : job.location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#C4F167]" />
                {job.salaryMin ? `$${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k` : 'Competitive'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {job.employmentType.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#222222]">
          <Link to={`/candidate/analyze?jobId=${job.id}`}>
            <JobzyButton size="md" variant="secondary" leftIcon={<Sparkles className="w-4 h-4 text-[#C4F167]" />}>
              Deep Fit Analysis
            </JobzyButton>
          </Link>

          <JobzyButton
            size="md"
            variant="primary"
            disabled={Boolean(userApp)}
            isLoading={isApplying}
            onClick={handleApply}
          >
            {userApp ? 'Applied ✓' : '1-Click Apply'}
          </JobzyButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <JobzyCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">About The Role</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </JobzyCard>

          {responsibilities.length > 0 && (
            <JobzyCard className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Key Responsibilities
              </h3>
              <ul className="space-y-2 text-xs text-[#A3A3A3]">
                {responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </JobzyCard>
          )}

          <JobzyCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Required Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {reqSkills.map((s, i) => (
                <SkillBadge key={i} name={s} status="matched" size="md" />
              ))}
            </div>

            {prefSkills.length > 0 && (
              <div className="pt-4 border-t border-[#222222]">
                <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                  Preferred / Nice-to-Have Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {prefSkills.map((s, i) => (
                    <SkillBadge key={i} name={s} status="preferred" size="md" />
                  ))}
                </div>
              </div>
            )}
          </JobzyCard>
        </div>

        {/* Right Column: Compatibility Overview & Company Info */}
        <div className="space-y-6">
          {/* Match Score widget */}
          <JobzyCard className="p-6 text-center space-y-3">
            <span className="text-xs uppercase font-bold text-[#A3A3A3] tracking-wider block">
              Your Estimated Compatibility
            </span>
            <ScoreIndicator score={userMatch?.overallScore || 94} size="lg" />
            <h4 className="font-bold text-white text-base">
              {userMatch?.overallScore >= 85 ? 'Exceptional Fit' : 'Strong Fit'}
            </h4>
            <p className="text-xs text-[#888888]">
              Your profile satisfies the core technical competencies and experience seniority.
            </p>
            <div className="pt-2">
              <Link to={`/candidate/analyze?jobId=${job.id}`}>
                <JobzyButton size="sm" variant="outline" className="w-full">
                  View Full Breakdown
                </JobzyButton>
              </Link>
            </div>
          </JobzyCard>

          {/* Company Card */}
          <JobzyCard className="p-6 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">About The Company</h4>
            <div className="space-y-2 text-[#A3A3A3]">
              <p className="font-semibold text-white">{job.company?.name || 'Tech Company'}</p>
              <p>{job.company?.description || 'Building modern enterprise cloud infrastructure.'}</p>
              <p className="pt-2 text-[11px] text-[#777777]">
                Industry: {job.company?.industry || 'Software & Technology'}
              </p>
            </div>
          </JobzyCard>
        </div>
      </div>
    </div>
  );
};
