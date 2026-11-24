import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  Briefcase,
  Calendar,
  Video,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
} from 'lucide-react';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; applications: any[] }>('/applications/my');
      if (res.success) {
        setApplications(res.applications || []);
        if (res.applications?.length > 0) {
          setExpandedAppId(res.applications[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stages = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW_SCHEDULED', label: 'Interview' },
    { key: 'OFFER_EXTENDED', label: 'Offer' },
    { key: 'HIRED', label: 'Hired' },
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-[#C4F167]" />
          Application Progression Tracker
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Monitor your real-time status across recruitment stages, view scheduled interview links, and review historical status notes.
        </p>
      </div>

      {isLoading ? (
        <LoadingIndicator label="Loading your active applications..." />
      ) : applications.length === 0 ? (
        <JobzyCard className="text-center py-16">
          <Briefcase className="w-12 h-12 text-[#666666] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Applications Yet</h3>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1 mb-4">
            Discover precision job matches tailored to your verified skills and submit 1-click applications.
          </p>
          <JobzyButton size="sm" variant="primary" onClick={() => (window.location.href = '/candidate/jobs')}>
            Discover Opportunities
          </JobzyButton>
        </JobzyCard>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isExpanded = expandedAppId === app.id;

            return (
              <JobzyCard key={app.id} className="p-6 border-[#282828] space-y-6">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#191919] border border-[#2e2e2e] flex items-center justify-center font-black text-lg text-[#C4F167] shrink-0">
                      {app.job?.company?.name ? app.job.company.name.charAt(0) : 'J'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-white text-base">{app.job?.title}</h3>
                        <ApplicationStatusBadge status={app.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#A3A3A3] mt-0.5">
                        {app.job?.company?.name || 'Company'} • Applied on{' '}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                    className="flex items-center gap-1.5 text-xs text-[#C4F167] font-semibold hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide History' : 'View Timeline & Interviews'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Visual Recruitment Stage Progression Bar */}
                <div className="pt-2 pb-2">
                  <div className="grid grid-cols-6 gap-2">
                    {stages.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div key={stage.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-full h-2 rounded-full mb-2 transition-all duration-500 ${
                              isCompleted
                                ? isCurrent
                                  ? 'bg-[#C4F167] shadow-lime-sm'
                                  : 'bg-[#C4F167]/80'
                                : 'bg-[#222222]'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-medium ${
                              isCurrent
                                ? 'text-[#C4F167] font-bold'
                                : isCompleted
                                ? 'text-white'
                                : 'text-[#666666]'
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduled Interviews Card if any */}
                {app.interviews?.length > 0 && (
                  <div className="bg-[#141414] border border-[#C4F167]/30 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#C4F167] uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Upcoming Interview Scheduled
                      </span>
                      <span className="text-[11px] bg-[#C4F167]/15 text-[#C4F167] px-2 py-0.5 rounded-full font-bold">
                        {app.interviews[0].interviewType}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-white">
                          {new Date(app.interviews[0].scheduledAt).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-[#888888] text-[11px] mt-0.5">
                          Interviewer: {app.interviews[0].interviewer || 'Hiring Team'}
                        </p>
                      </div>

                      <a
                        href={app.interviews[0].meetingLink || "https://meet.google.com/chh-mkmp-cqn"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <JobzyButton
                          size="sm"
                          variant="primary"
                          leftIcon={<Video className="w-3.5 h-3.5" />}
                        >
                          Join Meeting Room
                        </JobzyButton>
                      </a>
                    </div>
                  </div>
                )}

                {/* Expandable History Drawer */}
                {isExpanded && (
                  <div className="pt-4 border-t border-[#1f1f1f] space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Status History & Recruiter Notes
                    </h4>

                    {app.statusHistory?.length === 0 ? (
                      <p className="text-xs text-[#777777]">No status updates recorded yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {app.statusHistory.map((hist: any, hi: number) => (
                          <div
                            key={hi}
                            className="bg-[#161616] border border-[#242424] p-3 rounded-xl text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">
                                {hist.newStatus.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-[#777777]">
                                {new Date(hist.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[#A3A3A3] text-[11px]">
                              {hist.note || 'Status transitioned.'}
                            </p>
                            <span className="text-[10px] text-[#666666] block">
                              Updated by: {hist.changedBy || 'Recruiter'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </JobzyCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
