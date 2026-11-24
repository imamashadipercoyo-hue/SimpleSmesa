import React from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  lineColor?: string;
  fillColor?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  lineColor = '#2563eb', // blue-600
  fillColor = 'rgba(37, 99, 235, 0.08)',
  height = 180
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 10);
  const paddingX = 35;
  const paddingY = 25;
  const width = 500;

  const points = data.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (data.length - 1);
    const y = height - paddingY - (d.value / maxValue) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <span className="text-xs text-slate-600">Total data: {data.reduce((a, b) => a + b.value, 0)}</span>
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[320px]">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={paddingX - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                  {Math.round(maxValue * pct)}
                </text>
              </g>
            );
          })}

          {/* Area and Line */}
          <path d={areaD} fill={fillColor} />
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={lineColor} strokeWidth="2" />
              <text x={p.x} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  barColor?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  barColor = '#3b82f6',
  height = 180
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 5);
  const width = 500;
  const paddingX = 35;
  const paddingY = 25;
  const availableWidth = width - 2 * paddingX;
  const barWidth = (availableWidth / data.length) * 0.55;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <span className="text-xs text-slate-600">Total: {data.reduce((a, b) => a + b.value, 0)} kasus</span>
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[320px]">
          {/* Horizontal Grid */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={paddingX - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                  {Math.round(maxValue * pct)}
                </text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const colWidth = availableWidth / data.length;
            const x = paddingX + i * colWidth + (colWidth - barWidth) / 2;
            const barHeight = (d.value / maxValue) * (height - 2 * paddingY);
            const y = height - paddingY - barHeight;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill={barColor}
                  className="transition-all duration-300 hover:opacity-80"
                />
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">
                  {d.value}
                </text>
                <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-800 mb-3">{title}</h4>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
            {data.map((item, i) => {
              const percent = total > 0 ? item.value / total : 0;
              const dashOffset = circumference * (1 - accumulatedPercent);
              const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
              accumulatedPercent += percent;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-circumference * (accumulatedPercent - percent)}
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <span className="text-xl font-bold text-slate-900">{total}</span>
            <span className="block text-[10px] text-slate-600 font-medium uppercase tracking-wider">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 text-xs">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-900 ml-auto pl-3">
                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
