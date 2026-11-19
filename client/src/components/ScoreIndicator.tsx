import React from 'react';

interface ScoreIndicatorProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercent?: boolean;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  size = 'md',
  label,
  showPercent = true,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Dimensions
  const dim = size === 'sm' ? 44 : size === 'lg' ? 96 : 64;
  const strokeWidth = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const color =
    normalizedScore >= 85
      ? '#C4F167' // Electric Lime
      : normalizedScore >= 70
      ? '#E0FE9E' // Soft Lime
      : normalizedScore >= 50
      ? '#FBBF24' // Amber
      : '#F87171'; // Red

  const textSize = size === 'sm' ? 'text-xs font-bold' : size === 'lg' ? 'text-2xl font-black' : 'text-base font-bold';

  return (
    <div className="inline-flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="#222222"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className={`absolute flex items-baseline justify-center ${textSize} text-white`}>
          <span>{normalizedScore}</span>
          {showPercent && <span className="text-[10px] text-[#A3A3A3] ml-0.5">%</span>}
        </div>
      </div>
      {label && <span className="text-xs text-[#A3A3A3] mt-1.5 font-medium">{label}</span>}
    </div>
  );
};
