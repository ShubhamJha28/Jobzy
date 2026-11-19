import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { Bookmark, Calendar, Trash2, Users, Briefcase } from 'lucide-react';

export const ShortlistsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadShortlists(selectedJobId);
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      const res = await apiRequest<{ success: boolean; jobs: any[] }>('/jobs');
      if (res.success && res.jobs?.length > 0) {
        setJobs(res.jobs);
        setSelectedJobId(res.jobs[0].id);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadShortlists = async (jobId: string) => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; shortlists: any[] }>(`/shortlists/${jobId}`);
      if (res.success) {
        setShortlists(res.shortlists || []);
      }
    } catch (err) {
      console.error('Failed to load shortlists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShortlist = async (candidateId: string) => {
    try {
      await apiRequest('/shortlists/toggle', {
        method: 'POST',
        body: JSON.stringify({ jobId: selectedJobId, candidateId }),
      });
      setShortlists((prev) => prev.filter((s) => s.candidateId !== candidateId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove from shortlist.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1f1f1f]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#C4F167]" />
            Shortlisted Candidates
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Top selected talent bookmarked for technical interviews and hiring manager reviews.
          </p>
        </div>

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

      {isLoading ? (
        <LoadingIndicator label="Loading shortlisted candidates..." />
      ) : shortlists.length === 0 ? (
        <JobzyCard className="text-center py-16">
          <Bookmark className="w-12 h-12 text-[#666666] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Shortlisted Candidates Yet</h3>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1 mb-4">
            Browse ranked candidates on the leaderboard and click the bookmark button to shortlist top contenders.
          </p>
        </JobzyCard>
      ) : (
        <div className="space-y-4">
          {shortlists.map((item) => (
            <JobzyCard
              key={item.id}
              className="p-6 border-[#242424] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.candidate?.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.candidate?.user?.name)}`}
                  alt={item.candidate?.user?.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#2e2e2e]"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{item.candidate?.user?.name}</h4>
                  <p className="text-xs text-[#A3A3A3]">{item.candidate?.title || 'Engineer'}</p>
                  <p className="text-xs text-[#C4F167] bg-[#C4F167]/10 px-2.5 py-1 rounded-lg border border-[#C4F167]/20 mt-2">
                    Note: {item.notes || 'Shortlisted based on score'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRemoveShortlist(item.candidateId)}
                  className="p-2 rounded-xl border border-[#2a2a2a] text-[#888888] hover:text-red-400 hover:border-red-900/40 transition-colors cursor-pointer"
                  title="Remove from shortlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </JobzyCard>
          ))}
        </div>
      )}
    </div>
  );
};
