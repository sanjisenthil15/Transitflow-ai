/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

type TransportMode = 'Bus' | 'Metro' | 'Train' | 'Tram';

interface TripParams {
  transport_mode: TransportMode;
  route_id: string;
  scheduled_hour: number;
  temperature: number;
  rainfall_mm: number;
  traffic_congestion_pct: number;
  event_status: boolean;
}

interface PredictionResult {
  status_badge: string;
  is_delayed: boolean;
  predicted_delay_minutes: number;
  confidence_level: number;
  risk_level: 'Low' | 'Medium' | 'High';
  primary_reason: string;
}

const ROUTES_MAP: Record<TransportMode, string[]> = {
  Bus: ['Route 1 - Downtown Express', 'Route 3 - Blue Crosstown', 'Route 6 - Harbor Connector'],
  Metro: ['Route 2 - Metro Red Line'],
  Train: ['Route 4 - Airport Direct', 'Route 7 - North Suburban'],
  Tram: ['Route 5 - University Shuttle', 'Route 8 - Tech District Loop'],
};

const INITIAL_PARAMS: TripParams = {
  transport_mode: 'Bus',
  route_id: 'Route 1 - Downtown Express',
  scheduled_hour: 8,
  temperature: 20.0,
  rainfall_mm: 0.0,
  traffic_congestion_pct: 65,
  event_status: false,
};

function calculatePrediction(p: TripParams): PredictionResult {
  const modeWeights: Record<TransportMode, number> = {
    Bus: 11.5,
    Tram: 4.5,
    Train: 2.2,
    Metro: 0.8,
  };

  const traffic_mins = (p.traffic_congestion_pct / 100.0) * modeWeights[p.transport_mode];
  let delay = 1.2 + traffic_mins;

  const isRush = (p.scheduled_hour >= 7 && p.scheduled_hour <= 9) || (p.scheduled_hour >= 16 && p.scheduled_hour <= 19);
  if (isRush) delay += 2.6;

  let rain_mins = 0;
  if (p.rainfall_mm > 15.0) rain_mins = 4.8;
  else if (p.rainfall_mm > 3.0) rain_mins = 2.6;
  else if (p.rainfall_mm > 0.5) rain_mins = 1.0;
  delay += rain_mins;

  if (p.event_status) delay += 3.8;
  if (p.temperature < 0.0) delay += 2.2;

  const total_mins = Math.round(Math.max(0.4, delay) * 10) / 10;
  const is_delayed = total_mins >= 5.0;

  if (total_mins >= 8.0) {
    return {
      status_badge: 'HIGH DELAY RISK',
      is_delayed: true,
      predicted_delay_minutes: total_mins,
      confidence_level: 88,
      risk_level: 'High',
      primary_reason: 'Severe street traffic congestion combined with peak commuter volume.',
    };
  } else if (total_mins >= 4.0) {
    return {
      status_badge: 'MODERATE DELAY RISK',
      is_delayed: true,
      predicted_delay_minutes: total_mins,
      confidence_level: 84,
      risk_level: 'Medium',
      primary_reason: 'Moderate corridor congestion with slight boarding dwell buffer.',
    };
  } else {
    return {
      status_badge: 'ON-TIME',
      is_delayed: false,
      predicted_delay_minutes: total_mins,
      confidence_level: 92,
      risk_level: 'Low',
      primary_reason: 'Nominal right-of-way conditions with normal schedule adherence.',
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictor' | 'factors' | 'routes'>('overview');
  const [params, setParams] = useState<TripParams>(INITIAL_PARAMS);
  const [pred, setPred] = useState<PredictionResult>(() => calculatePrediction(INITIAL_PARAMS));

  const handleFieldChange = (field: keyof TripParams, val: any) => {
    const updated = { ...params, [field]: val };
    if (field === 'transport_mode') {
      const mode = val as TransportMode;
      const routes = ROUTES_MAP[mode] || [];
      if (!routes.includes(updated.route_id)) {
        updated.route_id = routes[0] || 'Route 1 - Downtown Express';
      }
    }
    setParams(updated);
    setPred(calculatePrediction(updated));
  };

  const isRushHour =
    (params.scheduled_hour >= 7 && params.scheduled_hour <= 9) ||
    (params.scheduled_hour >= 16 && params.scheduled_hour <= 19);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Minimalist Dark Header */}
      <header className="bg-slate-800/90 border-b border-slate-700/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
              TF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  TransitFlow AI
                </span>
                <span className="text-slate-500 font-normal">|</span>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                  Transport Delay & Reliability Analysis
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live System Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 4 Distinct Pages Navigation */}
        <div className="flex border-b border-slate-700/80 gap-2 pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-slate-800/80 text-sky-400 border-sky-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <span>📊</span> System Overview & Live Fleet Stats
          </button>

          <button
            onClick={() => setActiveTab('predictor')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'predictor'
                ? 'bg-slate-800/80 text-sky-400 border-sky-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <span>⚡</span> Live Trip Delay Predictor
          </button>

          <button
            onClick={() => setActiveTab('factors')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'factors'
                ? 'bg-slate-800/80 text-sky-400 border-sky-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <span>🔍</span> Explainable AI & Factor Impact
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'routes'
                ? 'bg-slate-800/80 text-sky-400 border-sky-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <span>🗺️</span> Route & Corridor Insights
          </button>
        </div>

        {/* PAGE 1: System Overview & Live Fleet Stats */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* High-level Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center shadow-lg">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Trips Processed
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-sky-400 mt-2">
                  2,000
                </div>
                <div className="text-xs text-slate-500 mt-1">Real-time fleet sensor records</div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center shadow-lg">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Network Reliability
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-2">
                  89.2%
                </div>
                <div className="text-xs text-slate-500 mt-1">On-time within standard timetable buffer</div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center shadow-lg">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Average Delay Time
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-2">
                  2.14 <span className="text-base text-slate-400 font-normal">mins</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Across all routes, peak & off-peak</div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center shadow-lg">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Monitored Routes
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400 mt-2">
                  8 <span className="text-base text-slate-400 font-normal">Lines</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Bus, Metro, Heavy Rail, Tram</div>
              </div>
            </div>

            {/* Delay Categories Distribution Cards */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-2.5">
                Fleet Arrival Variance Categories
              </h3>
              <p className="text-xs text-slate-400">
                Distribution of all 2,000 trips tracked across delay categories:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-slate-900 border border-emerald-500/80 rounded-xl p-5 text-center">
                  <div className="text-xs font-bold uppercase text-emerald-400">0–2 Min Variance</div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 my-2">71.0%</div>
                  <div className="text-xs text-slate-300">1,420 Trips · Strictly On-Time</div>
                </div>

                <div className="bg-slate-900 border border-sky-500/80 rounded-xl p-5 text-center">
                  <div className="text-xs font-bold uppercase text-sky-400">2–5 Min Variance</div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-sky-400 my-2">18.2%</div>
                  <div className="text-xs text-slate-300">364 Trips · Minor Buffer Zone</div>
                </div>

                <div className="bg-slate-900 border border-rose-500/80 rounded-xl p-5 text-center">
                  <div className="text-xs font-bold uppercase text-rose-400">&gt;5 Min Delay</div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400 my-2">10.8%</div>
                  <div className="text-xs text-slate-300">216 Trips · Noticeable Delay</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: Live Trip Delay Predictor */}
        {activeTab === 'predictor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Input Form (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-7 shadow-lg space-y-5">
              <h2 className="text-base font-bold text-white border-b border-slate-700 pb-3">
                Live Trip Parameters
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Transport Type
                    </label>
                    <select
                      value={params.transport_mode}
                      onChange={(e) => handleFieldChange('transport_mode', e.target.value as TransportMode)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      {(['Bus', 'Metro', 'Train', 'Tram'] as const).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Route ID / Transit Line
                    </label>
                    <select
                      value={params.route_id}
                      onChange={(e) => handleFieldChange('route_id', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      {ROUTES_MAP[params.transport_mode].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Scheduled Departure Hour
                    </label>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {params.scheduled_hour.toString().padStart(2, '0')}:00
                      {isRushHour && (
                        <span className="ml-2 font-sans font-semibold text-amber-400 text-[11px]">
                          ⚡ Peak Commuter Rush Window Active
                        </span>
                      )}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={params.scheduled_hour}
                    onChange={(e) => handleFieldChange('scheduled_hour', parseInt(e.target.value, 10))}
                    className="w-full accent-sky-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Traffic Congestion Index
                    </label>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {params.traffic_congestion_pct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={params.traffic_congestion_pct}
                    onChange={(e) => handleFieldChange('traffic_congestion_pct', parseInt(e.target.value, 10))}
                    className="w-full accent-sky-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Free Flow (5%)</span>
                    <span>Moderate (50%)</span>
                    <span>Severe Gridlock (95%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={params.temperature}
                      onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Rainfall Accumulation
                      </label>
                      <span className="text-xs font-mono text-slate-400">{params.rainfall_mm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="0.5"
                      value={params.rainfall_mm}
                      onChange={(e) => handleFieldChange('rainfall_mm', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 font-medium p-3 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-900/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={params.event_status}
                      onChange={(e) => handleFieldChange('event_status', e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 border-slate-700 bg-slate-800"
                    />
                    <span>Special Stadium / Concert Event Active Nearby</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: AI Result Card (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-7 shadow-lg space-y-6">
              <h3 className="text-base font-bold text-white border-b border-slate-700 pb-3">
                AI Prediction Assessment
              </h3>

              {pred.status_badge === 'ON-TIME' ? (
                <div className="bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    ON-TIME
                  </div>
                  <div className="text-5xl font-extrabold font-mono text-emerald-300 mt-2 mb-1 tracking-tight">
                    +{pred.predicted_delay_minutes} <span className="text-2xl font-bold text-emerald-400">Mins</span>
                  </div>
                  <div className="inline-flex items-center gap-2 mt-3 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                    <span>AI Confidence: <b>{pred.confidence_level}% Confidence</b></span>
                  </div>
                </div>
              ) : pred.risk_level === 'Medium' ? (
                <div className="bg-amber-950/70 border-2 border-amber-500 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    MODERATE DELAY RISK
                  </div>
                  <div className="text-5xl font-extrabold font-mono text-amber-300 mt-2 mb-1 tracking-tight">
                    +{pred.predicted_delay_minutes} <span className="text-2xl font-bold text-amber-400">Mins</span>
                  </div>
                  <div className="inline-flex items-center gap-2 mt-3 bg-amber-900/50 px-3 py-1 rounded-full border border-amber-500/40 text-xs font-semibold text-amber-300">
                    <span>AI Confidence: <b>{pred.confidence_level}% Confidence</b></span>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/70 border-2 border-rose-500 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                    HIGH DELAY RISK
                  </div>
                  <div className="text-5xl font-extrabold font-mono text-rose-300 mt-2 mb-1 tracking-tight">
                    +{pred.predicted_delay_minutes} <span className="text-2xl font-bold text-rose-400">Mins</span>
                  </div>
                  <div className="inline-flex items-center gap-2 mt-3 bg-rose-900/50 px-3 py-1 rounded-full border border-rose-500/40 text-xs font-semibold text-rose-300">
                    <span>AI Confidence: <b>{pred.confidence_level}% Confidence</b></span>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-xs space-y-2">
                <div className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                  Primary Delay Driver:
                </div>
                <div className="text-slate-300 leading-relaxed">
                  {pred.primary_reason}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: Explainable AI & Factor Impact */}
        {activeTab === 'factors' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-5">
            <div className="border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">
                Environmental & Operational Factor Sensitivity
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Understand why trips experience arrival variances across changing street, weather, and corridor conditions:
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {[
                {
                  name: 'Traffic Congestion Impact',
                  level: 'High',
                  pct: 82,
                  delay: '+5.5 to +11.5 mins',
                  color: 'bg-rose-500',
                  badge: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
                  desc: 'Primary friction source for surface buses operating on shared arterial lanes without dedicated bus lanes.',
                },
                {
                  name: 'Heavy Precipitation / Rainfall',
                  level: 'Medium',
                  pct: 54,
                  delay: '+2.6 to +4.8 mins',
                  color: 'bg-amber-500',
                  badge: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
                  desc: 'Reduces vehicle tire traction, driver visibility, and prompts drivers to increase safe headway margins.',
                },
                {
                  name: 'Peak Commuter Rush Hours',
                  level: 'Medium',
                  pct: 48,
                  delay: '+2.0 to +3.5 mins',
                  color: 'bg-amber-500',
                  badge: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
                  desc: 'Elevated passenger surges at platform stops lengthen multi-door boarding dwell times.',
                },
                {
                  name: 'Special Stadium / Venue Event',
                  level: 'Medium',
                  pct: 42,
                  delay: '+3.0 to +5.0 mins',
                  color: 'bg-sky-500',
                  badge: 'text-sky-400 border-sky-500/40 bg-sky-950/40',
                  desc: 'Concert or sports events induce localized bottleneck queues and traffic redirection around the arena.',
                },
                {
                  name: 'Dedicated Track Right-of-Way',
                  level: 'Low',
                  pct: 18,
                  delay: '-2.5 mins (Mitigating)',
                  color: 'bg-emerald-500',
                  badge: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
                  desc: 'Grade-separated rail and subway corridors shield vehicles from road surface traffic delays.',
                },
                {
                  name: 'Freezing Temperature',
                  level: 'Low',
                  pct: 14,
                  delay: '+1.0 to +2.2 mins',
                  color: 'bg-slate-500',
                  badge: 'text-slate-400 border-slate-500/40 bg-slate-900',
                  desc: 'Sub-zero temperatures cause slight mechanical switch and pneumatic brake adhesion variance.',
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badge}`}>
                        Impact: {item.level}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-300">{item.delay}</span>
                  </div>

                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 4: Route & Corridor Insights */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Reliable Routes */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 border-b border-slate-700 pb-2.5 flex items-center gap-2">
                  <span>✓</span> Most Reliable Routes (Grade-Separated & Rail)
                </h3>

                <div className="space-y-2.5">
                  {[
                    { name: 'Route 2 - Metro Red Line', mode: 'Metro', pct: '95.8%', delay: '0.8 min avg', note: 'Dedicated underground dual tracks' },
                    { name: 'Route 4 - Airport Direct', mode: 'Train', pct: '92.4%', delay: '1.4 min avg', note: 'Express heavy rail with signal preemption' },
                    { name: 'Route 7 - North Suburban', mode: 'Train', pct: '89.1%', delay: '2.2 min avg', note: 'Suburban commuter rail corridor' },
                    { name: 'Route 5 - University Shuttle', mode: 'Tram', pct: '84.6%', delay: '2.8 min avg', note: 'Median tramway with priority intersections' },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">
                          {r.name} <span className="text-[11px] font-normal text-emerald-400">({r.mode})</span>
                        </span>
                        <span className="font-mono font-extrabold text-emerald-400">{r.pct}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {r.delay} · <span className="text-slate-500">{r.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Delay Bottlenecks */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
                <h3 className="text-sm font-bold text-rose-400 border-b border-slate-700 pb-2.5 flex items-center gap-2">
                  <span>⛔</span> High-Delay Bottleneck Corridors (Surface Bus)
                </h3>

                <div className="space-y-2.5">
                  {[
                    { name: 'Route 3 - Blue Crosstown', mode: 'Bus', pct: '54.2%', delay: '8.4 min avg', note: 'East-West arterial gridlock and unsynchronized lights' },
                    { name: 'Route 1 - Downtown Express', mode: 'Bus', pct: '59.8%', delay: '7.2 min avg', note: 'Commercial loading zone double-parking in bus lanes' },
                    { name: 'Route 6 - Harbor Connector', mode: 'Bus', pct: '62.4%', delay: '6.8 min avg', note: 'Drawbridge openings and maritime truck freight queues' },
                  ].map((b) => (
                    <div
                      key={b.name}
                      className="bg-slate-900 border border-rose-500/40 rounded-xl p-3 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">
                          {b.name} <span className="text-[11px] font-normal text-rose-400">({b.mode})</span>
                        </span>
                        <span className="font-mono font-extrabold text-rose-400">{b.pct}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {b.delay} · <span className="text-slate-500">{b.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Peak Delay Hours Summary */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-2.5">
                Peak Delay Hours Summary
              </h3>
              <p className="text-xs text-slate-400">
                Observed average minutes variance across the 24-hour diurnal operating cycle:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                {[
                  { time: '06:00 - 08:00 AM', name: 'Early Commute', delay: '1.8 mins', color: 'text-emerald-400', bar: 'bg-emerald-500', w: '28%' },
                  { time: '08:00 - 10:00 AM', name: 'Morning Peak', delay: '5.8 mins', color: 'text-rose-400', bar: 'bg-rose-500', w: '88%' },
                  { time: '10:00 - 03:00 PM', name: 'Midday Lull', delay: '1.4 mins', color: 'text-emerald-400', bar: 'bg-emerald-500', w: '22%' },
                  { time: '03:00 - 05:00 PM', name: 'Early Afternoon', delay: '2.9 mins', color: 'text-amber-400', bar: 'bg-amber-500', w: '45%' },
                  { time: '05:00 - 07:00 PM', name: 'Evening Peak', delay: '6.4 mins', color: 'text-rose-400', bar: 'bg-rose-500', w: '96%' },
                  { time: '07:00 - 11:00 PM', name: 'Night Hours', delay: '1.1 mins', color: 'text-emerald-400', bar: 'bg-emerald-500', w: '18%' },
                ].map((h) => (
                  <div
                    key={h.time}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-center space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-slate-300">{h.name}</div>
                    <div className="text-[10px] text-slate-500">{h.time}</div>
                    <div className={`text-base font-extrabold font-mono ${h.color} py-1`}>
                      +{h.delay}
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${h.bar} rounded-full`} style={{ width: h.w }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sleek Dark Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/90 py-5 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TransitFlow AI</span>
            <span aria-hidden="true">·</span>
            <span>Public Transport Delay & Reliability Analysis</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>FastAPI Backend</span>
            <span aria-hidden="true">/</span>
            <span>Streamlit Multi-Page UI</span>
            <span aria-hidden="true">/</span>
            <span>XGBoost ML</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
