import {
  MarketRegistry,
  MarketSummary,
  ModelStatus,
  MarketInsightsResponse,
  HistoricalRecord,
  PredictionResult,
  MarketInsightItem
} from '../types';

/**
 * Resolves the API base URL.
 * In development / full-stack: defaults to '/api'.
 * In production (e.g. Vercel): if VITE_API_URL is configured, directs requests to the deployed backend.
 */
function resolveApiBase(): string {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '').trim();
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

export const API_BASE = resolveApiBase();

/**
 * Standard baseline market registry fallback when backend is unreachable.
 */
export const DEFAULT_MARKET_REGISTRY: MarketRegistry = {
  activeCommodityId: 'tur_dal',
  activeMarketId: 'mumbai_apmc',
  commodities: [
    {
      id: 'tur_dal',
      name: 'Tur Dal (Pigeon Pea / Arhar)',
      scientificName: 'Cajanus cajan',
      category: 'Kharif Pulse',
      status: 'active',
      variety: 'Desi / Fatka',
      standardUnit: '₹/quintal',
      benchmarkMSP: '₹7,550/quintal (2024-25)',
      majorBelts: ['Marathwada', 'Vidarbha', 'Gulbarga', 'Indore'],
      currentMarket: 'Mumbai APMC'
    },
    {
      id: 'chana_dal',
      name: 'Chana Dal (Gram / Chickpea)',
      scientificName: 'Cicer arietinum',
      category: 'Rabi Pulse',
      status: 'upcoming',
      variety: 'Desi / Kantewala',
      standardUnit: '₹/quintal',
      currentMarket: 'Akola APMC'
    },
    {
      id: 'moong_dal',
      name: 'Moong Dal (Green Gram)',
      scientificName: 'Vigna radiata',
      category: 'Kharif/Summer Pulse',
      status: 'upcoming',
      variety: 'Chamki / Shiny',
      standardUnit: '₹/quintal',
      currentMarket: 'Latur APMC'
    },
    {
      id: 'urad_dal',
      name: 'Urad Dal (Black Matpe)',
      scientificName: 'Vigna mungo',
      category: 'Kharif Pulse',
      status: 'upcoming',
      variety: 'FAQ / SQ',
      standardUnit: '₹/quintal',
      currentMarket: 'Jalgaon APMC'
    }
  ],
  markets: [
    {
      id: 'mumbai_apmc',
      name: 'Mumbai APMC (Vashi)',
      state: 'Maharashtra',
      type: 'Terminal Wholesale Hub',
      status: 'active',
      location: 'Navi Mumbai',
      tradingHours: '08:00 AM - 04:00 PM IST',
      supportedCommodities: ['tur_dal']
    },
    {
      id: 'akola_apmc',
      name: 'Akola APMC',
      state: 'Maharashtra',
      type: 'Primary Producing Mandi',
      status: 'upcoming',
      location: 'Vidarbha Region',
      supportedCommodities: ['tur_dal', 'chana_dal']
    },
    {
      id: 'latur_apmc',
      name: 'Latur APMC',
      state: 'Maharashtra',
      type: 'Major Pulse Trading Center',
      status: 'upcoming',
      location: 'Marathwada Region',
      supportedCommodities: ['tur_dal', 'moong_dal', 'urad_dal']
    }
  ]
};

/**
 * Genuine offline model status when backend is not reachable.
 * Accurately communicates disconnected state without fake/mock success.
 */
export const DEFAULT_OFFLINE_MODEL_STATUS: ModelStatus = {
  connected: false,
  simulatedDisconnected: false,
  serviceStatus: 'UNAVAILABLE',
  commodity: 'Tur Dal (Pigeon Pea)',
  market: 'Mumbai APMC',
  modelSignature: 'CatBoostRegressor-v1.4',
  trainingHorizon: '2021-2024',
  totalTrainedRecords: 1433,
  featureCount: 18,
  statusMessage: 'Trained CatBoost ML backend is currently offline or unreachable. Real-time volatility forecasting will resume once reconnected.'
};

/**
 * Baseline market summary when backend is offline.
 */
export const DEFAULT_MARKET_SUMMARY: MarketSummary = {
  success: true,
  commodity: 'Tur Dal (Pigeon Pea)',
  market: 'Mumbai APMC',
  latestDate: '2026-10-14',
  latestPrice: 10115,
  minPrice: 9581,
  maxPrice: 10616,
  priceUnit: '₹/quintal',
  priceChange14d: -130,
  priceChange14dPct: -1.27,
  priceChange7d: -26,
  priceChange7dPct: -0.26,
  latestArrivals: 909,
  avgArrivals7d: 739,
  avgPrice30d: 10165,
  arrivalsUnit: 'quintals/day',
  rainfallLatestMm: 0,
  rainfallDeficitPct: 0,
  isMonsoonSeason: false,
  current14dVolatility: 11.56,
  riskLevel: 'High',
  modelConnected: false
};

/**
 * Baseline market insights when backend is offline.
 */
export const DEFAULT_MARKET_INSIGHTS: MarketInsightItem[] = [
  {
    id: 'ins-1',
    title: 'Mandi Dispatches & Supply Absorption',
    category: 'Arrivals Dynamics',
    sentiment: 'bullish_supply',
    takeaway: 'Current Mumbai APMC daily arrivals stand at 909 quintals against the 30-day baseline of 739 quintals.',
    recommendation: 'Terminal mandi arrivals remain steady; wholesale spreads are expected to trade within normal bands.'
  },
  {
    id: 'ins-2',
    title: 'Monsoon Sowing & Deficit Risk Indicator',
    category: 'Agro-Climatic',
    sentiment: 'normal',
    takeaway: 'Monsoon moisture reserves in cultivation clusters remain balanced in post-monsoon cycle.',
    recommendation: 'Monitor weekly reservoir capacity and post-monsoon pod development reports from Akola and Latur research stations.'
  },
  {
    id: 'ins-3',
    title: 'Procurement & Buffer Stock Advisory',
    category: 'Market Strategy',
    sentiment: 'balanced',
    takeaway: 'Spot modal price is ₹10,115/qtl (30-day average: ₹10,165/qtl).',
    recommendation: 'Maintain a 14-day rolling buffer stock. Institutional buyers should utilize staggered procurement to minimize peak-day premium exposure.'
  }
];

export async function fetchConfig(): Promise<MarketRegistry> {
  try {
    const res = await fetch(`${API_BASE}/config`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      return json.data || DEFAULT_MARKET_REGISTRY;
    }
  } catch {
    // Network / offline fallback
  }
  return DEFAULT_MARKET_REGISTRY;
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  try {
    const res = await fetch(`${API_BASE}/model/status`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      return json;
    }
    // Check if error response contained structured model status JSON
    if (contentType.includes('application/json')) {
      try {
        const errJson = await res.json();
        if (typeof errJson?.connected === 'boolean') {
          return errJson;
        }
      } catch {
        // ignore JSON parse error
      }
    }
    return {
      ...DEFAULT_OFFLINE_MODEL_STATUS,
      statusMessage: `Trained CatBoost ML backend is offline (HTTP ${res.status}). Verify backend deployment and VITE_API_URL.`
    };
  } catch {
    return {
      ...DEFAULT_OFFLINE_MODEL_STATUS,
      statusMessage: 'Unable to reach ML backend service. Verify that the backend server is running and VITE_API_URL is configured.'
    };
  }
}

export async function toggleModelConnection(disconnect?: boolean): Promise<{ success: boolean; connected: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/model/toggle-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disconnect })
    });
    if (!res.ok) {
      return { success: false, connected: false };
    }
    return await res.json();
  } catch {
    return { success: false, connected: false };
  }
}

export async function fetchMarketSummary(): Promise<MarketSummary> {
  try {
    const res = await fetch(`${API_BASE}/market/summary`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Network or server error
  }
  return DEFAULT_MARKET_SUMMARY;
}

export async function fetchMarketInsights(): Promise<MarketInsightsResponse> {
  try {
    const res = await fetch(`${API_BASE}/market/insights`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Network or server error
  }
  return {
    success: true,
    updatedAt: '2026-10-14',
    insights: DEFAULT_MARKET_INSIGHTS
  };
}

export interface HistoricalQueryParams {
  startDate?: string;
  endDate?: string;
  aggregation?: 'daily' | 'weekly' | 'monthly';
  search?: string;
  limit?: number;
}

export async function fetchHistoricalData(params?: HistoricalQueryParams): Promise<HistoricalRecord[]> {
  try {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.aggregation) query.set('aggregation', params.aggregation);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/historical?${query.toString()}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      return json.data || [];
    }
  } catch {
    // Network or server error
  }
  return [];
}

export interface PredictionPayload {
  forecast_date?: string;
  modal_price?: number;
  arrivals_quintals?: number;
  rainfall_7d_sum?: number;
  rainfall_deficit_pct?: number;
}

export async function generateForecast(payload: PredictionPayload): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict-volatility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    json = { message: `Service error (${res.status}): Server returned unexpected response format.` };
  }

  if (!res.ok) {
    const errorMsg = json.message || json.error || 'Failed to generate forecast from ML model';
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.errorType = json.error_type || 'MODEL_UNAVAILABLE';
    throw err;
  }
  return json;
}
