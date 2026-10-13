import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Globe,
  ChevronDown,
  Bell,
  Check
} from 'lucide-react';
import { PageId } from './Sidebar';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

interface HeaderProps {
  activePage: PageId;
  onOpenMobile: () => void;
  isModelConnected: boolean;
  onToggleModelStatus: () => void;
  onGenerateQuickForecast: () => void;
  lastUpdatedDate?: string;
  isRefreshing?: boolean;
  onRefreshData: () => void;
  hasActiveAlert?: boolean;
  onOpenAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onOpenMobile,
  isModelConnected,
  onToggleModelStatus,
  onGenerateQuickForecast,
  lastUpdatedDate,
  isRefreshing,
  onRefreshData,
  hasActiveAlert = true,
  onOpenAlerts
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageMeta = (page: PageId) => {
    switch (page) {
      case 'overview':
        return {
          title: t('pageTitles.overviewTitle'),
          subtitle: t('pageTitles.overviewSubtitle')
        };
      case 'maharashtra-map':
        return {
          title: t('pageTitles.mapTitle'),
          subtitle: t('pageTitles.mapSubtitle')
        };
      case 'forecast':
        return {
          title: t('pageTitles.forecastTitle'),
          subtitle: t('pageTitles.forecastSubtitle')
        };
      case 'market-trends':
        return {
          title: t('pageTitles.trendsTitle'),
          subtitle: t('pageTitles.trendsSubtitle')
        };
      case 'rainfall-insights':
        return {
          title: t('pageTitles.rainfallTitle'),
          subtitle: t('pageTitles.rainfallSubtitle')
        };
      case 'historical-data':
        return {
          title: t('pageTitles.historyTitle'),
          subtitle: t('pageTitles.historySubtitle')
        };
      case 'about':
        return {
          title: t('pageTitles.aboutTitle'),
          subtitle: t('pageTitles.aboutSubtitle')
        };
      default:
        return {
          title: t('pageTitles.overviewTitle'),
          subtitle: t('pageTitles.overviewSubtitle')
        };
    }
  };

  const currentMeta = getPageMeta(activePage);
  const currentLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const getCommodityDisplayName = () => {
    if (language === 'hi') return 'तूर दाल (अरहर)';
    if (language === 'mr') return 'तूर डाळ (अरहर)';
    return 'Tur Dal (Pigeon Pea)';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3ECE5] px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Left: Mobile trigger & Page context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{getCommodityDisplayName()}</span>
            <span aria-hidden="true">·</span>
            <span>Mumbai APMC</span>
            {lastUpdatedDate && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-600">
                  {t('header.refDate')} {lastUpdatedDate}
                </span>
              </>
            )}
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Language Selector, Alerts & Model status test toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multilingual Selector: 🌐 English ▾ / 🌐 हिंदी ▾ / 🌐 मराठी ▾ */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            aria-expanded={langDropdownOpen}
            aria-label="Select language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-medium">{currentLangOption.nativeLabel}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                {t('header.language')} / Language
              </div>
              {SUPPORTED_LANGUAGES.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLanguage(opt.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    language === opt.code
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{opt.nativeLabel}</span>
                    <span className="text-[10px] text-slate-400">{opt.label}</span>
                  </div>
                  {language === opt.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volatility Alert Button */}
        {onOpenAlerts && (
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Volatility Alerts"
          >
            <Bell className="w-4 h-4" />
            {hasActiveAlert && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        )}

        {/* Model connection status pill & simulation toggle */}
        <button
          onClick={onToggleModelStatus}
          title={isModelConnected ? 'Model connected. Click to toggle state.' : 'Model disconnected. Click to reconnect.'}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
            isModelConnected
              ? 'bg-[#F2F8F4] text-[#1B5E34] border-[#D2E7D8] hover:bg-[#E5F2E9]'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          {isModelConnected ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{t('header.modelConnected')}</span>
              <span className="sm:hidden">Live</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{t('header.modelOffline')}</span>
              <span className="sm:hidden">Offline</span>
            </>
          )}
          <span className="text-[10px] text-slate-400 border-l border-slate-300/80 pl-1.5">
            {t('header.testToggle')}
          </span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={t('header.refreshTitle')}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Primary Action Button */}
        {activePage !== 'forecast' && (
          <button
            onClick={onGenerateQuickForecast}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4D31] hover:bg-[#153E27] active:bg-[#0F2F1D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('header.generateForecast')}</span>
            <span className="md:hidden">Forecast</span>
          </button>
        )}
      </div>
    </header>
  );
};
