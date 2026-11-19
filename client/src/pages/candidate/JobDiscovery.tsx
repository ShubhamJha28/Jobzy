import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobCard } from '../../components/JobCard';
import { JobzyButton } from '../../components/JobzyButton';
import { Modal } from '../../components/Modal';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { Search, MapPin, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export const JobDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');

  // Apply Modal state
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [searchTerm, isRemoteOnly, selectedType]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (isRemoteOnly) params.remote = 'true';
      if (selectedType !== 'ALL') params.type = selectedType;

      const [jobsRes, recsRes, myAppsRes, resumesRes] = await Promise.all([
        apiRequest<{ success: boolean; jobs: any[] }>('/jobs', { params }),
        apiRequest<{ success: boolean; recommendations: any[] }>('/candidates/recommendations'),
        apiRequest<{ success: boolean; applications: any[] }>('/applications/my').catch(() => ({ success: true, applications: [] })),
        apiRequest<{ success: boolean; resumes: any[] }>('/resumes').catch(() => ({ success: true, resumes: [] })),
      ]);

      if (jobsRes.success) setJobs(jobsRes.jobs || []);
      if (recsRes.success) setRecommendations(recsRes.recommendations || []);
      if (myAppsRes.success && myAppsRes.applications) {
        setAppliedJobIds(new Set(myAppsRes.applications.map((a: any) => a.jobId)));
      }
      if (resumesRes.success && resumesRes.resumes?.length > 0) {
        setResumes(resumesRes.resumes);
        setSelectedResumeId(resumesRes.resumes[0].id);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenApply = (job: any) => {
    setApplyingJob(job);
    setCoverLetter(`I am very excited to apply for the ${job.title} role at ${job.company?.name || 'your company'}. My background in full-stack architecture and engineering aligns closely with your core requirements.`);
  };

  const handleConfirmApply = async () => {
    if (!applyingJob) return;
    try {
      setIsSubmitting(true);
      const res = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({
          jobId: applyingJob.id,
          resumeId: selectedResumeId || undefined,
          coverLetter,
        }),
      });

      if (res.success) {
        setAppliedJobIds((prev) => new Set([...prev, applyingJob.id]));
        setApplyingJob(null);
        alert('🎉 Application submitted successfully! You can track its stage under My Applications.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build match score mapping from recommendations
  const matchMap: Record<string, number> = {};
  recommendations.forEach((r) => {
    if (r.job?.id) matchMap[r.job.id] = r.matchScore;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#C4F167]" />
          Job Discovery & Real-Time Compatibility
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Explore curated technical openings with personalized AI match scores calculated against your verified skills.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111111] border border-[#242424] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, technology, or role..."
            className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167]"
          />
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <label className="flex items-center gap-2 text-xs text-[#A3A3A3] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isRemoteOnly}
              onChange={(e) => setIsRemoteOnly(e.target.checked)}
              className="rounded bg-[#1a1a1a] border-[#333333] text-[#C4F167] focus:ring-0"
            />
            <span>Remote Only</span>
          </label>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C4F167]"
          >
            <option value="ALL">All Employment Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="PART_TIME">Part Time</option>
          </select>
        </div>
      </div>

      {/* Job Cards Grid */}
      {isLoading ? (
        <LoadingIndicator label="Calculating job compatibility scores..." />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-[#242424] rounded-2xl">
          <Search className="w-10 h-10 text-[#666666] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Jobs Found</h3>
          <p className="text-xs text-[#A3A3A3] mt-1">Try clearing filters or searching for different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={{
                ...job,
                matchScore: matchMap[job.id] || 75,
                applied: appliedJobIds.has(job.id),
              }}
              onApply={() => handleOpenApply(job)}
              onAnalyze={() => navigate(`/candidate/analyze?jobId=${job.id}`)}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={Boolean(applyingJob)}
        onClose={() => setApplyingJob(null)}
        title={`Apply for ${applyingJob?.title}`}
        maxWidth="lg"
      >
        {applyingJob && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#161616] p-3.5 rounded-xl border border-[#282828]">
              <p className="font-bold text-white">{applyingJob.title}</p>
              <p className="text-[#A3A3A3]">{applyingJob.company?.name || 'Company'} • {applyingJob.location}</p>
            </div>

            <div>
              <label className="font-semibold text-[#A3A3A3] block mb-1">
                Select Resume To Submit:
              </label>
              {resumes.length === 0 ? (
                <p className="text-amber-400">Please upload a resume first under My Resumes.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl p-2.5 text-xs text-white"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.originalFileName} (ATS: {r.atsScore || 90}%)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="font-semibold text-[#A3A3A3] block mb-1">
                Cover Note to Hiring Team (Optional):
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C4F167]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <JobzyButton variant="secondary" size="sm" onClick={() => setApplyingJob(null)}>
                Cancel
              </JobzyButton>
              <JobzyButton
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleConfirmApply}
              >
                Submit Application
              </JobzyButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
