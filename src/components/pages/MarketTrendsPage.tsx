import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Package,
  Layers,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { HistoricalRecord } from '../../types';

interface MarketTrendsPageProps {
  historicalData: HistoricalRecord[];
}

export const MarketTrendsPage: React.FC<MarketTrendsPageProps> = ({ historicalData }) => {
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y' | 'all'>('90d');
  const [aggregation, setAggregation] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Filtered dataset by timeframe
  const filteredData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    let slice = [...historicalData];
    if (timeframe === '30d') {
      slice = slice.slice(-30);
    } else if (timeframe === '90d') {
      slice = slice.slice(-90);
    } else if (timeframe === '1y') {
      slice = slice.slice(-365);
    }

    if (aggregation === 'weekly') {
      const weeklyMap = new Map<string, HistoricalRecord[]>();
      slice.forEach((r) => {
        const d = new Date(r.date);
        const wKey = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
        if (!weeklyMap.has(wKey)) weeklyMap.set(wKey, []);
        weeklyMap.get(wKey)!.push(r);
      });
      return Array.from(weeklyMap.entries()).map(([k, group]) => ({
        date: group[group.length - 1].date,
        displayDate: group[group.length - 1].date.substring(5),
        modal_price: Math.round(group.reduce((s, g) => s + g.modal_price, 0) / group.length),
        min_price: Math.min(...group.map((g) => g.min_price)),
        max_price: Math.max(...group.map((g) => g.max_price)),
        arrivals: Math.round(group.reduce((s, g) => s + g.arrivals_quintals, 0) / group.length),
        volatility: Number((group.reduce((s, g) => s + g.realized_volatility_14d, 0) / group.length).toFixed(1))
      }));
    } else if (aggregation === 'monthly') {
      const monthlyMap = new Map<string, HistoricalRecord[]>();
      slice.forEach((r) => {
        const mKey = r.date.substring(0, 7);
        if (!monthlyMap.has(mKey)) monthlyMap.set(mKey, []);
        monthlyMap.get(mKey)!.push(r);
      });
      return Array.from(monthlyMap.entries()).map(([k, group]) => ({
        date: `${k}-01`,
        displayDate: k,
        modal_price: Math.round(group.reduce((s, g) => s + g.modal_price, 0) / group.length),
        min_price: Math.min(...group.map((g) => g.min_price)),
        max_price: Math.max(...group.map((g) => g.max_price)),
        arrivals: Math.round(group.reduce((s, g) => s + g.arrivals_quintals, 0) / group.length),
        volatility: Number((group.reduce((s, g) => s + g.realized_volatility_14d, 0) / group.length).toFixed(1))
      }));
    }

    return slice.map((r) => ({
      date: r.date,
      displayDate: r.date.substring(5),
      modal_price: r.modal_price,
      min_price: r.min_price,
      max_price: r.max_price,
      arrivals: r.arrivals_quintals,
      volatility: r.realized_volatility_14d
    }));
  }, [historicalData, timeframe, aggregation]);

  // Statistics across current view
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { min: 0, max: 0, avgPrice: 0, avgArrivals: 0, priceChange: 0, priceChangePct: 0 };
    const prices = filteredData.map((d) => d.modal_price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    const avgArrivals = Math.round(filteredData.reduce((s, d) => s + d.arrivals, 0) / filteredData.length);
    const firstPrice = filteredData[0].modal_price;
    const lastPrice = filteredData[filteredData.length - 1].modal_price;
    const priceChange = lastPrice - firstPrice;
    const priceChangePct = Number(((priceChange / firstPrice) * 100).toFixed(2));
    return { min, max, avgPrice, avgArrivals, priceChange, priceChangePct };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Market Price & Volume Dynamics</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            {(['30d', '90d', '1y', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  timeframe === t ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Aggregation Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            {(['daily', 'weekly', 'monthly'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAggregation(a)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  aggregation === a ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E3ECE5] shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Period Price Delta
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {stats.priceChange >= 0 ? `+₹${stats.priceChange.toLocaleString()}` : `-₹${Math.abs(stats.priceChange).toLocaleString()}`}
          </div>
          <span className={`text-xs font-mono font-semibold ${stats.priceChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {stats.priceChangePct >= 0 ? `+${stats.priceChangePct}%` : `${stats.priceChangePct}%`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3ECE5] shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Period Range
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{stats.min.toLocaleString()} – ₹{stats.max.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 font-mono">Spread: ₹{(stats.max - stats.min).toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3ECE5] shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Average Modal Price
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{stats.avgPrice.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">₹/quintal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3ECE5] shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Average Mandi Arrivals
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {stats.avgArrivals.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">quintals/day</span>
        </div>
      </div>

      {/* Chart 1: Price and Trading Band (Min, Modal, Max) */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Price Trend & Wholesale Trading Band</h3>
          </div>
          <div className="text-xs font-mono text-slate-500">
            {filteredData.length} Data Points
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="trendPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803D" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#15803D" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                minTickGap={20}
              />
              <YAxis
                domain={['dataMin - 200', 'dataMax + 200']}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v.toLocaleString()}`}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800 font-sans">
                        <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                          {d.date}
                        </div>
                        <div className="font-mono text-emerald-400 font-bold text-sm">
                          Modal Price: ₹{d.modal_price.toLocaleString()}/qtl
                        </div>
                        <div className="text-slate-300 font-mono mt-1">
                          Trading Band: ₹{d.min_price.toLocaleString()} – ₹{d.max_price.toLocaleString()}
                        </div>
                        <div className="text-slate-400 font-mono mt-1">
                          Arrivals: {d.arrivals.toLocaleString()} qtl · Volatility: {d.volatility}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <Area
                type="monotone"
                dataKey="modal_price"
                stroke="#15803D"
                strokeWidth={2.4}
                fill="url(#trendPriceGrad)"
                name="Modal Price (₹/qtl)"
              />
              <Line
                type="monotone"
                dataKey="max_price"
                stroke="#64748B"
                strokeWidth={1.2}
                strokeDasharray="2 2"
                dot={false}
                name="Max Quote"
              />
              <Line
                type="monotone"
                dataKey="min_price"
                stroke="#94A3B8"
                strokeWidth={1.2}
                strokeDasharray="2 2"
                dot={false}
                name="Min Quote"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Mandi Arrivals vs Price (Dual-Axis Inverse Supply Dynamics) */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mandi Arrivals vs Wholesale Price</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Supply Elasticity
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                minTickGap={20}
              />
              {/* Left Axis: Price */}
              <YAxis
                yAxisId="price"
                domain={['dataMin - 200', 'dataMax + 200']}
                tick={{ fontSize: 11, fill: '#15803D' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v.toLocaleString()}`}
                width={70}
              />
              {/* Right Axis: Arrivals */}
              <YAxis
                yAxisId="arrivals"
                orientation="right"
                tick={{ fontSize: 11, fill: '#0F766E' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v} q`}
                width={50}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800 font-sans">
                        <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                          {d.date}
                        </div>
                        <div className="font-mono text-emerald-400 font-bold">
                          Modal Price: ₹{d.modal_price.toLocaleString()}/qtl
                        </div>
                        <div className="font-mono text-teal-400 font-bold mt-1">
                          Arrivals: {d.arrivals.toLocaleString()} quintals
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <Bar
                yAxisId="arrivals"
                dataKey="arrivals"
                fill="#99F6E4"
                radius={[2, 2, 0, 0]}
                name="Mandi Arrivals (Quintals)"
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="modal_price"
                stroke="#15803D"
                strokeWidth={2.4}
                dot={false}
                name="Modal Price (₹/qtl)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
