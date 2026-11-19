import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { ResumeUploadZone } from '../../components/ResumeUploadZone';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  FileCheck2,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
} from 'lucide-react';

export const BulkScreeningPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId || '');
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Background batch state
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const res = await apiRequest<{ success: boolean; jobs: any[] }>('/jobs');
      if (res.success && res.jobs?.length > 0) {
        setJobs(res.jobs);
        if (!selectedJobId) setSelectedJobId(res.jobs[0].id);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Poll batch status while processing
  useEffect(() => {
    let interval: any = null;
    if (activeBatchId && batchStatus?.status !== 'COMPLETED' && batchStatus?.status !== 'FAILED') {
      interval = setInterval(async () => {
        try {
          const res = await apiRequest<{ success: boolean; batch: any }>(
            `/resumes/batch/${activeBatchId}`
          );
          if (res.success && res.batch) {
            setBatchStatus(res.batch);
            if (res.batch.status === 'COMPLETED' || res.batch.status === 'FAILED') {
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.warn('Batch poll error:', e);
        }
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBatchId, batchStatus?.status]);

  const handleMultipleUpload = async (files: File[]) => {
    if (!selectedJobId) {
      alert('Please select a target job opening first.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('jobId', selectedJobId);
      files.forEach((file) => {
        formData.append('resumes', file);
      });

      const res = await apiRequest<{ success: boolean; batchJobId: string; totalFiles: number }>(
        '/resumes/bulk-upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (res.success && res.batchJobId) {
        setActiveBatchId(res.batchJobId);
        setBatchStatus({
          id: res.batchJobId,
          total: res.totalFiles,
          processed: 0,
          failed: 0,
          status: 'QUEUED',
          results: [],
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate bulk screening.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = batchStatus
    ? Math.round((batchStatus.processed / (batchStatus.total || 1)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <FileCheck2 className="w-6 h-6 text-[#C4F167]" />
          Bulk Resume Screening & AI Batch Ranking
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Upload dozens of resumes at once. Our asynchronous background worker extracts candidate details, matches against job requirements, and generates candidate rankings in parallel.
        </p>
      </div>

      {/* Target Job Selector */}
      <JobzyCard className="p-6">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] block mb-2">
          Select Target Job Opening For Screening:
        </label>
        {jobs.length === 0 ? (
          <p className="text-xs text-amber-400">Please create a job opening first.</p>
        ) : (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C4F167]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.location}) — Min {j.minimumExperience} yrs exp
              </option>
            ))}
          </select>
        )}
      </JobzyCard>

      {/* Multi-upload Dropzone */}
      <JobzyCard className="p-6 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#C4F167]" />
          Drop Multiple Candidate Resumes (PDF, DOCX)
        </h3>

        <ResumeUploadZone
          multiple={true}
          onMultipleUpload={handleMultipleUpload}
          isLoading={isSubmitting}
          acceptText="Drop up to 50 resumes. Our worker processes each in the background."
        />
      </JobzyCard>

      {/* Asynchronous Processing Progress Dashboard */}
      {batchStatus && (
        <JobzyCard className="p-6 border-[#C4F167]/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#C4F167] tracking-wider">
                  Batch Status: {batchStatus.status}
                </span>
                <span className="text-[11px] text-[#A3A3A3] bg-[#1a1a1a] px-2 py-0.5 rounded-full border border-[#2a2a2a]">
                  ID: {batchStatus.id}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                Processed {batchStatus.processed} of {batchStatus.total} Resumes
              </h3>
            </div>

            {batchStatus.status === 'COMPLETED' && (
              <Link to={`/recruiter/ranking?jobId=${selectedJobId}`}>
                <JobzyButton size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Full Candidate Ranking
                </JobzyButton>
              </Link>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#A3A3A3] font-medium">Asynchronous Pipeline Progress</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="h-3 w-full bg-[#181818] rounded-full overflow-hidden p-0.5 border border-[#262626]">
              <div
                className="h-full bg-gradient-to-r from-[#C4F167] to-[#E0FE9E] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Live Stream of Candidates */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Screened Candidates Stream ({batchStatus.results?.length ?? 0})
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {batchStatus.results?.map((res: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#141414] border border-[#242424] p-3 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                    <div>
                      <p className="font-bold text-white">{res.candidateName || res.fileName}</p>
                      <p className="text-[11px] text-[#888888]">{res.fileName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-1 max-w-xs justify-end hidden sm:flex">
                      {res.skills?.slice(0, 3).map((s: string, si: number) => (
                        <span key={si} className="text-[10px] bg-[#1e1e1e] text-[#D1D1D1] px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#C4F167] bg-[#C4F167]/10 px-2.5 py-1 rounded-lg">
                      {Math.round(res.score)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </JobzyCard>
      )}
    </div>
  );
};
