/**
 * AgriPulse AI - Agricultural Market Forecasting Platform
 * Tur Dal 14-Day Volatility Forecasting at Mumbai APMC
 * Features: Interactive Maharashtra Heatmap, Multilingual i18n, Volatility Alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/pages/OverviewDashboard';
import { MaharashtraMapPage } from './components/pages/MaharashtraMapPage';
import { PriceForecastPage } from './components/pages/PriceForecastPage';
import { MarketTrendsPage } from './components/pages/MarketTrendsPage';
import { RainfallInsightsPage } from './components/pages/RainfallInsightsPage';
import { HistoricalDataPage } from './components/pages/HistoricalDataPage';
import { AboutPage } from './components/pages/AboutPage';
import { VolatilityAlertModal } from './components/VolatilityAlertModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { AgriCropLogo } from './components/AgriCropLogo';
import {
  fetchConfig,
  fetchModelStatus,
  fetchMarketSummary,
  fetchMarketInsights,
  fetchHistoricalData,
  generateForecast,
  toggleModelConnection
} from './services/api';
import {
  MarketRegistry,
  MarketSummary,
  ModelStatus,
  MarketInsightItem,
  HistoricalRecord,
  PredictionResult
} from './types';
import { RefreshCw, AlertCircle } from 'lucide-react';

function AppContent() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  // App data states
  const [config, setConfig] = useState<MarketRegistry | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [insights, setInsights] = useState<MarketInsightItem[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalRecord[]>([]);
  const [latestForecast, setLatestForecast] = useState<PredictionResult | null>(null);

  // Loading & error states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  // Load all initial data on mount
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    setAppError(null);

    try {
      // 1. Fetch Config & Status
      const [cfg, status, mktSummary, mktInsights, history] = await Promise.all([
        fetchConfig(),
        fetchModelStatus(),
        fetchMarketSummary().catch(() => null),
        fetchMarketInsights().catch(() => ({ success: true, updatedAt: '', insights: [] })),
        fetchHistoricalData().catch(() => [])
      ]);

      setConfig(cfg);
      setModelStatus(status);
      if (mktSummary) setSummary(mktSummary);
      if (mktInsights?.insights) setInsights(mktInsights.insights);
      if (history) setHistoricalData(history);

      // 2. Fetch initial forecast if model is connected
      if (status.connected) {
        try {
          const forecast = await generateForecast({});
          setLatestForecast(forecast);
        } catch {
          // Model forecast error handled gracefully
        }
      } else {
        setLatestForecast(null);
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
      setAppError(err.message || 'Failed to initialize market intelligence data.');
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Toggle model connection simulation (for testing service unavailable state)
  const handleToggleModelStatus = async () => {
    setIsReconnecting(true);
    try {
      await toggleModelConnection();
      const newStatus = await fetchModelStatus();
      setModelStatus(newStatus);

      if (newStatus.connected) {
        const forecast = await generateForecast({});
        setLatestForecast(forecast);
      } else {
        setLatestForecast(null);
      }
    } catch (err: any) {
      console.error('Failed to toggle model connection:', err);
    } finally {
      setIsReconnecting(false);
    }
  };

  // Reconnect model when offline
  const handleReconnectModel = async () => {
    setIsReconnecting(true);
    try {
      await toggleModelConnection(false); // Force connect
      const newStatus = await fetchModelStatus();
      setModelStatus(newStatus);
      if (newStatus.connected) {
        const forecast = await generateForecast({});
        setLatestForecast(forecast);
      }
    } catch (err: any) {
      console.error('Reconnect failed:', err);
    } finally {
      setIsReconnecting(false);
    }
  };

  const isModelConnected = modelStatus?.connected ?? false;

  // 1. Check Authentication Status: Show loading spinner during session resolution
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex flex-col items-center justify-center p-6 text-center">
        <AgriCropLogo size="lg" variant="badge" className="mb-4 shadow-md animate-pulse" />
        <h2 className="text-base font-bold text-slate-800 tracking-tight">AgriPulse AI</h2>
        <p className="text-xs text-slate-500 mt-1">Verifying encrypted authentication session...</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-800">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Authenticating user access</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to Login / Sign Up Page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // 3. Initial Market & ML Data Loading
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex flex-col items-center justify-center p-6 text-center">
        <AgriCropLogo size="lg" variant="badge" className="mb-4 shadow-md animate-pulse" />
        <h2 className="text-base font-bold text-slate-800 tracking-tight">AgriPulse AI</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to Mumbai APMC Tur Dal ML Pipeline...</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-800">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Synchronizing historical arrivals & precipitation models</span>
        </div>
      </div>
    );
  }

  if (appError && !summary) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-600 mb-3" />
        <h2 className="text-base font-bold text-slate-900">Application Error</h2>
        <p className="text-xs text-slate-600 max-w-md mt-1 mb-4">{appError}</p>
        <button
          onClick={() => loadData(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4D31] hover:bg-[#153E27] rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        commodities={config?.commodities || []}
        activeCommodityId={config?.activeCommodityId || 'tur_dal'}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isModelConnected={isModelConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activePage={activePage}
          onOpenMobile={() => setIsMobileOpen(true)}
          isModelConnected={isModelConnected}
          onToggleModelStatus={handleToggleModelStatus}
          onGenerateQuickForecast={() => setActivePage('forecast')}
          lastUpdatedDate={summary?.latestDate}
          isRefreshing={isRefreshing}
          onRefreshData={() => loadData(true)}
          hasActiveAlert={summary?.riskLevel === 'High' || summary?.riskLevel === 'Moderate'}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'overview' && (
            <OverviewDashboard
              summary={summary}
              historicalData={historicalData}
              latestForecast={latestForecast}
              insights={insights}
              isModelConnected={isModelConnected}
              onNavigateToForecast={() => setActivePage('forecast')}
              onNavigateToMap={() => setActivePage('maharashtra-map')}
              onReconnectModel={handleReconnectModel}
            />
          )}

          {activePage === 'maharashtra-map' && (
            <MaharashtraMapPage
              summary={summary}
              forecast={latestForecast}
              commodities={config?.commodities || []}
            />
          )}

          {activePage === 'forecast' && (
            <PriceForecastPage
              isModelConnected={isModelConnected}
              onReconnectModel={handleReconnectModel}
              historicalData={historicalData}
              latestForecast={latestForecast}
              onForecastUpdated={setLatestForecast}
            />
          )}

          {activePage === 'market-trends' && (
            <MarketTrendsPage historicalData={historicalData} />
          )}

          {activePage === 'rainfall-insights' && (
            <RainfallInsightsPage historicalData={historicalData} />
          )}

          {activePage === 'historical-data' && (
            <HistoricalDataPage historicalData={historicalData} />
          )}

          {activePage === 'about' && (
            <AboutPage
              commodities={config?.commodities || []}
              markets={config?.markets || []}
            />
          )}
        </main>
      </div>

      {/* Volatility Alerts Drawer / Modal */}
      <VolatilityAlertModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        summary={summary}
        forecast={latestForecast}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
