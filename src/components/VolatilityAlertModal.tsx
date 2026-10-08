import React, { useState } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  TrendingUp,
  CloudRain,
  Package,
  CheckCircle2,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MarketSummary, PredictionResult } from '../types';

interface VolatilityAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MarketSummary | null;
  forecast: PredictionResult | null;
}

export const VolatilityAlertModal: React.FC<VolatilityAlertModalProps> = ({
  isOpen,
  onClose,
  summary,
  forecast
}) => {
  const { t, language } = useLanguage();
  const [volatilityThreshold, setVolatilityThreshold] = useState<number>(18);
  const [enableArrivalAlerts, setEnableArrivalAlerts] = useState<boolean>(true);
  const [enableWeatherAlerts, setEnableWeatherAlerts] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentVol = forecast?.forecast?.predicted_volatility_pct || summary?.current14dVolatility || 16.4;
  const isVolTriggered = currentVol >= volatilityThreshold;
  const isArrivalTriggered = enableArrivalAlerts && (summary?.latestArrivals || 0) < (summary?.avgArrivals7d || 500);
  const isWeatherTriggered = enableWeatherAlerts && (summary?.rainfallDeficitPct || 0) < -15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#143224] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {t('alerts.alertTitle')}
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                Automated risk triggers for Tur Dal at Mumbai APMC
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Alerts List */}
        <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {/* Volatility Threshold Alert */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isVolTriggered
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 ${isVolTriggered ? 'text-rose-600' : 'text-emerald-600'}`} />
                <span>14-Day Volatility Trigger ({volatilityThreshold}% Threshold)</span>
              </span>
              <span
                className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isVolTriggered ? 'bg-rose-200/70 text-rose-900' : 'bg-emerald-200/70 text-emerald-900'
                }`}
              >
                {isVolTriggered ? 'TRIGGERED' : 'NORMAL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Current 14-day volatility stands at <strong>{currentVol}%</strong> against your alert ceiling of {volatilityThreshold}%.
            </p>
          </div>

          {/* Mandi Arrival Compression Alert */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isArrivalTriggered
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <Package className={`w-3.5 h-3.5 ${isArrivalTriggered ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>Mandi Supply Inflow Alert</span>
              </span>
              <span
                className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isArrivalTriggered ? 'bg-amber-200/70 text-amber-900' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isArrivalTriggered ? 'BELOW 7D AVG' : 'HEALTHY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {t('alerts.supplyNotice')} (Latest: {summary?.latestArrivals} qtl vs 7d avg: {summary?.avgArrivals7d} qtl).
            </p>
          </div>

          {/* Alert Configuration Controls */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Alert Trigger Settings
            </span>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Volatility Ceiling Trigger:</span>
                  <span className="font-mono font-bold text-slate-900">{volatilityThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={volatilityThreshold}
                  onChange={(e) => setVolatilityThreshold(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Arrival Disruption Alerts:</span>
                <input
                  type="checkbox"
                  checked={enableArrivalAlerts}
                  onChange={(e) => setEnableArrivalAlerts(e.target.checked)}
                  className="accent-emerald-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Monsoon Deficit Triggers:</span>
                <input
                  type="checkbox"
                  checked={enableWeatherAlerts}
                  onChange={(e) => setEnableWeatherAlerts(e.target.checked)}
                  className="accent-emerald-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#18482E] hover:bg-[#123622] rounded-lg transition-colors"
          >
            {t('alerts.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
};
