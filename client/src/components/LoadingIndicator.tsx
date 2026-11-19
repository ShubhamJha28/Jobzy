import React from 'react';

interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  label = 'Processing talent intelligence...',
  size = 'md',
}) => {
  const spinnerDim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className={`relative ${spinnerDim}`}>
        <div className="absolute inset-0 rounded-full border-2 border-[#222222]"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-[#C4F167] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      {label && <p className="text-xs font-medium text-[#A3A3A3] animate-pulse">{label}</p>}
    </div>
  );
};
