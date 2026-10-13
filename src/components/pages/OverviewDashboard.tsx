import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  CloudRain,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Info,
  Clock,
  ArrowRight,
  MapPin,
  Bell
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { KpiCard } from '../KpiCard';
import { ModelOfflineBanner } from '../ModelOfflineBanner';
import { MaharashtraMap, MapMetric } from '../MaharashtraMap';
import { useLanguage } from '../../context/LanguageContext';
import { MarketSummary, HistoricalRecord, PredictionResult, MarketInsightItem } from '../../types';
import { calculate14DayForecastWindow } from '../../utils/dateUtils';

interface OverviewDashboardProps {
  summary: MarketSummary | null;
  historicalData: HistoricalRecord[];
  latestForecast: PredictionResult | null;
  insights: MarketInsightItem[];
  isModelConnected: boolean;
  onNavigateToForecast: () => void;
  onNavigateToMap: () => void;
  onReconnectModel: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  summary,
  historicalData,
  latestForecast,
  insights,
  isModelConnected,
  onNavigateToForecast,
  onNavigateToMap,
  onReconnectModel
}) => {
  const { t, language } = useLanguage();
  const [mapMetric, setMapMetric] = useState<MapMetric>('volatility');

  // 1. Historical Price Trend: Last 90 days for sharp, readable focus
  const recentPriceTrend = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    return historicalData.slice(-90).map((r) => ({
      date: r.date.substring(5), // MM-DD
      fullDate: r.date,
      modal_price: r.modal_price,
      min_price: r.min_price,
      max_price: r.max_price,
      volatility: r.realized_volatility_14d
    }));
  }, [historicalData]);

  // 2. Arrivals Trend: Last 30 trading days with 7d moving average
  const recentArrivalsTrend = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    const slice = historicalData.slice(-30);
    return slice.map((r, i, arr) => {
      const window7 = arr.slice(Math.max(0, i - 6), i + 1);
      const ma7 = Math.round(window7.reduce((s, x) => s + x.arrivals_quintals, 0) / window7.length);
      return {
        date: r.date.substring(5),
        fullDate: r.date,
        arrivals: r.arrivals_quintals,
        ma7
      };
    });
  }, [historicalData]);

  // 3. Rainfall vs Volatility Correlation: Monsoon & High Volatility months slice
  const rainfallVsVolatility = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    return historicalData.slice(-60).map((r) => ({
      date: r.date.substring(5),
      fullDate: r.date,
      rainfall: r.rainfall_mm,
      volatility: r.realized_volatility_14d
    }));
  }, [historicalData]);

  // 4. Volatility Forecast Trajectory (From real model inference)
  const forecastChartData = useMemo(() => {
    if (!latestForecast?.forecast?.daily_trajectory) return [];
    const anchor = latestForecast.reference_date || '';
    const windowInfo = anchor ? calculate14DayForecastWindow(anchor) : null;
    return latestForecast.forecast.daily_trajectory.map((d, index) => {
      const liveDay = windowInfo?.dailyDates[index];
      return {
        day: d.day,
        dayLabel: liveDay ? liveDay.formattedDate : d.formatted_date,
        date: liveDay ? liveDay.date : d.date,
        volatility: d.volatility_pct,
        lower_bound: d.lower_bound_vol,
        upper_bound: d.upper_bound_vol,
        price_median: d.projected_price_median,
        price_min: d.projected_price_min,
        price_max: d.projected_price_max,
        volatility_band: d.volatility_band || [d.lower_bound_vol, d.upper_bound_vol]
      };
    });
  }, [latestForecast]);

  const volatilityValue = isModelConnected && latestForecast
    ? `${latestForecast.forecast.predicted_volatility_pct}%`
    : summary
    ? `${summary.current14dVolatility}% (Historical)`
    : '—';

  const riskCategory = isModelConnected && latestForecast
    ? latestForecast.forecast.risk_level
    : summary?.riskLevel || 'Low';

  const riskBadgeLabel =
    riskCategory === 'Very High' || riskCategory === 'High'
      ? t('dashboard.riskHigh')
      : riskCategory === 'Moderate'
      ? t('dashboard.riskModerate')
      : t('dashboard.riskLow');

  const riskDesc =
    riskCategory === 'Very High' || riskCategory === 'High'
      ? t('dashboard.riskHighDesc')
      : riskCategory === 'Moderate'
      ? t('dashboard.riskModerateDesc')
      : t('dashboard.riskLowDesc');

  const riskVariant =
    riskCategory === 'Very High' || riskCategory === 'High' ? 'high' : riskCategory === 'Moderate' ? 'moderate' : 'low';

  return (
    <div className="space-y-6">
      {/* Offline banner if ML service disconnected */}
      {!isModelConnected && <ModelOfflineBanner onReconnect={onReconnectModel} />}

      {/* Volatility Alert Banner if elevated */}
      {isModelConnected && (riskCategory === 'Moderate' || riskCategory === 'High') && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">{t('alerts.alertTitle')}: </span>
            <span>{t('alerts.highVolWarning')}</span>
          </div>
          <button
            onClick={onNavigateToForecast}
            className="text-amber-950 font-bold hover:underline shrink-0 font-mono text-[11px]"
          >
            {t('dashboard.inspectDetails')} →
          </button>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Latest Tur Dal Price */}
        <KpiCard
          title={t('dashboard.latestPrice')}
          value={summary ? summary.latestPrice : '—'}
          unit="₹/quintal"
          changeValue={summary ? summary.priceChange14dPct : undefined}
          changePeriod={t('dashboard.vs14DaysAgo')}
          isPositiveGood={false}
          contextText={summary ? `Min: ₹${summary.minPrice.toLocaleString()} · Max: ₹${summary.maxPrice.toLocaleString()}` : ''}
          icon={TrendingUp}
        />

        {/* KPI 2: Predicted 14-Day Volatility */}
        <KpiCard
          title={t('dashboard.predictedVolatility')}
          value={volatilityValue}
          unit={isModelConnected && latestForecast ? t('dashboard.annualizedSigma') : ''}
          changeValue={
            latestForecast
              ? Number((latestForecast.forecast.predicted_volatility_pct - latestForecast.forecast.baseline_market_volatility).toFixed(2))
              : undefined
          }
          changePeriod={t('dashboard.vsMarketBaseline')}
          isPositiveGood={false}
          contextText={
            isModelConnected
              ? `${t('dashboard.forecastHorizon')} ${latestForecast?.forecast_period?.display_range || '14 Days'}`
              : t('dashboard.serviceOffline')
          }
          badgeText={isModelConnected ? t('dashboard.trainedModelActive') : t('dashboard.serviceOffline')}
          badgeVariant={isModelConnected ? 'low' : 'high'}
          icon={Sparkles}
          onClick={onNavigateToForecast}
        />

        {/* KPI 3: Market Risk Classification */}
        <KpiCard
          title={t('dashboard.riskLevel')}
          value={riskBadgeLabel}
          unit={t('dashboard.riskBand')}
          neutralTrend={true}
          badgeText={riskBadgeLabel}
          badgeVariant={riskVariant}
          contextText={riskDesc}
          icon={AlertTriangle}
        />

        {/* KPI 4: Latest Mandi Arrivals */}
        <KpiCard
          title={t('dashboard.latestArrivals')}
          value={summary ? summary.latestArrivals : '—'}
          unit="quintals/day"
          changeValue={
            summary
              ? Number((((summary.latestArrivals - summary.avgArrivals7d) / summary.avgArrivals7d) * 100).toFixed(1))
              : undefined
          }
          changePeriod={t('dashboard.vs7DayAvg')}
          isPositiveGood={true}
          contextText={summary ? `7-day avg: ${summary.avgArrivals7d.toLocaleString()} qtl/day` : ''}
          icon={Package}
        />
      </div>

      {/* Maharashtra Market Heatmap Preview Widget (Mandated in brief) */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">{t('dashboard.mapPreviewTitle')}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              {(['production', 'volatility', 'rainfall', 'price', 'risk'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMapMetric(m)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors text-[11px] ${
                    mapMetric === m ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={onNavigateToMap}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#18482E] hover:bg-[#123622] transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap"
            >
              <span>{t('dashboard.openFullMap')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <MaharashtraMap
          mode="preview"
          activeMetric={mapMetric}
          onChangeMetric={setMapMetric}
          summary={summary}
          forecast={latestForecast}
          onOpenFullMap={onNavigateToMap}
        />
      </div>

      {/* Row 2: Main Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Historical Price Trend (90 Days) */}
        <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('dashboard.historicalPriceTrend')}</h2>
            </div>
            <div className="text-xs font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded">
              Unit: ₹/quintal
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recentPriceTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E34" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1B5E34" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  minTickGap={20}
                />
                <YAxis
                  domain={['dataMin - 300', 'dataMax + 300']}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val.toLocaleString()}`}
                  width={68}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800">
                          <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                            {data.fullDate}
                          </div>
                          <div className="font-mono tabular-nums text-emerald-400 font-bold text-sm">
                            Modal: ₹{data.modal_price.toLocaleString()}/qtl
                          </div>
                          <div className="text-slate-400 mt-1 flex justify-between gap-4 font-mono">
                            <span>Min: ₹{data.min_price}</span>
                            <span>Max: ₹{data.max_price}</span>
                          </div>
                          <div className="text-slate-400 mt-1 font-mono">
                            14d Volatility: {data.volatility}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="modal_price"
                  stroke="#1B5E34"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                  name="Modal Price"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 14-Day Volatility Forecast Curve */}
        <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{t('dashboard.volatilityForecast')}</h2>
                {isModelConnected && (
                  <span className="text-[10px] font-semibold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                    Trained Model Active
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onNavigateToForecast}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>{t('dashboard.inspectDetails')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isModelConnected && forecastChartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                    width={46}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800">
                            <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                              Day {data.day}: {data.date} ({data.dayLabel})
                            </div>
                            <div className="font-mono text-emerald-400 font-bold text-sm">
                              Predicted Volatility: {data.volatility}%
                            </div>
                            <div className="text-slate-400 mt-1 font-mono">
                              90% Band: {data.lower_bound}% – {data.upper_bound}%
                            </div>
                            <div className="text-slate-400 mt-1 font-mono">
                              Projected Corridor: ₹{data.price_min?.toLocaleString()} – ₹{data.price_max?.toLocaleString()}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volatility_band"
                    stroke="none"
                    fill="#34D399"
                    fillOpacity={0.20}
                    name="90% Confidence Corridor"
                  />
                  <Line
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="#34D399"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Upper Bound (90% CI)"
                  />
                  <Line
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="#34D399"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Lower Bound (90% CI)"
                  />
                  <Line
                    type="monotone"
                    dataKey="volatility"
                    stroke="#059669"
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: '#059669', strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                    name="Expected Volatility"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50/50">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
              <div className="text-sm font-semibold text-slate-800">Model Inference Unavailable</div>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Forecasting model is currently disconnected. Reconnect the ML backend to render the 14-day volatility corridor.
              </p>
              <button
                onClick={onReconnectModel}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              >
                Reconnect Backend
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Mandi Arrivals Trend + Rainfall vs Volatility Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Mandi Arrivals Trend */}
        <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('dashboard.arrivalsTrend')}</h2>
            </div>
            <div className="text-xs font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded">
              Unit: Quintals
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={recentArrivalsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                  width={46}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800">
                          <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                            {data.fullDate}
                          </div>
                          <div className="font-mono text-emerald-400 font-bold">
                            Arrivals: {data.arrivals.toLocaleString()} quintals
                          </div>
                          <div className="text-slate-400 mt-1 font-mono">
                            7-Day Avg: {data.ma7.toLocaleString()} quintals
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="arrivals"
                  fill="#86EFAC"
                  radius={[3, 3, 0, 0]}
                  name="Daily Arrivals"
                />
                <Line
                  type="monotone"
                  dataKey="ma7"
                  stroke="#166534"
                  strokeWidth={2}
                  dot={false}
                  name="7-Day Moving Avg"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Rainfall vs Volatility Correlation */}
        <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('dashboard.rainfallVsVolatility')}</h2>
            </div>
            <div className="text-xs font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded">
              Dual Axis
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rainfallVsVolatility} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  minTickGap={16}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#166534' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={42}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#0284C7' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}mm`}
                  width={42}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800">
                          <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">
                            {data.fullDate}
                          </div>
                          <div className="font-mono text-emerald-400 font-semibold">
                            Volatility: {data.volatility}%
                          </div>
                          <div className="font-mono text-sky-400 font-semibold mt-1">
                            Rainfall: {data.rainfall} mm
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="rainfall"
                  fill="#7DD3FC"
                  radius={[2, 2, 0, 0]}
                  name="Rainfall (mm)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="volatility"
                  stroke="#15803D"
                  strokeWidth={2}
                  dot={false}
                  name="Realized Volatility (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Dynamic AI Market Insights */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{t('dashboard.dynamicInsights')}</h2>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {summary ? `${t('dashboard.asOf')} ${summary.latestDate}` : 'Real-time'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                      item.sentiment.includes('high_risk') || item.sentiment.includes('tight')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.sentiment.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {item.takeaway}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-700">
                <strong className="text-emerald-800 font-medium">{t('dashboard.advisory')} </strong>
                {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
