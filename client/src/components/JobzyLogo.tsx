import React from 'react';
import { Link } from 'react-router-dom';

interface JobzyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
  to?: string;
  className?: string;
}

export const JobzyLogo: React.FC<JobzyLogoProps> = ({
  size = 'md',
  to = '/',
  className = '',
}) => {
  const heightPx = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-12' : 'h-8 sm:h-9';

  const logoContent = (
    <div className={`inline-flex items-center group select-none ${className}`}>
      <img
        src="/Jobzy.png"
        alt="JOBZY"
        className={`${heightClass} w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105`}
        style={{ height: `${heightPx}px`, width: 'auto', maxHeight: `${heightPx}px` }}
        loading="eager"
      />
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

