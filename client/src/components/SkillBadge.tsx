import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  status?: 'matched' | 'missing' | 'preferred' | 'neutral';
  size?: 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  status = 'neutral',
  size = 'md',
  onRemove,
  className = '',
}) => {
  const sizeStyles = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs px-3 py-1 gap-1.5 font-medium';

  const statusStyles = {
    matched: 'bg-[#C4F167]/15 text-[#C4F167] border border-[#C4F167]/40',
    missing: 'bg-red-950/30 text-red-400 border border-red-800/40',
    preferred: 'bg-[#E0FE9E]/10 text-[#E0FE9E] border border-[#E0FE9E]/30 border-dashed',
    neutral: 'bg-[#1a1a1a] text-[#D1D1D1] border border-[#2a2a2a]',
  }[status];

  return (
    <span
      className={`inline-flex items-center rounded-lg select-none transition-colors ${sizeStyles} ${statusStyles} ${className}`}
    >
      {status === 'matched' && <Check className="w-3 h-3 text-[#C4F167]" />}
      {status === 'missing' && <X className="w-3 h-3 text-red-400" />}
      {status === 'preferred' && <AlertCircle className="w-3 h-3 text-[#E0FE9E]" />}
      <span>{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:text-white p-0.5 rounded cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
