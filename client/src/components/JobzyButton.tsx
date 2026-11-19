import React from 'react';

interface JobzyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const JobzyButton: React.FC<JobzyButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 select-none rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-bold',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#C4F167] text-[#000000] hover:bg-[#b0df52] hover:shadow-lime-sm font-bold border border-transparent',
    secondary:
      'bg-[#191919] text-[#FFFFFF] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#383838]',
    outline:
      'bg-transparent text-[#C4F167] border border-[#C4F167]/40 hover:border-[#C4F167] hover:bg-[#C4F167]/10',
    ghost:
      'bg-transparent text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#1a1a1a]',
    danger:
      'bg-red-950/40 text-red-400 border border-red-800/50 hover:bg-red-900/40',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
