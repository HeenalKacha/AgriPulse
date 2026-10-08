export interface CommodityConfig {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  status: 'active' | 'upcoming';
  variety: string;
  standardUnit: string;
  benchmarkMSP?: string;
  majorBelts?: string[];
  currentMarket?: string;
}

export interface MarketConfig {
  id: string;
  name: string;
  state: string;
  type: string;
  status: 'active' | 'upcoming';
  location: string;
  tradingHours?: string;
  supportedCommodities: string[];
}

export interface MarketRegistry {
  activeCommodityId: string;
  activeMarketId: string;
  commodities: CommodityConfig[];
  markets: MarketConfig[];
}

export interface MarketSummary {
  success: boolean;
  commodity: string;
  market: string;
  latestDate: string;
  latestPrice: number;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  priceChange14d: number;
  priceChange14dPct: number;
  priceChange7d: number;
  priceChange7dPct: number;
  latestArrivals: number;
  avgArrivals7d: number;
  avgPrice30d: number;
  arrivalsUnit: string;
  rainfallLatestMm: number;
  rainfallDeficitPct: number;
  isMonsoonSeason: boolean;
  current14dVolatility: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  modelConnected: boolean;
}

export interface ModelStatus {
  connected: boolean;
  simulatedDisconnected: boolean;
  serviceStatus: 'OPERATIONAL' | 'UNAVAILABLE';
  commodity: string;
  market: string;
  modelSignature: string;
  trainingHorizon: string;
  totalTrainedRecords: number;
  featureCount: number;
  statusMessage: string;
}

export interface MarketInsightItem {
  id: string;
  title: string;
  category: string;
  sentiment: string;
  takeaway: string;
  recommendation: string;
}

export interface MarketInsightsResponse {
  success: boolean;
  updatedAt: string;
  insights: MarketInsightItem[];
}

export interface DailyTrajectoryPoint {
  day: number;
  date: string;
  formatted_date: string;
  volatility_pct: number;
  lower_bound_vol: number;
  upper_bound_vol: number;
  projected_price_median: number;
  projected_price_min: number;
  projected_price_max: number;
  price_corridor?: [number, number];
  volatility_band?: [number, number];
}

export interface ContributingFactor {
  name: string;
  impact_points: number;
  direction: 'upward' | 'downward';
  significance: 'High Impact' | 'Moderate Impact' | 'Low Impact';
  current_value: number;
  explanation: string;
}

export interface PredictionResult {
  success: boolean;
  commodity: string;
  market: string;
  reference_date: string;
  forecast_period: {
    start_date: string;
    end_date: string;
    display_range: string;
  };
  latest_features: {
    modal_price: number;
    arrivals_quintals: number;
    arrivals_7d_ma: number;
    rainfall_7d_mm: number;
    monsoon_deficit_pct: number;
    historical_volatility_14d: number;
    price_change_7d_pct: number;
  };
  forecast: {
    predicted_volatility_pct: number;
    risk_level: 'Low' | 'Moderate' | 'High' | 'Very High' | string;
    risk_description: string;
    baseline_market_volatility: number;
    daily_trajectory: DailyTrajectoryPoint[];
    contributing_factors: ContributingFactor[];
    explanation: string;
  };
  model_metadata?: {
    model_connected: boolean;
    model_version: string;
    training_sample_count: number;
    feature_signature: string;
  };
  error_type?: string;
  message?: string;
}

export interface HistoricalRecord {
  date: string;
  periodLabel?: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrivals_quintals: number;
  rainfall_mm: number;
  is_monsoon?: boolean;
  rainfall_deficit_pct?: number;
  realized_volatility_14d: number;
  commodity: string;
  market: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

