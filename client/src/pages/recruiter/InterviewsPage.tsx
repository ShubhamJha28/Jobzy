import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { Modal } from '../../components/Modal';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { Calendar, Video, Star, CheckCircle2, Clock, User, Briefcase } from 'lucide-react';

export const InterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Complete feedback modal state
  const [activeInterview, setActiveInterview] = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; interviews: any[] }>('/interviews');
      if (res.success) {
        setInterviews(res.interviews || []);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterview) return;

    try {
      setIsUpdating(true);
      const res = await apiRequest(`/interviews/${activeInterview.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'COMPLETED',
          feedback,
          rating,
        }),
      });

      if (res.success) {
        setActiveInterview(null);
        loadInterviews();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update interview.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#C4F167]" />
          Interview Scheduling & Feedback Hub
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Coordinate technical architecture assessments, video rooms, and structured evaluation rubrics.
        </p>
      </div>

      {isLoading ? (
        <LoadingIndicator label="Loading scheduled interviews..." />
      ) : interviews.length === 0 ? (
        <JobzyCard className="text-center py-16">
          <Calendar className="w-12 h-12 text-[#666666] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Scheduled Interviews</h3>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1">
            Interviews scheduled from the candidate ranking leaderboard will appear here.
          </p>
        </JobzyCard>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <JobzyCard
              key={item.id}
              className="p-6 border-[#242424] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#191919] border border-[#2e2e2e] flex items-center justify-center text-[#C4F167] shrink-0">
                  <Video className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-bold text-white text-base">
                      {item.application?.candidate?.user?.name || 'Candidate'}
                    </h4>
                    <span className="text-[10px] bg-[#C4F167]/15 text-[#C4F167] px-2 py-0.5 rounded-full font-bold">
                      {item.interviewType}
                    </span>
                    <span className="text-[10px] bg-[#1e1e1e] text-[#A3A3A3] px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#A3A3A3]">
                    Role: {item.application?.job?.title || 'Engineer'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#888888] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#C4F167]" />
                      {new Date(item.scheduledAt).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>Interviewer: {item.interviewer || 'Technical Team'}</span>
                  </div>

                  {item.feedback && (
                    <div className="mt-2 p-2.5 bg-[#141414] rounded-lg border border-[#222222] text-xs text-[#D1D1D1]">
                      <span className="font-bold text-[#C4F167] block text-[10px]">RECORDED FEEDBACK ({item.rating}/5 stars):</span>
                      <p className="mt-0.5">{item.feedback}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#222222]">
                <a href={item.meetingLink || "https://meet.google.com/chh-mkmp-cqn"} target="_blank" rel="noreferrer">
                  <JobzyButton size="sm" variant="secondary" leftIcon={<Video className="w-3.5 h-3.5" />}>
                    Join Meeting Room
                  </JobzyButton>
                </a>

                {item.status !== 'COMPLETED' && (
                  <JobzyButton
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setActiveInterview(item);
                      setFeedback(item.feedback || '');
                      setRating(item.rating || 5);
                    }}
                  >
                    Record Feedback
                  </JobzyButton>
                )}
              </div>
            </JobzyCard>
          ))}
        </div>
      )}

      {/* Record Feedback Modal */}
      <Modal
        isOpen={Boolean(activeInterview)}
        onClose={() => setActiveInterview(null)}
        title="Record Interview Evaluation & Rating"
        maxWidth="md"
      >
        {activeInterview && (
          <form onSubmit={handleCompleteInterview} className="space-y-4 text-xs">
            <div>
              <p className="text-white font-bold">{activeInterview.application?.candidate?.user?.name}</p>
              <p className="text-[#888888]">{activeInterview.application?.job?.title}</p>
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">
                Candidate Technical Rating (1 to 5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl border flex items-center gap-1 font-bold cursor-pointer ${
                      rating >= star
                        ? 'bg-[#C4F167] text-black border-[#C4F167]'
                        : 'bg-[#181818] text-[#888888] border-[#2e2e2e]'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{star}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">
                Written Evaluation & Strengths / Concerns
              </label>
              <textarea
                rows={4}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Candidate demonstrated deep mastery of distributed systems, answered concurrency questions well..."
                className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl p-3 text-white focus:outline-none focus:border-[#C4F167]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <JobzyButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setActiveInterview(null)}
              >
                Cancel
              </JobzyButton>
              <JobzyButton
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdating}
              >
                Submit Feedback
              </JobzyButton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
