import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue'
}) => {
  const colorMap = {
    blue: 'border-l-blue-600 text-blue-600 bg-blue-50/40',
    indigo: 'border-l-indigo-600 text-indigo-600 bg-indigo-50/40',
    emerald: 'border-l-emerald-600 text-emerald-600 bg-emerald-50/40',
    amber: 'border-l-amber-600 text-amber-600 bg-amber-50/40',
    rose: 'border-l-rose-600 text-rose-600 bg-rose-50/40',
    slate: 'border-l-slate-600 text-slate-700 bg-slate-50/40'
  };

  return (
    <div className={`p-4 bg-white border border-slate-200 border-l-4 rounded-lg shadow-xs flex flex-col justify-between ${colorMap[accentColor]}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{value}</div>
        </div>
        <div className="p-2.5 rounded-md bg-white border border-slate-100 shadow-2xs">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={trend.isPositive ? 'text-emerald-600 font-semibold' : 'text-slate-600 font-medium'}>
              {trend.value} <span className="text-slate-600 font-normal">· {trend.label || 'periode ini'}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
