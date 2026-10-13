import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  BarChart3,
  CloudRain,
  Database,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { CommodityConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AgriCropLogo } from './AgriCropLogo';

export type PageId =
  | 'overview'
  | 'maharashtra-map'
  | 'forecast'
  | 'market-trends'
  | 'rainfall-insights'
  | 'historical-data'
  | 'about';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  commodities: CommodityConfig[];
  activeCommodityId: string;
  onSelectCommodity?: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isModelConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  commodities,
  activeCommodityId,
  isMobileOpen,
  onCloseMobile,
  isModelConnected
}) => {
  const { t, language } = useLanguage();
  const [commodityDropdownOpen, setCommodityDropdownOpen] = React.useState(false);

  const navItems = [
    {
      id: 'overview' as PageId,
      label: t('nav.overview'),
      icon: LayoutDashboard
    },
    {
      id: 'maharashtra-map' as PageId,
      label: t('nav.map'),
      icon: MapPin
    },
    {
      id: 'forecast' as PageId,
      label: t('nav.forecast'),
      icon: TrendingUp
    },
    {
      id: 'market-trends' as PageId,
      label: t('nav.marketTrends'),
      icon: BarChart3
    },
    {
      id: 'rainfall-insights' as PageId,
      label: t('nav.rainfallInsights'),
      icon: CloudRain
    },
    {
      id: 'historical-data' as PageId,
      label: t('nav.historicalData'),
      icon: Database
    },
    {
      id: 'about' as PageId,
      label: t('nav.about'),
      icon: Info
    }
  ];

  const activeCommodity = commodities.find(c => c.id === activeCommodityId) || commodities[0];

  const getCommodityName = (c: CommodityConfig) => {
    if (c.id === 'tur_dal') {
      if (language === 'hi') return 'तूर दाल (अरहर)';
      if (language === 'mr') return 'तूर डाळ (अरहर)';
    }
    return c.name;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#122A1E] text-slate-200 border-r border-[#1B3C2B] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup with New Agriculture / Crop Logo */}
        <div className="p-5 border-b border-[#1B3C2B] bg-[#0E2218]">
          <div className="flex items-center gap-3">
            <AgriCropLogo size="md" variant="badge" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">AgriPulse AI</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 font-medium">{t('brand.tagline')}</p>
            </div>
          </div>
        </div>

        {/* Commodity & Market Selector Badge */}
        <div className="p-3 border-b border-[#1B3C2B] bg-[#143224]/40">
          <div className="text-[11px] text-slate-400 font-medium px-2 mb-1.5 flex items-center justify-between">
            <span>{t('nav.activeCommodity')}</span>
            <span className="text-emerald-400 text-[10px]">Mumbai APMC</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setCommodityDropdownOpen(!commodityDropdownOpen)}
              className="w-full text-left px-3 py-2 rounded-lg bg-[#1B3C2B] hover:bg-[#234B36] border border-[#2A543D] transition-colors flex items-center justify-between group"
            >
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {getCommodityName(activeCommodity)}
                </div>
                <div className="text-[10px] text-slate-300">
                  {activeCommodity?.variety || 'Desi / Fatka'} · {t('nav.mumbaiTerminal')}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-emerald-300 shrink-0 transition-transform group-hover:text-white" />
            </button>

            {commodityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#122A1E] border border-[#2A543D] rounded-lg shadow-xl z-30 py-1 overflow-hidden">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('nav.supportedCommodities')}
                </div>
                {commodities.map((item) => (
                  <div
                    key={item.id}
                    className={`px-3 py-2 text-xs flex items-center justify-between ${
                      item.status === 'active'
                        ? 'text-white bg-emerald-950/60 font-medium'
                        : 'text-slate-400 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{getCommodityName(item)}</div>
                      <div className="text-[10px] text-slate-400">{item.variety}</div>
                    </div>
                    {item.status === 'active' ? (
                      <span className="text-[10px] text-emerald-400 font-medium">{t('nav.active')}</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">{t('nav.comingSoon')}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-emerald-400/80 uppercase">
            {t('nav.platformNav')}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 group relative ${
                  isActive
                    ? 'bg-emerald-600/30 text-white border-l-3 border-emerald-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#1B3C2B]/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* System & Model Status Footer */}
        <div className="p-3 border-t border-[#1B3C2B] bg-[#0E2218]/90 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{t('nav.mlBackend')}</span>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                isModelConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isModelConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isModelConnected ? t('nav.connected') : t('nav.offline')}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
