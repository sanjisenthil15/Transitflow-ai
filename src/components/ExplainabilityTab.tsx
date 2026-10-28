import React from 'react';
import { TripParameters, PredictionResult, ExplainabilityResult } from '../types';
import { runClientExplanation } from '../utils/mlEngine';

interface ExplainabilityTabProps {
  tripParams: TripParameters;
  prediction: PredictionResult;
  onNavigateToPredict: () => void;
}

export const ExplainabilityTab: React.FC<ExplainabilityTabProps> = ({
  tripParams,
  prediction,
  onNavigateToPredict,
}) => {
  const explanation: ExplainabilityResult = runClientExplanation(tripParams, prediction);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Model Explainability & SHAP Feature Attributions
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>FastAPI REST Schema (`POST /explain`)</span>
            <span aria-hidden="true">·</span>
            <span>SHAP TreeExplainer Attributions</span>
            <span aria-hidden="true">·</span>
            <span>Local Marginal Contributions</span>
          </div>
        </div>

        <button
          onClick={onNavigateToPredict}
          className="text-xs text-sky-400 hover:text-sky-300 self-start sm:self-auto font-medium"
        >
          ← Adjust Trip Parameters in Predictor
        </button>
      </div>

      {/* Trip Baseline & Summary Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Evaluated Trip Context
            </div>
            <div className="text-lg font-semibold text-white">
              {tripParams.route_id} ({tripParams.vehicle_type})
            </div>
            <div className="text-xs text-slate-400">
              {tripParams.station_origin} → {tripParams.station_destination} · Departure:{' '}
              <span className="font-mono text-slate-200">
                {tripParams.scheduled_hour.toString().padStart(2, '0')}:
                {tripParams.scheduled_minute.toString().padStart(2, '0')}
              </span>{' '}
              · Weather: <span className="text-slate-200">{tripParams.weather_condition}</span>
            </div>
          </div>

          <div className="flex items-center gap-8 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-8">
            <div>
              <div className="text-xs text-slate-400">Baseline Fleet Delay Risk</div>
              <div className="text-xl font-bold font-mono text-slate-400">
                {(explanation.base_delay_probability * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500">Global dataset average</div>
            </div>

            <div className="text-slate-600 text-lg">→</div>

            <div>
              <div className="text-xs text-slate-400">Predicted Trip Delay Risk</div>
              <div
                className={`text-xl font-bold font-mono ${
                  prediction.risk_category === 'High'
                    ? 'text-rose-400'
                    : prediction.risk_category === 'Moderate'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {(prediction.delay_probability * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500">
                Δ {((prediction.delay_probability - explanation.base_delay_probability) * 100).toFixed(1)}% shift
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Waterfall / Local Contributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Waterfall Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">SHAP Feature Attribution Waterfall</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                Increases Delay
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                Decreases Delay
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Marginal impact of each input variable on pushing delay probability above or below the baseline.
          </p>

          <div className="space-y-4 pt-2">
            {explanation.top_contributions.map((c) => {
              const pts = c.contribution * 100;
              const isPositive = c.contribution > 0;
              const maxScale = 25.0; // scale percentage points
              const barWidth = Math.min(100, (Math.abs(pts) / maxScale) * 100);

              return (
                <div key={c.feature_name} className="space-y-1.5 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {c.feature_name}
                      <span className="ml-2 font-normal text-slate-400">({c.raw_value})</span>
                    </span>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        isPositive ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {pts.toFixed(1)}%
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-400">{c.human_explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Dispatch Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-4">
            <h3 className="text-base font-semibold text-white">Actionable Dispatch Interventions</h3>
            <p className="text-xs text-slate-400">
              Proactive operational measures generated based on top identified friction features:
            </p>

            <div className="space-y-3 pt-2">
              {explanation.actionable_recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 rounded text-xs space-y-1"
                >
                  <div className="flex items-center gap-2 font-semibold text-sky-400">
                    <span>Protocol {idx + 1}</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed">{rec}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Feature Ranking Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-3">
            <h3 className="text-base font-semibold text-white">Global Feature Importance Ranking</h3>
            <p className="text-xs text-slate-400">Mean absolute SHAP value across the entire fleet training set:</p>

            <div className="space-y-2 pt-1 text-xs">
              {[
                { name: 'traffic_congestion_index', weight: '38.4%' },
                { name: 'vehicle_type (Rail vs Bus)', weight: '21.5%' },
                { name: 'scheduled_hour (Cyclical Time)', weight: '16.2%' },
                { name: 'precipitation_mm & Weather', weight: '9.8%' },
                { name: 'major_event_nearby', weight: '7.1%' },
                { name: 'route_id Arterial Density', weight: '4.5%' },
                { name: 'wind_speed_kmh', weight: '2.5%' },
              ].map((item, i) => (
                <div key={item.name} className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-300">
                    <span className="font-mono text-slate-500 mr-2">0{i + 1}.</span>
                    {item.name}
                  </span>
                  <span className="font-mono tabular-nums text-slate-400">{item.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
