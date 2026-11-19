import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { CandidateCard, CandidateCardData } from '../../components/CandidateCard';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { Modal } from '../../components/Modal';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { SkillBadge } from '../../components/SkillBadge';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Target,
} from 'lucide-react';

export const CandidateRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || '');
  const [candidates, setCandidates] = useState<CandidateCardData[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  // Filter & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState('overall');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [viewingCandidate, setViewingCandidate] = useState<any | null>(null);

  // Interview scheduling modal state
  const [schedulingCandidate, setSchedulingCandidate] = useState<any | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [meetingLink, setMeetingLink] = useState('https://meet.jobzy.ai/room/' + Math.random().toString(36).substring(2, 8));
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadRankings();
    }
  }, [selectedJobId, minScore, sortBy, searchTerm, statusFilter]);

  const loadJobs = async () => {
    try {
      const res = await apiRequest<{ success: boolean; jobs: any[] }>('/jobs');
      if (res.success && res.jobs?.length > 0) {
        setJobs(res.jobs);
        if (!selectedJobId) setSelectedJobId(res.jobs[0].id);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const loadRankings = async () => {
    if (!selectedJobId) return;
    try {
      setIsLoading(true);
      const params: any = { sortBy };
      if (minScore > 0) params.minScore = minScore;
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await apiRequest<{ success: boolean; candidates: CandidateCardData[] }>(
        `/matching/${selectedJobId}/candidates`,
        { params }
      );

      if (res.success) {
        setCandidates(res.candidates || []);
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleShortlist = async (candidate: CandidateCardData) => {
    try {
      const res = await apiRequest<{ success: boolean; isShortlisted: boolean }>(
        '/shortlists/toggle',
        {
          method: 'POST',
          body: JSON.stringify({
            jobId: selectedJobId,
            candidateId: candidate.id,
          }),
        }
      );

      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id ? { ...c, isShortlisted: res.isShortlisted } : c
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle shortlist.');
    }
  };

  const handleToggleCompare = (candidate: CandidateCardData) => {
    const updated = new Set(selectedForCompare);
    if (updated.has(candidate.id)) {
      updated.delete(candidate.id);
    } else {
      if (updated.size >= 5) {
        alert('You can compare up to 5 candidates at once.');
        return;
      }
      updated.add(candidate.id);
    }
    setSelectedForCompare(updated);
  };

  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingCandidate || !interviewDate) return;

    try {
      setIsScheduling(true);
      const res = await apiRequest('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: schedulingCandidate.applicationId,
          scheduledAt: interviewDate,
          interviewType,
          meetingLink,
        }),
      });

      if (res.success) {
        alert('🎉 Interview scheduled and candidate notified!');
        setSchedulingCandidate(null);
        loadRankings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to schedule interview.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1f1f1f]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C4F167]" />
            AI Candidate Ranking Leaderboard
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Explainable weighted candidate rankings evaluated across 6 criteria with verified evidence.
          </p>
        </div>

        {/* Job selector */}
        {jobs.length > 0 && (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-[#161616] border border-[#2e2e2e] rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#C4F167]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Filter and Sorting Bar */}
      <div className="bg-[#111111] border border-[#242424] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidates or skills..."
            className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Min Score Filter */}
          <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
            <span>Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              className="bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="0">All Scores</option>
              <option value="70">70% & above</option>
              <option value="80">80% & above</option>
              <option value="90">90% & above (Elite)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="overall">Sort: Overall Score</option>
              <option value="skills">Sort: Skill Match</option>
              <option value="experience">Sort: Years Experience</option>
              <option value="project">Sort: Project Complexity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Compare Action Bar if candidates selected */}
      {selectedForCompare.size > 0 && (
        <div className="sticky top-20 z-30 bg-[#C4F167] text-black px-6 py-3.5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs animate-bounce-short">
          <span>
            {selectedForCompare.size} Candidate{selectedForCompare.size > 1 ? 's' : ''} selected for side-by-side comparison
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedForCompare(new Set())}
              className="text-black/80 hover:text-black underline cursor-pointer"
            >
              Clear
            </button>
            <JobzyButton
              size="sm"
              variant="secondary"
              onClick={() => {
                const ids = Array.from(selectedForCompare).join(',');
                navigate(`/recruiter/compare?jobId=${selectedJobId}&candidateIds=${ids}`);
              }}
            >
              Launch Side-by-Side Comparison →
            </JobzyButton>
          </div>
        </div>
      )}

      {/* Candidate Ranking List */}
      {isLoading ? (
        <LoadingIndicator label="Calculating ranking positions..." />
      ) : candidates.length === 0 ? (
        <JobzyCard className="text-center py-16">
          <Users className="w-12 h-12 text-[#666666] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Ranked Candidates Found</h3>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1 mb-4">
            Upload candidate resumes to start automated screening or adjust score filters.
          </p>
          <Link to={`/recruiter/bulk-screening?jobId=${selectedJobId}`}>
            <JobzyButton size="sm" variant="primary">
              Upload Resumes For Screening
            </JobzyButton>
          </Link>
        </JobzyCard>
      ) : (
        <div className="space-y-4">
          {candidates.map((cand) => (
            <CandidateCard
              key={cand.id}
              candidate={cand}
              onViewDetails={(c) => setViewingCandidate(c)}
              onToggleShortlist={handleToggleShortlist}
              onScheduleInterview={(c) => {
                setSchedulingCandidate(c);
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + 2);
                nextDate.setHours(14, 0, 0, 0);
                setInterviewDate(nextDate.toISOString().slice(0, 16));
              }}
              onSelectForCompare={handleToggleCompare}
              isCompareSelected={selectedForCompare.has(cand.id)}
            />
          ))}
        </div>
      )}

      {/* Detail / Match Evidence Modal */}
      <Modal
        isOpen={Boolean(viewingCandidate)}
        onClose={() => setViewingCandidate(null)}
        title={`Candidate Match Intelligence: ${viewingCandidate?.name}`}
        maxWidth="2xl"
      >
        {viewingCandidate && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <div className="flex items-center gap-3">
                <img
                  src={viewingCandidate.avatar}
                  alt={viewingCandidate.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{viewingCandidate.name}</h4>
                  <p className="text-[#A3A3A3]">{viewingCandidate.title} • {viewingCandidate.experienceYears} yrs verified</p>
                </div>
              </div>
              <ScoreIndicator score={viewingCandidate.overallScore} size="md" label="Compatibility" />
            </div>

            {/* Evidence summary */}
            <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] space-y-2">
              <span className="text-[11px] font-bold text-[#C4F167] uppercase block flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Explainable Evidence
              </span>
              <p className="text-[#D1D1D1] leading-relaxed">
                {viewingCandidate.evidence?.summary || 'Candidate demonstrated verified competencies in key technologies.'}
              </p>
            </div>

            {/* Skills grid */}
            <div>
              <span className="font-bold text-white uppercase text-[11px] block mb-2">Verified Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {viewingCandidate.skills?.map((s: string, i: number) => (
                  <SkillBadge key={i} name={s} status="matched" size="sm" />
                ))}
              </div>
            </div>

            {/* Missing skills */}
            {viewingCandidate.missingRequirements?.length > 0 && (
              <div>
                <span className="font-bold text-amber-400 uppercase text-[11px] block mb-2">Gaps / Missing Requirements</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingCandidate.missingRequirements.map((m: string, mi: number) => (
                    <SkillBadge key={mi} name={m} status="missing" size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={Boolean(schedulingCandidate)}
        onClose={() => setSchedulingCandidate(null)}
        title={`Schedule Technical Interview: ${schedulingCandidate?.name}`}
        maxWidth="md"
      >
        {schedulingCandidate && (
          <form onSubmit={handleConfirmSchedule} className="space-y-4 text-xs">
            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Interview Round Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
              >
                <option value="TECHNICAL">Technical Architecture Round</option>
                <option value="HR">Culture & HR Discussion</option>
                <option value="SYSTEM_DESIGN">System Design & Scalability</option>
                <option value="SCREENING">Recruiter Screening</option>
              </select>
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Video Meeting Link</label>
              <input
                type="text"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <JobzyButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSchedulingCandidate(null)}
              >
                Cancel
              </JobzyButton>
              <JobzyButton
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isScheduling}
              >
                Schedule & Notify Candidate
              </JobzyButton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
