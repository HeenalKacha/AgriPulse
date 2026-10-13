import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Info,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { generateForecast } from '../../services/api';
import { PredictionResult, HistoricalRecord } from '../../types';
import { ModelOfflineBanner } from '../ModelOfflineBanner';
import { useLanguage } from '../../context/LanguageContext';
import { getIndiaTodayDateString, calculate14DayForecastWindow } from '../../utils/dateUtils';

interface PriceForecastPageProps {
  isModelConnected: boolean;
  onReconnectModel: () => void;
  historicalData: HistoricalRecord[];
  latestForecast: PredictionResult | null;
  onForecastUpdated: (result: PredictionResult) => void;
}

export const PriceForecastPage: React.FC<PriceForecastPageProps> = ({
  isModelConnected,
  onReconnectModel,
  historicalData,
  latestForecast,
  onForecastUpdated
}) => {
  const { t, language } = useLanguage();

  // Dynamic live date in India (Asia/Kolkata timezone)
  const todayIndia = useMemo(() => getIndiaTodayDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayIndia);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState<boolean>(false);

  // Feature overrides (auto-populated from historical record for chosen date)
  const [modalPriceInput, setModalPriceInput] = useState<string>('');
  const [arrivalsInput, setArrivalsInput] = useState<string>('');
  const [rainfall7dInput, setRainfall7dInput] = useState<string>('');
  const [deficitInput, setDeficitInput] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forecastResult, setForecastResult] = useState<PredictionResult | null>(latestForecast);

  // When selectedDate changes, auto-fetch historical features and trigger model inference
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    // If selected date is in historical data, use exact record; if live date (e.g. 2026),
    // use latest available verified market record as baseline features.
    const rec = historicalData.find((r) => r.date === selectedDate) || (historicalData.length > 0 ? historicalData[historicalData.length - 1] : null);
    if (rec) {
      setModalPriceInput(rec.modal_price.toString());
      setArrivalsInput(rec.arrivals_quintals.toString());
      setRainfall7dInput(rec.rainfall_mm.toString());
      setDeficitInput(rec.rainfall_deficit_pct !== undefined ? rec.rainfall_deficit_pct.toString() : '0');
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isModelConnected && selectedDate) {
      setIsLoading(true);
      setErrorMessage(null);
      generateForecast({ forecast_date: selectedDate })
        .then((result) => {
          setForecastResult(result);
          onForecastUpdated(result);
        })
        .catch((err: any) => {
          setErrorMessage(
            err.message || 'ML Model Service Unavailable: Could not communicate with CatBoost backend.'
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedDate, historicalData, isModelConnected]);

  // Keep forecastResult in sync with parent if updated elsewhere
  useEffect(() => {
    if (latestForecast) {
      setForecastResult(latestForecast);
    }
  }, [latestForecast]);

  const handleGenerateForecast = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        forecast_date: selectedDate
      };

      if (modalPriceInput.trim()) {
        payload.modal_price = parseFloat(modalPriceInput);
      }
      if (arrivalsInput.trim()) {
        payload.arrivals_quintals = parseFloat(arrivalsInput);
      }
      if (rainfall7dInput.trim()) {
        payload.rainfall_7d_sum = parseFloat(rainfall7dInput);
      }
      if (deficitInput.trim()) {
        payload.rainfall_deficit_pct = parseFloat(deficitInput);
      }

      const result = await generateForecast(payload);
      setForecastResult(result);
      onForecastUpdated(result);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'ML Model Service Unavailable: Could not communicate with the Python ML backend.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const riskLevel = forecastResult?.forecast?.risk_level || 'Low';
  const riskBadgeStyles: Record<string, string> = {
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    High: 'bg-rose-100 text-rose-800 border-rose-300',
    'Very High': 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
  };

  const getRiskLabel = (risk: string) => {
    if (risk === 'Very High' || risk === 'VERY HIGH') return 'Very High';
    if (risk === 'High') return t('dashboard.riskHigh');
    if (risk === 'Moderate') return t('dashboard.riskModerate');
    return t('dashboard.riskLow');
  };

  // Dynamic calculation of the future 14-day forecast window based on active anchor date
  const activeAnchorDate = selectedDate || forecastResult?.reference_date || todayIndia;

  const futureForecastWindow = useMemo(() => {
    return calculate14DayForecastWindow(activeAnchorDate);
  }, [activeAnchorDate]);

  // Trajectory chart points with dynamically updated 14 calendar dates matching activeAnchorDate
  const trajectoryChartData = useMemo(() => {
    if (!forecastResult?.forecast?.daily_trajectory) return [];
    const windowInfo = calculate14DayForecastWindow(activeAnchorDate);
    return forecastResult.forecast.daily_trajectory.map((d, index) => {
      const liveDayDate = windowInfo.dailyDates[index];
      return {
        ...d,
        date: liveDayDate ? liveDayDate.date : d.date,
        formatted_date: liveDayDate ? liveDayDate.formattedDate : d.formatted_date,
        price_corridor: d.price_corridor || [d.projected_price_min, d.projected_price_max],
        volatility_band: d.volatility_band || [d.lower_bound_vol, d.upper_bound_vol]
      };
    });
  }, [forecastResult, activeAnchorDate]);

  const getCommodityName = () => {
    if (language === 'hi') return 'तूर दाल (अरहर) · देसी फटका';
    if (language === 'mr') return 'तूर डाळ (अरहर) · देशी फटका';
    return 'Tur Dal (Pigeon Pea) · Desi Fatka';
  };

  return (
    <div className="space-y-6">
      {/* Offline banner if ML service is disconnected */}
      {!isModelConnected && <ModelOfflineBanner onReconnect={onReconnectModel} />}

      {/* Prediction Control Panel */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {t('forecast.panelTitle')}
              </h2>
              <span
                className={`text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded border ${
                  isModelConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {isModelConnected ? t('dashboard.trainedModelActive') : t('header.modelOffline')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>{showAdvancedInputs ? t('forecast.hideInputs') : t('forecast.inspectInputs')}</span>
            </button>

            <button
              onClick={handleGenerateForecast}
              disabled={isLoading || !isModelConnected}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-xs ${
                isLoading || !isModelConnected
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#18482E] text-white hover:bg-[#123622] active:bg-[#0B2416]'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('forecast.computing')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('forecast.generateBtn')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Selection Bar */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t('forecast.refDate')}
              </label>
              {selectedDate !== todayIndia && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayIndia)}
                  className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 hover:underline"
                >
                  <Clock className="w-3 h-3" />
                  <span>Reset to Today</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                min="2021-02-01"
                max={todayIndia}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('forecast.activeCommodity')}
            </label>
            <div className="text-xs px-3 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium flex items-center justify-between">
              <span>{getCommodityName()}</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase">{t('forecast.configured')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('forecast.targetMarket')}
            </label>
            <div className="text-xs px-3 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium flex items-center justify-between">
              <span>Mumbai APMC (Vashi Terminal)</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase">{t('forecast.terminalHub')}</span>
            </div>
          </div>
        </div>

        {/* Optional Custom Feature Overrides Panel */}
        {showAdvancedInputs && (
          <div className="mt-4 pt-4 border-t border-slate-200/70 bg-slate-50/70 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('forecast.customInputsTitle', { date: selectedDate })}
              </span>
            </div>

            {/* Quick Scenario Simulators for testing different risk classifications */}
            <div className="mb-3.5 pb-3 border-b border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Scenario Simulators:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalPriceInput('6400');
                    setArrivalsInput('800');
                    setRainfall7dInput('40');
                    setDeficitInput('0');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  🟢 0–5% Low
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalPriceInput('7600');
                    setArrivalsInput('500');
                    setRainfall7dInput('15');
                    setDeficitInput('0');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  🟡 5–10% Moderate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalPriceInput('9500');
                    setArrivalsInput('250');
                    setRainfall7dInput('5');
                    setDeficitInput('12');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  🟠 10–20% High
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalPriceInput('12500');
                    setArrivalsInput('90');
                    setRainfall7dInput('0');
                    setDeficitInput('28');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  🔴 &gt;20% Very High
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t('forecast.modalPrice')}
                </label>
                <input
                  type="number"
                  value={modalPriceInput}
                  onChange={(e) => setModalPriceInput(e.target.value)}
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t('forecast.mandiArrivals')}
                </label>
                <input
                  type="number"
                  value={arrivalsInput}
                  onChange={(e) => setArrivalsInput(e.target.value)}
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t('forecast.rainfall7d')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rainfall7dInput}
                  onChange={(e) => setRainfall7dInput(e.target.value)}
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t('forecast.monsoonDeficit')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={deficitInput}
                  onChange={(e) => setDeficitInput(e.target.value)}
                  placeholder="-30 for severe drought"
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error state if prediction failed or backend offline */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Inference Error: </strong>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Forecast Output Presentation (Rendered ONLY if genuine model output is present) */}
      {forecastResult && isModelConnected ? (
        <div className="space-y-6">
          {/* Top Results Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric 1: Predicted Volatility */}
            <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  {t('forecast.predVolTitle')}
                </span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {forecastResult.forecast.predicted_volatility_pct}%
                  </span>
                  <span className="text-xs text-slate-500">{t('dashboard.annualizedSigma')}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>{t('forecast.baseline')}</span>
                <span className="font-mono tabular-nums font-semibold text-slate-700">
                  {forecastResult.forecast.baseline_market_volatility}%
                </span>
              </div>
            </div>

            {/* Metric 2: Risk Category */}
            <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  {t('forecast.riskClass')}
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xl sm:text-2xl font-bold px-3 py-1 rounded-lg border font-mono ${
                      riskBadgeStyles[riskLevel as keyof typeof riskBadgeStyles] || 'bg-slate-100'
                    }`}
                  >
                    {forecastResult.forecast.predicted_volatility_pct > 20
                      ? 'VERY HIGH'
                      : getRiskLabel(riskLevel).toUpperCase()}
                  </span>
                  {forecastResult.forecast.predicted_volatility_pct > 20 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase font-mono">
                      &gt;20% Shock
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-snug">
                {forecastResult.forecast.risk_description}
              </p>
            </div>

            {/* Metric 3: Forecast Horizon */}
            <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  {t('forecast.forecastWindow')}
                </span>
                <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono mb-2">
                  {forecastResult.forecast_period?.display_range || futureForecastWindow.displayRange}
                </div>
              </div>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>{t('forecast.anchorDate')}</span>
                <span className="font-mono text-slate-700 font-semibold">
                  {forecastResult.reference_date || activeAnchorDate}
                </span>
              </div>
            </div>
          </div>

          {/* Volatility & Risk Classification Reference Scale */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700 shadow-2xs">
            <span className="font-bold text-slate-800 block mb-2 uppercase tracking-wider text-[11px]">
              Volatility Scale:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  forecastResult.forecast.predicted_volatility_pct < 5.0
                    ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-emerald-700 font-bold text-xs mb-0.5">0–5%</div>
                <div>Low</div>
              </div>
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  forecastResult.forecast.predicted_volatility_pct >= 5.0 &&
                  forecastResult.forecast.predicted_volatility_pct <= 10.0
                    ? 'bg-amber-100 border-amber-400 font-bold text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-amber-700 font-bold text-xs mb-0.5">5–10%</div>
                <div>Moderate</div>
              </div>
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  forecastResult.forecast.predicted_volatility_pct > 10.0 &&
                  forecastResult.forecast.predicted_volatility_pct <= 20.0
                    ? 'bg-rose-100 border-rose-400 font-bold text-rose-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-rose-700 font-bold text-xs mb-0.5">10–20%</div>
                <div>High</div>
              </div>
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  forecastResult.forecast.predicted_volatility_pct > 20.0
                    ? 'bg-purple-100 border-purple-400 font-bold text-purple-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-purple-700 font-bold text-xs mb-0.5">&gt;20%</div>
                <div>Very High</div>
              </div>
            </div>
          </div>

          {/* Interactive Forecast Visualization: Projected Volatility & Price Corridor */}
          <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('forecast.trajectoryTitle')}
                </h3>
              </div>
              <div className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {t('forecast.spotAnchor')} ₹{forecastResult.latest_features.modal_price.toLocaleString()}/qtl
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={trajectoryChartData}
                  margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
                  <XAxis
                    dataKey="formatted_date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  {/* Left Axis: Price Range */}
                  <YAxis
                    yAxisId="priceAxis"
                    domain={['dataMin - 150', 'dataMax + 150']}
                    tick={{ fontSize: 11, fill: '#166534' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val.toLocaleString()}`}
                    width={70}
                  />
                  {/* Right Axis: Volatility % */}
                  <YAxis
                    yAxisId="volAxis"
                    orientation="right"
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 11, fill: '#0284C7' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                    width={46}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs shadow-xl border border-slate-800 font-sans">
                            <div className="font-semibold text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700">
                              Day {d.day}: {d.date} ({d.formatted_date})
                            </div>
                            <div className="font-mono text-emerald-400 font-bold text-sm">
                              Projected Modal Price: ₹{d.projected_price_median?.toLocaleString()}/qtl
                            </div>
                            <div className="text-slate-300 font-mono mt-1">
                              90% Price Corridor: ₹{d.projected_price_min?.toLocaleString()} – ₹{d.projected_price_max?.toLocaleString()}
                            </div>
                            <div className="text-sky-300 font-mono mt-1.5 pt-1.5 border-t border-slate-800">
                              Volatility: {d.volatility_pct}% (CI: {d.lower_bound_vol}% – {d.upper_bound_vol}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                  />
                  <Area
                    yAxisId="priceAxis"
                    type="monotone"
                    dataKey="price_corridor"
                    fill="#86EFAC"
                    fillOpacity={0.22}
                    stroke="none"
                    name="90% Price Corridor"
                  />
                  <Line
                    yAxisId="priceAxis"
                    type="monotone"
                    dataKey="projected_price_max"
                    stroke="#86EFAC"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Upper Bound (90% CI)"
                  />
                  <Line
                    yAxisId="priceAxis"
                    type="monotone"
                    dataKey="projected_price_min"
                    stroke="#86EFAC"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Lower Bound (90% CI)"
                  />
                  <Line
                    yAxisId="priceAxis"
                    type="monotone"
                    dataKey="projected_price_median"
                    stroke="#15803D"
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: '#15803D' }}
                    name="Projected Modal Price (₹/qtl)"
                  />
                  <Line
                    yAxisId="volAxis"
                    type="monotone"
                    dataKey="volatility_pct"
                    stroke="#0284C7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2, fill: '#0284C7' }}
                    name="Projected Volatility (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Contributing Factors (SHAP-Style Agricultural Drivers) */}
          <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('forecast.contributingFactors')}</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Attribution Sum: {forecastResult.forecast.predicted_volatility_pct}%
              </span>
            </div>

            <div className="space-y-3">
              {forecastResult.forecast.contributing_factors.map((factor, idx) => {
                const isUp = factor.direction === 'upward';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{factor.name}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                            isUp
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isUp ? t('forecast.volDriver') : t('forecast.volBuffer')}
                        </span>
                        <span className="text-[10px] text-slate-400">· {factor.significance}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {factor.explanation}
                      </p>
                    </div>

                    <div className="text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200/70 pt-2 sm:pt-0 sm:pl-4">
                      <div
                        className={`text-sm font-extrabold font-mono tabular-nums ${
                          isUp ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {factor.impact_points > 0 ? `+${factor.impact_points}` : factor.impact_points}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Value: {factor.current_value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">{t('forecast.noForecastTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            {t('forecast.noForecastSub')}
          </p>
          <button
            onClick={handleGenerateForecast}
            disabled={!isModelConnected}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-xs ${
              !isModelConnected
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#18482E] text-white hover:bg-[#123622]'
            }`}
          >
            {t('forecast.runForecastNow')}
          </button>
        </div>
      )}
    </div>
  );
};
