import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}) => {
  return (
    <div
      className={`
        bg-[#111111] 
        border rounded-2xl p-5 transition-all duration-200
        ${highlight ? 'border-[#C4F167]/50 shadow-lime-sm' : 'border-[#242424] hover:border-[#333333]'}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#191919] border border-[#2a2a2a] flex items-center justify-center text-[#C4F167]">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trend.isPositive ? 'text-[#C4F167]' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-[#777777] mt-1">{subtitle}</p>}
    </div>
  );
};
