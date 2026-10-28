import React, { useState } from 'react';
import { TripParameters, PredictionResult, WeatherCondition, VehicleType } from '../types';
import { ROUTES, STATIONS } from '../data/mockData';
import { runClientPrediction } from '../utils/mlEngine';

interface PredictionTabProps {
  tripParams: TripParameters;
  prediction: PredictionResult;
  onParamsChange: (params: TripParameters) => void;
  onPredictionChange: (result: PredictionResult) => void;
  onViewExplanation: () => void;
}

export const PredictionTab: React.FC<PredictionTabProps> = ({
  tripParams,
  prediction,
  onParamsChange,
  onPredictionChange,
  onViewExplanation,
}) => {
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const handleFieldChange = (field: keyof TripParameters, value: any) => {
    const updated = { ...tripParams, [field]: value };
    // If route changes, align default vehicle type
    if (field === 'route_id') {
      const found = ROUTES.find((r) => r.id === value);
      if (found) {
        updated.vehicle_type = found.type;
      }
    }
    onParamsChange(updated);
  };

  const executeEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const res = runClientPrediction(tripParams);
      onPredictionChange(res);
      setIsEvaluating(false);
    }, 180);
  };

  const applyPreset = (presetName: string) => {
    let preset: Partial<TripParameters> = {};
    if (presetName === 'rush_rain') {
      preset = {
        route_id: 'Route 1 - Downtown Express',
        vehicle_type: 'Bus',
        scheduled_hour: 8,
        scheduled_minute: 30,
        day_of_week: 0,
        weather_condition: 'Rain',
        temperature_c: 14.0,
        precipitation_mm: 5.5,
        wind_speed_kmh: 22.0,
        traffic_congestion_index: 0.82,
        is_holiday: false,
        major_event_nearby: false,
      };
    } else if (presetName === 'stadium_event') {
      preset = {
        route_id: 'Route 3 - Blue Crosstown',
        vehicle_type: 'Bus',
        scheduled_hour: 18,
        scheduled_minute: 45,
        day_of_week: 4,
        weather_condition: 'Clear',
        temperature_c: 21.0,
        precipitation_mm: 0.0,
        wind_speed_kmh: 8.0,
        traffic_congestion_index: 0.88,
        is_holiday: false,
        major_event_nearby: true,
      };
    } else if (presetName === 'subway_nominal') {
      preset = {
        route_id: 'Route 2 - Metro Red Line',
        vehicle_type: 'Subway',
        scheduled_hour: 11,
        scheduled_minute: 15,
        day_of_week: 2,
        weather_condition: 'Clear',
        temperature_c: 19.0,
        precipitation_mm: 0.0,
        wind_speed_kmh: 10.0,
        traffic_congestion_index: 0.28,
        is_holiday: false,
        major_event_nearby: false,
      };
    } else if (presetName === 'snow_storm') {
      preset = {
        route_id: 'Route 7 - North Suburban',
        vehicle_type: 'Commuter Rail',
        scheduled_hour: 7,
        scheduled_minute: 10,
        day_of_week: 1,
        weather_condition: 'Snow',
        temperature_c: -3.5,
        precipitation_mm: 12.0,
        wind_speed_kmh: 35.0,
        traffic_congestion_index: 0.74,
        is_holiday: false,
        major_event_nearby: false,
      };
    }

    const merged = { ...tripParams, ...preset };
    onParamsChange(merged);
    const res = runClientPrediction(merged);
    onPredictionChange(res);
  };

  const isRushHour =
    (tripParams.scheduled_hour >= 7 && tripParams.scheduled_hour <= 9) ||
    (tripParams.scheduled_hour >= 16 && tripParams.scheduled_hour <= 19);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Live Prediction & Risk Assessment Engine
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>FastAPI REST Schema (`POST /predict`)</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Feature Transformer</span>
            <span aria-hidden="true">·</span>
            <span>Cyclical Sin/Cos Encodings</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">Presets:</span>
          <button
            onClick={() => applyPreset('rush_rain')}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded whitespace-nowrap transition-colors"
          >
            Morning Rush + Rain
          </button>
          <button
            onClick={() => applyPreset('stadium_event')}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded whitespace-nowrap transition-colors"
          >
            Stadium Surge
          </button>
          <button
            onClick={() => applyPreset('subway_nominal')}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded whitespace-nowrap transition-colors"
          >
            Metro Nominal
          </button>
          <button
            onClick={() => applyPreset('snow_storm')}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded whitespace-nowrap transition-colors"
          >
            Blizzard Blizzard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Route & Stations */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-white">Route Selection & Transit Mode</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Transit Line</label>
                <select
                  value={tripParams.route_id}
                  onChange={(e) => handleFieldChange('route_id', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {ROUTES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Vehicle Type</label>
                <select
                  value={tripParams.vehicle_type}
                  onChange={(e) => handleFieldChange('vehicle_type', e.target.value as VehicleType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {['Bus', 'Subway', 'Light Rail', 'Commuter Rail', 'BRT'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Origin Station</label>
                <select
                  value={tripParams.station_origin}
                  onChange={(e) => handleFieldChange('station_origin', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {STATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Destination Station</label>
                <select
                  value={tripParams.station_destination}
                  onChange={(e) => handleFieldChange('station_destination', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {STATIONS.filter((s) => s !== tripParams.station_origin).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Time & Schedule */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Departure Timetable & Cyclical Cadence</h3>
              {isRushHour && (
                <span className="text-xs text-amber-400 font-medium">Commuter Rush Window</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Departure Hour</span>
                  <span className="font-mono tabular-nums text-white">{tripParams.scheduled_hour.toString().padStart(2, '0')}:00</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={tripParams.scheduled_hour}
                  onChange={(e) => handleFieldChange('scheduled_hour', parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Departure Minute</span>
                  <span className="font-mono tabular-nums text-white">:{tripParams.scheduled_minute.toString().padStart(2, '0')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="55"
                  step="5"
                  value={tripParams.scheduled_minute}
                  onChange={(e) => handleFieldChange('scheduled_minute', parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Day of Week</label>
                <select
                  value={tripParams.day_of_week}
                  onChange={(e) => handleFieldChange('day_of_week', parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                    (day, idx) => (
                      <option key={day} value={idx}>
                        {day}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Sine-Cosine cyclical transform active:</span>
              <span className="font-mono text-slate-400">
                sin(2π·{tripParams.scheduled_hour}/24) = {Math.sin((2 * Math.PI * tripParams.scheduled_hour) / 24).toFixed(3)}
              </span>
            </div>
          </div>

          {/* Section 3: Weather & Friction */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-white">Atmospheric & Roadway Conditions</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Weather Condition</label>
                <select
                  value={tripParams.weather_condition}
                  onChange={(e) => handleFieldChange('weather_condition', e.target.value as WeatherCondition)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {['Clear', 'Rain', 'Heavy Rain', 'Snow', 'Fog'].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Traffic Congestion Index</span>
                  <span className="font-mono tabular-nums text-white">{(tripParams.traffic_congestion_index * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.98"
                  step="0.01"
                  value={tripParams.traffic_congestion_index}
                  onChange={(e) => handleFieldChange('traffic_congestion_index', parseFloat(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Ambient Temperature (°C)</label>
                <input
                  type="number"
                  value={tripParams.temperature_c}
                  onChange={(e) => handleFieldChange('temperature_c', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Precipitation (mm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={tripParams.precipitation_mm}
                  onChange={(e) => handleFieldChange('precipitation_mm', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={tripParams.is_holiday}
                  onChange={(e) => handleFieldChange('is_holiday', e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Public Holiday Schedule</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={tripParams.major_event_nearby}
                  onChange={(e) => handleFieldChange('major_event_nearby', e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Major Stadium / Venue Event Nearby</span>
              </label>
            </div>
          </div>

          <button
            onClick={executeEvaluation}
            disabled={isEvaluating}
            className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-lg transition-colors shadow-md shadow-sky-950"
          >
            {isEvaluating ? 'Executing Machine Learning Inference...' : 'Calculate Delay & Risk Assessment'}
          </button>
        </div>

        {/* Results Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-lg space-y-6 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Inference Verdict
              </span>
              <span className="text-xs font-mono text-slate-500">{prediction.trip_id}</span>
            </div>

            {/* Delay Probability & Risk Banner */}
            <div className="space-y-3 text-center py-2">
              <div className="text-xs text-slate-400 font-medium">Arrival Delay Likelihood</div>
              <div className="text-5xl font-extrabold font-mono tabular-nums text-white">
                {(prediction.delay_probability * 100).toFixed(1)}%
              </div>

              <div className="pt-2">
                {prediction.risk_category === 'Low' && (
                  <div className="inline-block px-4 py-1.5 text-xs font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    LOW RISK · ON-TIME EXPECTED
                  </div>
                )}
                {prediction.risk_category === 'Moderate' && (
                  <div className="inline-block px-4 py-1.5 text-xs font-bold rounded bg-amber-950 text-amber-400 border border-amber-800/80">
                    MODERATE RISK · HEADWAY MONITORING
                  </div>
                )}
                {prediction.risk_category === 'High' && (
                  <div className="inline-block px-4 py-1.5 text-xs font-bold rounded bg-rose-950 text-rose-400 border border-rose-800/80">
                    HIGH RISK · DISPATCH INTERVENTION NEEDED
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/70">
                <div className="text-xs text-slate-400">Predicted Delay</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-white">
                  {prediction.predicted_delay_minutes.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">mins</span>
                </div>
                <div className="mt-1 text-xs text-slate-500 font-mono">
                  CI: {prediction.confidence_interval.lower_bound} – {prediction.confidence_interval.upper_bound} min
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/70">
                <div className="text-xs text-slate-400">Reliability Score</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-sky-400">
                  {prediction.reliability_score.toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {prediction.is_delayed ? 'Exceeds 5.0m threshold' : 'Nominal adherence'}
                </div>
              </div>
            </div>

            {/* Model Provenance */}
            <div className="bg-slate-950/40 p-3 rounded text-xs space-y-1 text-slate-400 border border-slate-800/50">
              <div className="flex justify-between">
                <span>Classification Model:</span>
                <span className="text-slate-200 font-medium">{prediction.classification_model}</span>
              </div>
              <div className="flex justify-between">
                <span>Regression Model:</span>
                <span className="text-slate-200 font-medium">{prediction.regression_model}</span>
              </div>
              <div className="flex justify-between">
                <span>Evaluation Latency:</span>
                <span className="text-emerald-400 font-mono">3.4 ms</span>
              </div>
            </div>

            {/* Trigger to Explainability Tab */}
            <button
              onClick={onViewExplanation}
              className="w-full py-2.5 text-xs font-medium text-sky-400 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/60 rounded transition-colors text-center"
            >
              Inspect SHAP Feature Waterfall for this Trip →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
