import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  changeValue?: number | string;
  changePeriod?: string;
  isPositiveGood?: boolean;
  neutralTrend?: boolean;
  contextText?: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'low' | 'moderate' | 'high' | 'neutral';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  changeValue,
  changePeriod,
  isPositiveGood = true,
  neutralTrend = false,
  contextText,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  onClick
}) => {
  const numChange = typeof changeValue === 'number' ? changeValue : null;
  const isUp = numChange !== null && numChange > 0;
  const isDown = numChange !== null && numChange < 0;

  // Colors for risk level badge
  const riskBadgeStyles = {
    low: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
    moderate: 'text-amber-800 bg-amber-50 border border-amber-200/60',
    high: 'text-rose-700 bg-rose-50 border border-rose-200/60',
    neutral: 'text-slate-700 bg-slate-100 border border-slate-200/60'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-emerald-500/60 hover:shadow-sm' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#F2F8F4] text-[#1B5E34] flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
      </div>

      {/* Trend Indicator & Context */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
        {changeValue !== undefined && !neutralTrend && (
          <div
            className={`flex items-center gap-1 font-semibold font-mono tabular-nums ${
              isUp
                ? isPositiveGood
                  ? 'text-emerald-700'
                  : 'text-rose-700'
                : isDown
                ? isPositiveGood
                  ? 'text-rose-700'
                  : 'text-emerald-700'
                : 'text-slate-600'
            }`}
          >
            {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
            {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
            <span>
              {typeof changeValue === 'number' ? `${Math.abs(changeValue)}%` : changeValue}
            </span>
          </div>
        )}

        {changePeriod && <span className="text-slate-400">{changePeriod}</span>}

        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${riskBadgeStyles[badgeVariant]}`}
          >
            {badgeText}
          </span>
        )}

        {contextText && (
          <span className="text-slate-500 text-[11px] truncate flex-1">{contextText}</span>
        )}
      </div>
    </div>
  );
};
