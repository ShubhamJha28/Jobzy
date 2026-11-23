import React from 'react';
import { Link } from 'react-router-dom';

interface JobzyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
  to?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const JobzyLogo: React.FC<JobzyLogoProps> = ({
  size = 'md',
  to = '/',
  onClick,
  className = '',
}) => {
  const heightPx = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-12' : 'h-8 sm:h-9';

  const logoContent = (
    <div
      className={`inline-flex items-center group select-none border-0 outline-none bg-transparent ${className}`}
      style={{ outline: 'none', border: 'none', background: 'transparent' }}
    >
      <img
        src="/Jobzy.png"
        alt="JOBZY"
        className={`${heightClass} w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105 pointer-events-none select-none`}
        style={{
          height: `${heightPx}px`,
          width: 'auto',
          maxHeight: `${heightPx}px`,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          background: 'transparent',
        }}
        loading="eager"
        draggable={false}
      />
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="inline-flex items-center border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none active:ring-0 select-none bg-transparent hover:bg-transparent"
        style={{
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
          border: 'none',
          boxShadow: 'none',
          background: 'transparent',
        }}
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};


