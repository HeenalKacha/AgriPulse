import React, { useState, useMemo } from 'react';
import {
  CloudRain,
  Sun,
  AlertTriangle,
  Droplets,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { HistoricalRecord } from '../../types';

interface RainfallInsightsPageProps {
  historicalData: HistoricalRecord[];
}

export const RainfallInsightsPage: React.FC<RainfallInsightsPageProps> = ({ historicalData }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2023'); // Default to 2023 deficit year

  // Yearly monsoon profiles
  const yearlyMonsoonSummary = useMemo(() => {
    return [
      {
        year: '2021',
        label: '2021 Normal Monsoon',
        status: 'Normal (+1.2%)',
        statusType: 'normal',
        description: 'Optimal Kharif sowing conditions; low volatility regime.',
        totalRainfallMm: 980,
        deficitPct: 1.2,
        peakVolatility: 16.2,
        avgPrice: '₹6,580'
      },
      {
        year: '2022',
        label: '2022 Post-Monsoon Excess',
        status: 'Excess (+11.8%) + Unseasonal Oct Rains',
        statusType: 'warning',
        description: 'Unseasonal October rains damaged mature standing crops, initiating price firming.',
        totalRainfallMm: 1120,
        deficitPct: 11.8,
        peakVolatility: 22.4,
        avgPrice: '₹7,640'
      },
      {
        year: '2023',
        label: '2023 Severe El Niño Deficit Year',
        status: 'Severe Deficit (-31.5%)',
        statusType: 'severe_deficit',
        description: 'Monsoon break in July-August caused yield contractions and sharp volatility spikes.',
        totalRainfallMm: 620,
        deficitPct: -31.5,
        peakVolatility: 34.8,
        avgPrice: '₹11,480'
      },
      {
        year: '2024',
        label: '2024 Monsoon Recovery',
        status: 'Above Normal (+7.4%)',
        statusType: 'normal',
        description: 'Restored soil moisture reserves and regular arrivals stabilized spot volatility.',
        totalRainfallMm: 1045,
        deficitPct: 7.4,
        peakVolatility: 19.5,
        avgPrice: '₹10,520'
      }
    ];
  }, []);

  // Filter historical data for selected year
  const yearData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    return historicalData
      .filter((r) => r.date.startsWith(selectedYear))
      .map((r) => ({
        date: r.date,
        displayDate: r.date.substring(5),
        rainfall: r.rainfall_mm,
        volatility: r.realized_volatility_14d,
        modal_price: r.modal_price,
        is_monsoon: r.is_monsoon
      }));
  }, [historicalData, selectedYear]);

  // Monthly aggregated rainfall comparison across all years (2021-2024)
  const monthlyRainfallComparison = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const table: any[] = months.map((m, idx) => ({
      month: m,
      monthIdx: idx + 1,
      y2021: 0,
      y2022: 0,
      y2023: 0,
      y2024: 0
    }));

    historicalData.forEach((r) => {
      const parts = r.date.split('-');
      const y = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      if (table[mIdx]) {
        if (y === '2021') table[mIdx].y2021 = Number((table[mIdx].y2021 + r.rainfall_mm).toFixed(1));
        if (y === '2022') table[mIdx].y2022 = Number((table[mIdx].y2022 + r.rainfall_mm).toFixed(1));
        if (y === '2023') table[mIdx].y2023 = Number((table[mIdx].y2023 + r.rainfall_mm).toFixed(1));
        if (y === '2024') table[mIdx].y2024 = Number((table[mIdx].y2024 + r.rainfall_mm).toFixed(1));
      }
    });

    return table;
  }, [historicalData]);

  const activeYearSummary = yearlyMonsoonSummary.find((y) => y.year === selectedYear);

  return (
    <div className="space-y-6">
      {/* Deficit-Year Highlight & Agro-climatic Overview */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Maharashtra Pulse Belt Rainfall & Volatility
              </h2>
              <span className="text-[10px] font-semibold font-mono uppercase bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
                Precipitation Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Precipitation patterns and pulse price volatility correlation
            </p>
          </div>

          {/* Year Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            {['2021', '2022', '2023', '2024'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedYear === yr
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {yr} {yr === '2023' && '⚠️'}
              </button>
            ))}
          </div>
        </div>

        {/* Year Profile Card */}
        {activeYearSummary && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed ${
              activeYearSummary.statusType === 'severe_deficit'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : activeYearSummary.statusType === 'warning'
                ? 'bg-blue-50/60 border-blue-200 text-slate-800'
                : 'bg-emerald-50/60 border-emerald-200 text-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{activeYearSummary.label}</span>
                <span className="font-mono font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                  {activeYearSummary.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span>Total Rain: ~{activeYearSummary.totalRainfallMm} mm</span>
                <span>·</span>
                <span>Peak Volatility: {activeYearSummary.peakVolatility}%</span>
                <span>·</span>
                <span>Avg Price: {activeYearSummary.avgPrice}</span>
              </div>
            </div>
            <p className="text-slate-700">{activeYearSummary.description}</p>
          </div>
        )}
      </div>

      {/* Chart 1: Daily Rainfall & Resulting 14-Day Volatility for Selected Year */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daily Precipitation vs Price Volatility ({selectedYear})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Monsoon Focus (June–Sept)
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                minTickGap={25}
              />
              {/* Left Axis: Volatility */}
              <YAxis
                yAxisId="vol"
                domain={[0, 'dataMax + 4']}
                tick={{ fontSize: 11, fill: '#15803D' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={46}
              />
              {/* Right Axis: Rainfall */}
              <YAxis
                yAxisId="rain"
                orientation="right"
                domain={[0, 'dataMax + 10']}
                tick={{ fontSize: 11, fill: '#0284C7' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}mm`}
                width={50}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800 font-sans">
                        <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                          {d.date} {d.is_monsoon && '· Southwest Monsoon'}
                        </div>
                        <div className="font-mono text-sky-400 font-semibold">
                          Daily Rainfall: {d.rainfall} mm
                        </div>
                        <div className="font-mono text-emerald-400 font-semibold mt-1">
                          14-Day Volatility: {d.volatility}%
                        </div>
                        <div className="font-mono text-slate-300 mt-1">
                          Spot Price: ₹{d.modal_price.toLocaleString()}/qtl
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <Bar
                yAxisId="rain"
                dataKey="rainfall"
                fill="#38BDF8"
                radius={[2, 2, 0, 0]}
                name="Daily Rainfall (mm)"
              />
              <Line
                yAxisId="vol"
                type="monotone"
                dataKey="volatility"
                stroke="#15803D"
                strokeWidth={2.2}
                dot={false}
                name="Realized 14-Day Volatility (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Monthly Rainfall Comparison (2021 vs 2022 vs 2023 vs 2024) */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Multi-Year Monthly Rainfall Comparison (2021–2024)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Cumulative Monthly (mm)
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRainfallComparison} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}mm`}
                width={50}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800 font-sans">
                        <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                          {d.month} Cumulative Rainfall
                        </div>
                        <div className="font-mono text-emerald-400">2021: {d.y2021} mm</div>
                        <div className="font-mono text-sky-400">2022: {d.y2022} mm</div>
                        <div className="font-mono text-amber-400 font-bold">2023 (El Niño): {d.y2023} mm</div>
                        <div className="font-mono text-teal-400">2024: {d.y2024} mm</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <Bar dataKey="y2021" fill="#86EFAC" name="2021 (Normal)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="y2022" fill="#93C5FD" name="2022 (Unseasonal Oct)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="y2023" fill="#F59E0B" name="2023 (Drought Deficit)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="y2024" fill="#10B981" name="2024 (Recovery)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
