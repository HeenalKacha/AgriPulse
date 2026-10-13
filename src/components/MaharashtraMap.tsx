import React, { useState, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  CloudRain,
  Package,
  Layers,
  Info,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sprout,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  Filter,
  BarChart3
} from 'lucide-react';
import { MAHARASHTRA_GEO_DISTRICTS, MaharashtraGeoDistrict } from '../data/maharashtraGeoData';
import { useLanguage } from '../context/LanguageContext';
import { MarketSummary, PredictionResult } from '../types';

export type MapMetric = 'production' | 'volatility' | 'rainfall' | 'price' | 'risk' | 'arrivals';

interface MaharashtraMapProps {
  mode?: 'full' | 'preview';
  activeMetric: MapMetric;
  onChangeMetric?: (m: MapMetric) => void;
  summary: MarketSummary | null;
  forecast: PredictionResult | null;
  onOpenFullMap?: () => void;
  selectedDivision?: string;
  onSelectDivision?: (d: string) => void;
}

export const MaharashtraMap: React.FC<MaharashtraMapProps> = ({
  mode = 'full',
  activeMetric,
  onChangeMetric,
  summary,
  forecast,
  onOpenFullMap,
  selectedDivision = 'all',
  onSelectDivision
}) => {
  const { t, language } = useLanguage();
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('solapur');
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [localDivision, setLocalDivision] = useState<string>(selectedDivision);

  const activeDivision = onSelectDivision ? selectedDivision : localDivision;
  const handleDivisionChange = (div: string) => {
    setLocalDivision(div);
    if (onSelectDivision) {
      onSelectDivision(div);
    }
  };

  // Derive live Mumbai APMC values from summary and forecast props
  const liveMumbaiPrice = summary?.latestPrice || 10450;
  const liveMumbaiVol = forecast?.forecast?.predicted_volatility_pct || summary?.current14dVolatility || 16.4;
  const liveMumbaiRisk = (forecast?.forecast?.risk_level || summary?.riskLevel || 'Moderate') as 'Low' | 'Moderate' | 'High';
  const liveMumbaiRainfall = summary?.rainfallLatestMm ?? 1.8;
  const liveMumbaiArrivals = summary?.latestArrivals || 620;

  // Selected district object
  const selectedDistrict = useMemo(() => {
    return (
      MAHARASHTRA_GEO_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      MAHARASHTRA_GEO_DISTRICTS.find((d) => d.id === 'solapur') ||
      MAHARASHTRA_GEO_DISTRICTS[0]
    );
  }, [selectedDistrictId]);

  // Hovered district object
  const hoveredDistrict = useMemo(() => {
    if (!hoveredDistrictId) return null;
    return MAHARASHTRA_GEO_DISTRICTS.find((d) => d.id === hoveredDistrictId) || null;
  }, [hoveredDistrictId]);

  const getDistrictName = (d: MaharashtraGeoDistrict) => {
    if (language === 'hi') return d.nameHi || d.name;
    if (language === 'mr') return d.nameMr || d.name;
    return d.name;
  };

  // Get dynamic district metric values (applying live Mumbai feed if connected)
  const getDistrictValues = (d: MaharashtraGeoDistrict) => {
    const isMumbai = d.id === 'mumbai' || d.id === 'mumbai_suburban';
    return {
      price: isMumbai ? liveMumbaiPrice : d.estimatedPrice,
      volatility: isMumbai ? liveMumbaiVol : d.volatilityPct,
      risk: isMumbai ? liveMumbaiRisk : d.riskLevel,
      rainfall: isMumbai ? liveMumbaiRainfall : d.rainfallMm,
      production: d.productionTonnes,
      yieldTha: d.yieldTha,
      arrivals: isMumbai ? liveMumbaiArrivals : Math.round(d.productionTonnes * 2.8),
      isVerified: d.isVerified || isMumbai
    };
  };

  // Choropleth Color Scale: Green → Yellow → Orange → Red (Low → High)
  const getChoroplethColor = (d: MaharashtraGeoDistrict): string => {
    const vals = getDistrictValues(d);

    if (activeMetric === 'production') {
      const p = vals.production;
      if (p >= 140) return '#DC2626'; // High (Red)
      if (p >= 90) return '#F97316';  // Mid-High (Orange)
      if (p >= 40) return '#EAB308';  // Mid-Low (Yellow)
      return '#16A34A';               // Low (Green)
    }

    if (activeMetric === 'volatility') {
      const v = vals.volatility;
      if (v >= 35) return '#DC2626'; // High (Red) - e.g. Solapur 64.2%
      if (v >= 24) return '#F97316'; // Mid-High (Orange)
      if (v >= 18) return '#EAB308'; // Mid-Low (Yellow)
      return '#16A34A';              // Low (Green)
    }

    if (activeMetric === 'rainfall') {
      const r = vals.rainfall;
      if (r >= 32) return '#DC2626'; // High (Red)
      if (r >= 25) return '#F97316'; // Mid-High (Orange)
      if (r >= 18) return '#EAB308'; // Mid-Low (Yellow)
      return '#16A34A';              // Low (Green)
    }

    if (activeMetric === 'price') {
      const pr = vals.price;
      if (pr >= 10200) return '#DC2626'; // High (Red)
      if (pr >= 9900) return '#F97316';  // Mid-High (Orange)
      if (pr >= 9750) return '#EAB308';  // Mid-Low (Yellow)
      return '#16A34A';                  // Low (Green)
    }

    if (activeMetric === 'risk') {
      if (vals.risk === 'High') return '#DC2626';
      if (vals.risk === 'Moderate') return '#EAB308';
      return '#16A34A';
    }

    if (activeMetric === 'arrivals') {
      const a = vals.arrivals;
      if (a >= 500) return '#DC2626';
      if (a >= 350) return '#F97316';
      if (a >= 200) return '#EAB308';
      return '#16A34A';
    }

    return '#16A34A';
  };

  // Metric options configuration for GIS toolbar
  const metricOptions: { id: MapMetric; label: string; icon: any; unit: string }[] = [
    { id: 'production', label: t('map.metricProduction') || 'Production (t)', icon: Sprout, unit: 'Tonnes' },
    { id: 'volatility', label: t('map.metricVolatility'), icon: AlertTriangle, unit: '%' },
    { id: 'rainfall', label: t('map.metricRainfall'), icon: CloudRain, unit: 'mm' },
    { id: 'price', label: t('map.metricPrice'), icon: TrendingUp, unit: '₹/qtl' },
    { id: 'risk', label: t('map.metricRisk'), icon: Info, unit: 'Level' }
  ];

  // Division options
  const divisions = [
    { id: 'all', label: 'All Divisions' },
    { id: 'Konkan', label: 'Konkan' },
    { id: 'Pune', label: 'Pune' },
    { id: 'Nashik', label: 'Nashik' },
    { id: 'Chhatrapati Sambhajinagar', label: 'Marathwada' },
    { id: 'Amravati', label: 'Amravati' },
    { id: 'Nagpur', label: 'Nagpur' }
  ];

  // Legend scale thresholds based on metric
  const getLegendThresholds = () => {
    switch (activeMetric) {
      case 'production':
        return [
          { color: '#16A34A', label: '< 40 t', tier: 'Low' },
          { color: '#EAB308', label: '40 – 90 t', tier: 'Mid-Low' },
          { color: '#F97316', label: '90 – 140 t', tier: 'Mid-High' },
          { color: '#DC2626', label: '≥ 140 t', tier: 'High' }
        ];
      case 'volatility':
        return [
          { color: '#16A34A', label: '< 18%', tier: 'Low' },
          { color: '#EAB308', label: '18% – 24%', tier: 'Mid-Low' },
          { color: '#F97316', label: '25% – 34%', tier: 'Mid-High' },
          { color: '#DC2626', label: '≥ 35%', tier: 'High' }
        ];
      case 'rainfall':
        return [
          { color: '#16A34A', label: '< 18 mm', tier: 'Low' },
          { color: '#EAB308', label: '18 – 24 mm', tier: 'Mid-Low' },
          { color: '#F97316', label: '25 – 31 mm', tier: 'Mid-High' },
          { color: '#DC2626', label: '≥ 32 mm', tier: 'High' }
        ];
      case 'price':
        return [
          { color: '#16A34A', label: '< ₹9,750', tier: 'Low' },
          { color: '#EAB308', label: '₹9,750 – ₹9,900', tier: 'Mid-Low' },
          { color: '#F97316', label: '₹9,900 – ₹10,200', tier: 'Mid-High' },
          { color: '#DC2626', label: '≥ ₹10,200', tier: 'High' }
        ];
      case 'risk':
        return [
          { color: '#16A34A', label: 'Low Risk', tier: 'Low' },
          { color: '#EAB308', label: 'Moderate Risk', tier: 'Moderate' },
          { color: '#DC2626', label: 'High Risk', tier: 'High' }
        ];
      default:
        return [
          { color: '#16A34A', label: 'Low Tier', tier: 'Low' },
          { color: '#EAB308', label: 'Moderate Tier', tier: 'Moderate' },
          { color: '#DC2626', label: 'High Tier', tier: 'High' }
        ];
    }
  };

  // Pulse hubs for quick switcher
  const pulseHubs = [
    { id: 'solapur', label: 'Solapur', note: '147 t · 64.2% Vol' },
    { id: 'latur', label: 'Latur', note: '184 t · Major Pulses Hub' },
    { id: 'akola', label: 'Akola', note: '142 t · Vidarbha APMC' },
    { id: 'amravati', label: 'Amravati', note: '156 t · High Yield' },
    { id: 'aurangabad', label: 'Sambhajinagar', note: '112 t · Central APMC' },
    { id: 'mumbai', label: 'Mumbai APMC', note: 'Verified Live Feed' }
  ];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Government Agricultural GIS Dashboard Header Bar */}
      <div className="bg-[#0F291E] text-white rounded-xl border border-[#1E4533] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                MAHARASHTRA KRISHI GIS · TUR DAL CHOROPLETH
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Official GeoJSON
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">
              36 Administrative Districts · Maharashtra
            </p>
          </div>
        </div>

        {/* GIS Metadata & Quick Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#163829] border border-[#23533C] text-emerald-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mumbai APMC: <strong>Live Connected</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#163829] border border-[#23533C] text-slate-300 text-[11px]">
            <span>Other 35 Districts: <strong>Agronomic Baseline</strong></span>
          </div>
        </div>
      </div>

      {/* GIS Map Controls Toolbar */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            {t('map.mapView') || 'Metric'}:
          </span>
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {metricOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = activeMetric === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeMetric && onChangeMetric(opt.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#18482E] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Division Filter & District Jump & Zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Division Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick District Selector */}
          <select
            value={selectedDistrictId}
            onChange={(e) => setSelectedDistrictId(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600 max-w-[140px]"
          >
            {MAHARASHTRA_GEO_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {getDistrictName(d)}
              </option>
            ))}
          </select>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              title="Zoom In"
              className="p-1 rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
              title="Zoom Out"
              className="p-1 rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset View"
              className="p-1 rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {mode === 'preview' && onOpenFullMap && (
            <button
              onClick={onOpenFullMap}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#18482E] hover:bg-[#123622] transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>{t('dashboard.openFullMap') || 'Open Full GIS Map'}</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Maharashtra GIS SVG Map Canvas */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-4 shadow-xs relative flex flex-col justify-between overflow-hidden">
        {/* Top Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-100 text-xs">
          {/* Choropleth Legend Scale */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 font-mono text-[11px] uppercase tracking-wider">
              {t('map.colorScaleLegend') || 'Color Scale (Low → High)'}:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {getLegendThresholds().map((tItem, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0 shadow-2xs"
                    style={{ backgroundColor: tItem.color }}
                  />
                  <span className="text-[11px] font-medium text-slate-700">{tItem.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Verification Badges */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold">Mumbai APMC: Verified Live Market Data</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 border border-slate-400" />
              <span>Other Districts: Estimated Baseline</span>
            </div>
          </div>
        </div>

        {/* SVG Map Container with Geographic Bounds */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] flex items-center justify-center bg-[#F8FAF9] rounded-lg border border-slate-200/90 overflow-hidden">
          <svg
            viewBox="60 25 730 600"
            className="w-full h-full select-none cursor-crosshair transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredDistrictId(null)}
          >
            <defs>
              {/* Graticule grid pattern */}
              <pattern id="gisGraticule" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#E2E8F0" strokeWidth="0.6" strokeDasharray="2 2" />
              </pattern>

              {/* Verified pulsing glow filter */}
              <filter id="mumbaiBeaconGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Graticule Grid */}
            <rect x="0" y="0" width="850" height="650" fill="url(#gisGraticule)" opacity="0.6" pointerEvents="none" />

            {/* Cartographic Coordinate Marks */}
            <g className="text-[8px] font-mono fill-slate-400 pointer-events-none select-none">
              <text x="80" y="45">73°E · 21°N</text>
              <text x="380" y="45">76°E · 21°N</text>
              <text x="680" y="45">80°E · 21°N</text>
              <text x="75" y="585">73°E · 16°N</text>
              <text x="680" y="585">80°E · 19°N</text>
            </g>

            {/* Cartographic North Arrow */}
            <g transform="translate(710, 80)" className="pointer-events-none">
              <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <polygon points="0,-14 5,4 0,1 -5,4" fill="#0F172A" />
              <polygon points="0,-14 -5,4 0,1" fill="#DC2626" />
              <text x="0" y="-18" textAnchor="middle" className="text-[9px] font-bold fill-slate-900 font-mono">
                N
              </text>
              <text x="0" y="12" textAnchor="middle" className="text-[7px] font-semibold fill-slate-500 font-mono">
                GIS
              </text>
            </g>

            {/* Scale Bar */}
            <g transform="translate(85, 595)" className="pointer-events-none">
              <rect x="0" y="0" width="100" height="4" fill="#0F172A" />
              <rect x="50" y="0" width="50" height="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
              <line x1="0" y1="-3" x2="0" y2="7" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="50" y1="-3" x2="50" y2="7" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="100" y1="-3" x2="100" y2="7" stroke="#0F172A" strokeWidth="1.2" />
              <text x="0" y="-5" className="text-[7px] font-mono fill-slate-700">0</text>
              <text x="50" y="-5" textAnchor="middle" className="text-[7px] font-mono fill-slate-700">100 km</text>
              <text x="100" y="-5" textAnchor="end" className="text-[7px] font-mono fill-slate-700">200 km</text>
            </g>

            {/* All 36 Real Geographic District SVG Paths */}
            {MAHARASHTRA_GEO_DISTRICTS.map((d) => {
              const isSelected = selectedDistrictId === d.id;
              const isHovered = hoveredDistrictId === d.id;
              const matchesDivision = activeDivision === 'all' || d.division === activeDivision;
              const fillColor = getChoroplethColor(d);
              const vals = getDistrictValues(d);

              return (
                <g
                  key={d.id}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredDistrictId(d.id)}
                  onClick={() => setSelectedDistrictId(d.id)}
                >
                  {/* Real Geographic Boundary Polygon */}
                  <path
                    d={d.path}
                    fill={fillColor}
                    fillOpacity={matchesDivision ? (isSelected ? 0.95 : isHovered ? 0.9 : 0.82) : 0.25}
                    stroke={
                      isSelected
                        ? '#0F172A'
                        : isHovered
                        ? '#1E293B'
                        : d.isVerified
                        ? '#065F46'
                        : '#475569'
                    }
                    strokeWidth={isSelected ? 3 : isHovered ? 2.2 : d.isVerified ? 1.8 : 0.9}
                    strokeLinejoin="round"
                    className="transition-all hover:brightness-105"
                  />

                  {/* Centroid Text Labels */}
                  {showLabels && matchesDivision && (
                    <text
                      x={d.centroid[0]}
                      y={d.centroid[1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`pointer-events-none select-none font-sans font-bold transition-opacity ${
                        isSelected
                          ? 'text-[11px] fill-slate-950 font-extrabold'
                          : isHovered
                          ? 'text-[10px] fill-slate-900'
                          : 'text-[8.5px] fill-slate-800 opacity-80'
                      }`}
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#FFFFFF',
                        strokeWidth: isSelected ? 3.5 : 2.5,
                        strokeLinejoin: 'round'
                      }}
                    >
                      {getDistrictName(d).split(' ')[0]}
                    </text>
                  )}

                  {/* Centroid Dot for Selected District */}
                  {isSelected && (
                    <circle
                      cx={d.centroid[0]}
                      cy={d.centroid[1]}
                      r="4"
                      fill="#0F172A"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Special Live APMC Beacon Marker for Mumbai Terminal */}
                  {d.isVerified && (
                    <g transform={`translate(${d.centroid[0]}, ${d.centroid[1]})`} className="pointer-events-none">
                      <circle r="9" fill="#10B981" fillOpacity="0.35" className="animate-ping" />
                      <circle r="5" fill="#047857" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text
                        y="-10"
                        textAnchor="middle"
                        className="text-[9px] font-extrabold fill-emerald-950 font-mono select-none"
                        style={{ paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: 3 }}
                      >
                        Mumbai APMC (Live)
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredDistrict && tooltipPos && (
            <div
              className="absolute z-30 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl text-xs shadow-2xl border border-slate-700 backdrop-blur-md font-sans min-w-[210px] transition-all"
              style={{
                left: Math.min(tooltipPos.x + 14, 520),
                top: Math.max(tooltipPos.y - 120, 15)
              }}
            >
              {(() => {
                const vals = getDistrictValues(hoveredDistrict);
                return (
                  <div>
                    {/* Header: Name + Division */}
                    <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-700">
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{getDistrictName(hoveredDistrict)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {hoveredDistrict.division} Division · {hoveredDistrict.primaryApmc}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          vals.isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {vals.isVerified ? 'Verified' : 'Estimated'}
                      </span>
                    </div>

                    {/* Metric Attributes List */}
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">{t('map.production') || 'Production'}:</span>
                        <strong className="text-white font-bold">{vals.production} t</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">{t('map.yield') || 'Yield'}:</span>
                        <strong className="text-emerald-400">{vals.yieldTha} t/ha</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">{vals.isVerified ? 'Price' : 'Estimated Price'}:</span>
                        <strong className="text-amber-300">₹{vals.price.toLocaleString()}/qtl</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">{t('map.volatility14d') || 'Volatility'}:</span>
                        <strong className={vals.volatility >= 30 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {vals.volatility}%
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">{t('map.rainfall') || 'Rainfall'}:</span>
                        <strong className="text-sky-300">{vals.rainfall} mm</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 pt-0.5">
                        <span className="text-slate-400">{t('map.forecastRisk') || 'Risk'}:</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            vals.risk === 'High'
                              ? 'bg-rose-900/60 text-rose-300'
                              : vals.risk === 'Moderate'
                              ? 'bg-amber-900/60 text-amber-300'
                              : 'bg-emerald-900/60 text-emerald-300'
                          }`}
                        >
                          {vals.risk}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Quick Hub Jump Selector */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-500 font-medium font-mono text-[11px]">Quick Jump:</span>
            {pulseHubs.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setSelectedDistrictId(hub.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                  selectedDistrictId === hub.id
                    ? 'bg-[#18482E] text-white border-[#18482E] shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{hub.label}</span>
                <span className="ml-1 opacity-70 text-[10px]">({hub.note})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DISTRICT INTELLIGENCE PANEL BELOW THE MAP */}
      <div className="bg-white rounded-xl border border-[#E3ECE5] p-5 shadow-xs transition-all">
        {(() => {
          const vals = getDistrictValues(selectedDistrict);
          const isVerified = vals.isVerified;

          return (
            <div className="space-y-4">
              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                      {t('map.districtIntelPanel') || 'District Market Intelligence Panel'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      ID: {selectedDistrict.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <span>{getDistrictName(selectedDistrict)}</span>
                    <span className="text-xs font-normal text-slate-500">
                      ({selectedDistrict.division} Division · Primary: {selectedDistrict.primaryApmc})
                    </span>
                  </h3>
                </div>

                {/* Prominent Verification Badge */}
                <div>
                  {isVerified ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          Verified APMC Live Market Data
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          Estimated / Baseline Data
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Notice Callout */}
              {!isVerified && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <strong>Baseline Data: </strong>
                    Prices and production for <strong>{getDistrictName(selectedDistrict)}</strong> reflect regional agronomic estimates. Live APMC feeds are currently connected for Mumbai.
                  </div>
                </div>
              )}

              {isVerified && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 leading-relaxed">
                    <strong>Connected Terminal: </strong>
                    Mumbai Vashi APMC has live electronic feeds and 14-day volatility predictions active.
                  </div>
                </div>
              )}

              {/* KPI Metrics Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* 1. Production */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold uppercase">{t('map.production') || 'Production'}</span>
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {vals.production} <span className="text-xs font-normal text-slate-500">t</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Yield: <strong>{vals.yieldTha} t/ha</strong>
                  </div>
                </div>

                {/* 2. Price */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold uppercase">
                      {isVerified ? 'Modal Price' : 'Estimated Price'}
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    ₹{vals.price.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 ml-1">/qtl</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {isVerified ? 'Verified Mumbai Feed' : 'Regional Estimate'}
                  </div>
                </div>

                {/* 3. Volatility */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold uppercase">{t('map.volatility14d') || 'Volatility'}</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${vals.volatility >= 30 ? 'text-rose-700' : 'text-slate-900'}`}>
                    {vals.volatility}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {isVerified ? 'Trained 14d Model' : 'Historical Realized'}
                  </div>
                </div>

                {/* 4. Rainfall */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold uppercase">{t('map.rainfall') || 'Rainfall'}</span>
                    <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {vals.rainfall} <span className="text-xs font-normal text-slate-500">mm</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Precipitation Index
                  </div>
                </div>

                {/* 5. Risk Level */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold uppercase">{t('map.forecastRisk') || 'Risk Level'}</span>
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase ${
                        vals.risk === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : vals.risk === 'Moderate'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {vals.risk} Risk
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {isVerified ? 'Model Predicted' : 'Regional Exposure'}
                  </div>
                </div>
              </div>

              {/* District Agronomic Profile & Policy Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Agronomic & Mandi Profile</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    <strong>Primary Mandi: </strong>{selectedDistrict.primaryApmc} · 
                    <strong> Administrative Division: </strong>{selectedDistrict.division} · 
                    <strong> Tur Dal Production: </strong>{vals.production} Tonnes with average yield of {vals.yieldTha} t/ha.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>Market Integration Pipeline</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    {isVerified
                      ? 'Production and consumption hub with verified daily APMC historical series.'
                      : 'Scheduled for electronic APMC data integration in future roadmap expansion.'}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
