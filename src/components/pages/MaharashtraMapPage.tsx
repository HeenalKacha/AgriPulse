import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Filter,
  Calendar,
  Layers,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { MaharashtraMap, MapMetric } from '../MaharashtraMap';
import { useLanguage } from '../../context/LanguageContext';
import { MarketSummary, PredictionResult, CommodityConfig } from '../../types';
import { getIndiaTodayDateString } from '../../utils/dateUtils';

interface MaharashtraMapPageProps {
  summary: MarketSummary | null;
  forecast: PredictionResult | null;
  commodities: CommodityConfig[];
}

export const MaharashtraMapPage: React.FC<MaharashtraMapPageProps> = ({
  summary,
  forecast,
  commodities
}) => {
  const { t, language } = useLanguage();
  const todayIndia = useMemo(() => getIndiaTodayDateString(), []);
  const [activeMetric, setActiveMetric] = useState<MapMetric>('volatility');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('tur_dal');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    summary?.latestDate || todayIndia
  );

  const divisions = [
    { id: 'all', label: 'All Divisions' },
    { id: 'Konkan', label: 'Konkan Division' },
    { id: 'Pune', label: 'Pune Division' },
    { id: 'Nashik', label: 'Nashik (Khandesh) Division' },
    { id: 'Chhatrapati Sambhajinagar', label: 'Marathwada Division' },
    { id: 'Amravati', label: 'Amravati (Vidarbha) Division' },
    { id: 'Nagpur', label: 'Nagpur (Vidarbha) Division' }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filter Toolbar */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {t('pageTitles.mapTitle')}
              </h2>
              <span className="text-[10px] font-semibold font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                State-Wide GIS Grid
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('pageTitles.mapSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
            <span>Mumbai APMC: <strong className="text-emerald-700">Verified Live Feed</strong></span>
            <span>·</span>
            <span>Other 35 Districts: <strong className="text-amber-700">Agronomic Baseline (Estimated)</strong></span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Commodity Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('map.filterCommodity')}
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.status === 'active' ? '(Connected)' : '(Coming Soon)'}
                </option>
              ))}
              <option value="masoor" disabled>
                Masoor Dal (Lentil) · Coming Soon
              </option>
            </select>
          </div>

          {/* Division / Region Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Division / Market Region
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('map.filterDate')}
            </label>
            <input
              type="date"
              min="2021-01-01"
              max={todayIndia}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Maharashtra Map */}
      <MaharashtraMap
        mode="full"
        activeMetric={activeMetric}
        onChangeMetric={setActiveMetric}
        summary={summary}
        forecast={forecast}
        selectedDivision={selectedDivision}
        onSelectDivision={setSelectedDivision}
      />

      {/* Methodology & Integrity Notice */}
      <div className="bg-[#143224] text-white rounded-xl p-5 shadow-xs border border-[#1E4533]">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200 font-mono">
            Data Integrity & Geographic Coverage
          </h3>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          Districts without live electronic feeds display baseline agronomic estimates. Verified electronic feeds and 14-day forecasts are active for Mumbai APMC.
        </p>
      </div>
    </div>
  );
};
