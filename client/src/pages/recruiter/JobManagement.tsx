import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { SkillBadge } from '../../components/SkillBadge';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  Briefcase,
  Users,
  FileCheck2,
  Plus,
  MapPin,
  Clock,
  MoreVertical,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const JobManagement: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; jobs: any[] }>('/jobs');
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (job: any) => {
    const nextStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await apiRequest(`/jobs/${job.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update job status.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1f1f1f]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Job Openings Management</h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Create, publish, screen applicants, and manage weighted matching criteria for your requisitions.
          </p>
        </div>

        <Link to="/recruiter/jobs/create">
          <JobzyButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create Job Opening
          </JobzyButton>
        </Link>
      </div>

      {isLoading ? (
        <LoadingIndicator label="Loading company job requisitions..." />
      ) : jobs.length === 0 ? (
        <JobzyCard className="text-center py-16">
          <Briefcase className="w-12 h-12 text-[#666666] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Jobs Created Yet</h3>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1 mb-4">
            Publish your first technical job opening or use our AI Job Description parser to generate requirements.
          </p>
          <Link to="/recruiter/jobs/create">
            <JobzyButton size="sm" variant="primary">
              Create Opening
            </JobzyButton>
          </Link>
        </JobzyCard>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const reqSkills: string[] = job.requiredSkills
              ? JSON.parse(job.requiredSkills)
              : [];

            return (
              <JobzyCard key={job.id} className="p-6 border-[#242424] space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-white text-base hover:text-[#C4F167] cursor-pointer">
                        {job.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === 'PUBLISHED'
                            ? 'bg-[#C4F167]/20 text-[#C4F167] border border-[#C4F167]/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#A3A3A3] mt-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C4F167]" />
                        {job.isRemote ? 'Remote' : job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {job.employmentType.replace('_', ' ')}
                      </span>
                      <span>• Min Exp: {job.minimumExperience} yrs</span>
                    </div>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#222222]">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <span className="text-base font-bold text-white block">
                          {job._count?.applications ?? 0}
                        </span>
                        <span className="text-[11px] text-[#888888]">Applicants</span>
                      </div>
                      <div className="text-center">
                        <span className="text-base font-bold text-[#C4F167] block">
                          {job._count?.matches ?? 0}
                        </span>
                        <span className="text-[11px] text-[#888888]">AI Matches</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/recruiter/ranking?jobId=${job.id}`}>
                        <JobzyButton size="sm" variant="primary" leftIcon={<Users className="w-3.5 h-3.5" />}>
                          Ranked Applicants
                        </JobzyButton>
                      </Link>

                      <Link to={`/recruiter/bulk-screening?jobId=${job.id}`}>
                        <JobzyButton size="sm" variant="secondary" leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}>
                          Screen Resumes
                        </JobzyButton>
                      </Link>

                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="px-2.5 py-1.5 rounded-xl border border-[#2a2a2a] text-xs text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
                      >
                        {job.status === 'PUBLISHED' ? 'Close' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1e1e1e]">
                  <span className="text-[11px] text-[#888888] self-center mr-1">Skills:</span>
                  {reqSkills.slice(0, 6).map((s, idx) => (
                    <SkillBadge key={idx} name={s} status="neutral" size="sm" />
                  ))}
                  {reqSkills.length > 6 && (
                    <span className="text-[11px] text-[#777777] self-center">
                      +{reqSkills.length - 6} more
                    </span>
                  )}
                </div>
              </JobzyCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
