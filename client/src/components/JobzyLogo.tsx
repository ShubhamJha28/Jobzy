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
  withTagline = false,
  to = '/',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Branded Geometric Hex/Mark */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-[#000000] border border-[#2a2a2a] group-hover:border-[#C4F167] transition-all duration-300 shadow-sm"
        style={{ width: iconSize + 10, height: iconSize + 10 }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized 'J' with electric lime geometric bar */}
          <path
            d="M8 8H24V12H16V22C16 23.1 15.1 24 14 24H10C8.9 24 8 23.1 8 22V20H12V20H12V12H8V8Z"
            fill="#C4F167"
          />
          <circle cx="23" cy="9" r="2.5" fill="#E0FE9E" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-black tracking-tight text-white ${textSize} font-sans`}>
            JOBZY
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C4F167] animate-pulse"></span>
        </div>
        {withTagline && (
          <span className="text-[10px] uppercase tracking-widest text-[#A3A3A3] font-medium -mt-1">
            Talent Intelligence
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{logoContent}</Link>;
  }

  return logoContent;
};
