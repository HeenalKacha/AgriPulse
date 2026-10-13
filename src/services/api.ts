import {
  MarketRegistry,
  MarketSummary,
  ModelStatus,
  MarketInsightsResponse,
  HistoricalRecord,
  PredictionResult
} from '../types';

export const API_BASE = '/api';

export async function fetchConfig(): Promise<MarketRegistry> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to load market configuration');
  const json = await res.json();
  return json.data;
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  const res = await fetch(`${API_BASE}/model/status`);
  if (!res.ok) throw new Error('Failed to fetch ML model status');
  return res.json();
}

export async function toggleModelConnection(disconnect?: boolean): Promise<{ success: boolean; connected: boolean }> {
  const res = await fetch(`${API_BASE}/model/toggle-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disconnect })
  });
  if (!res.ok) throw new Error('Failed to toggle model connection state');
  return res.json();
}

export async function fetchMarketSummary(): Promise<MarketSummary> {
  const res = await fetch(`${API_BASE}/market/summary`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Service Unavailable' }));
    throw new Error(err.error || 'Failed to fetch market summary');
  }
  return res.json();
}

export async function fetchMarketInsights(): Promise<MarketInsightsResponse> {
  const res = await fetch(`${API_BASE}/market/insights`);
  if (!res.ok) throw new Error('Failed to fetch market insights');
  return res.json();
}

export interface HistoricalQueryParams {
  startDate?: string;
  endDate?: string;
  aggregation?: 'daily' | 'weekly' | 'monthly';
  search?: string;
  limit?: number;
}

export async function fetchHistoricalData(params?: HistoricalQueryParams): Promise<HistoricalRecord[]> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  if (params?.aggregation) query.set('aggregation', params.aggregation);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/historical?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch historical data');
  const json = await res.json();
  return json.data;
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
