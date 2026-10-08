import React from 'react';
import {
  Layers,
  Sprout,
  Compass,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CloudRain
} from 'lucide-react';
import { CommodityConfig, MarketConfig } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AboutPageProps {
  commodities: CommodityConfig[];
  markets: MarketConfig[];
}

export const AboutPage: React.FC<AboutPageProps> = ({ commodities, markets }) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero Mission Card */}
      <div className="bg-[#143224] text-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#1E4533]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
            {t('about.heroTag')}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          {t('about.heroTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
          {t('about.heroDesc')}
        </p>
      </div>

      {/* Current Scope & Pulse Dynamics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('about.scopeTurTitle')}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {t('about.scopeTurDesc')}
          </p>
          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Benchmark Variety:</span>
              <span className="font-semibold">Desi / Fatka Dal</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Cultivation Belt:</span>
              <span className="font-semibold">Marathwada & Vidarbha</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Peak Harvest Influx:</span>
              <span className="font-semibold">December – February</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Lean Season:</span>
              <span className="font-semibold">July – September</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('about.scopeApmcTitle')}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {t('about.scopeApmcDesc')}
          </p>
          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Market Role:</span>
              <span className="font-semibold">Terminal Wholesale Hub</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Daily Trade Flow:</span>
              <span className="font-semibold">300 – 900 quintals/day</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Historical Dataset:</span>
              <span className="font-semibold">1,461 daily records (2021–2024)</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Price Metric:</span>
              <span className="font-semibold">Modal Traded Price (₹/quintal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extensible Architecture & Commodity Roadmap */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('about.scalableTitle')}</h3>
            <p className="text-xs text-slate-500">
              {t('about.scalableSub')}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Modular Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {commodities.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-lg border text-xs ${
                item.status === 'active'
                  ? 'border-emerald-300 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900">{item.name}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    item.status === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.status === 'active' ? t('nav.active') : t('nav.comingSoon')}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 italic mb-1">{item.scientificName}</div>
              <div className="text-[11px] text-slate-700 font-medium">Category: {item.category}</div>
              <div className="text-[10px] text-slate-500 mt-2">Variety: {item.variety}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Price Volatility Matters */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          {t('about.whyVolTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-600" />
              <span>1. Monsoon Vulnerability</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Because pulses are predominantly rainfed, a 30-day monsoon hiatus during vegetative growth causes immediate supply panic, as witnessed during the 2023 El Niño drought.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>2. Terminal Arrival Lags</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Transportation bottlenecks and localized holding by primary mandis create sudden supply drops at Mumbai APMC, amplifying short-term price variance.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>3. Festive Demand Waves</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Dussehra and Diwali festival seasons (October–November) consistently cause institutional demand surges, testing spot buffer reserves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
