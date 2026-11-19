import React from 'react';

interface JobzyCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const JobzyCard: React.FC<JobzyCardProps> = ({
  children,
  className = '',
  hoverable = false,
  glow = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#111111] 
        border border-[#242424] 
        rounded-2xl 
        p-6 
        transition-all 
        duration-200 
        ${hoverable ? 'hover:border-[#383838] hover:bg-[#141414] cursor-pointer' : ''}
        ${glow ? 'lime-glow border-[#C4F167]/40' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
