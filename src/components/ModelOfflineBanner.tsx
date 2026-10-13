import React from 'react';
import { AlertOctagon, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';

interface ModelOfflineBannerProps {
  onReconnect: () => void;
  isReconnecting?: boolean;
}

export const ModelOfflineBanner: React.FC<ModelOfflineBannerProps> = ({
  onReconnect,
  isReconnecting
}) => {
  return (
    <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl p-5 mb-6 text-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              ML Forecasting Service Unavailable
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 font-mono">
                Disconnected
              </span>
            </h3>
            <p className="text-xs text-rose-800 mt-1 max-w-2xl leading-relaxed">
              The forecasting backend is unreachable. Predictions will resume once reconnected.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReconnect}
            disabled={isReconnecting}
            className="px-3.5 py-2 text-xs font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'Reconnecting...' : 'Attempt Reconnect'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
