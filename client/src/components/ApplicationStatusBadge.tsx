import React from 'react';

export type ApplicationStage =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_EXTENDED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

interface ApplicationStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_') as ApplicationStage;

  const config: Record<
    ApplicationStage,
    { label: string; bg: string; text: string; border: string }
  > = {
    APPLIED: {
      label: 'Applied',
      bg: 'bg-zinc-800/60',
      text: 'text-zinc-300',
      border: 'border-zinc-700',
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-amber-950/40',
      text: 'text-amber-300',
      border: 'border-amber-800/50',
    },
    SHORTLISTED: {
      label: 'Shortlisted',
      bg: 'bg-[#E0FE9E]/15',
      text: 'text-[#E0FE9E]',
      border: 'border-[#E0FE9E]/30',
    },
    INTERVIEW_SCHEDULED: {
      label: 'Interview Scheduled',
      bg: 'bg-[#C4F167]/15',
      text: 'text-[#C4F167]',
      border: 'border-[#C4F167]/40',
    },
    INTERVIEW_COMPLETED: {
      label: 'Interview Completed',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-300',
      border: 'border-cyan-800/50',
    },
    OFFER_EXTENDED: {
      label: 'Offer Extended 🎉',
      bg: 'bg-[#C4F167]/25',
      text: 'text-[#C4F167] font-bold shadow-sm',
      border: 'border-[#C4F167]',
    },
    HIRED: {
      label: 'Hired ✨',
      bg: 'bg-[#C4F167]',
      text: 'text-black font-extrabold',
      border: 'border-[#C4F167]',
    },
    REJECTED: {
      label: 'Not Selected',
      bg: 'bg-red-950/30',
      text: 'text-red-400',
      border: 'border-red-900/40',
    },
    WITHDRAWN: {
      label: 'Withdrawn',
      bg: 'bg-zinc-900',
      text: 'text-zinc-500',
      border: 'border-zinc-800',
    },
  };

  const style = config[normalized] || config.APPLIED;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border select-none ${sizeClasses} ${style.bg} ${style.text} ${style.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {style.label}
    </span>
  );
};
