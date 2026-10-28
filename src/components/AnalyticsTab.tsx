import React, { useState } from 'react';
import { DELAY_DISTRIBUTION, ROUTE_PERFORMANCE, WEATHER_IMPACT } from '../data/mockData';

export const AnalyticsTab: React.FC = () => {
  const [filterMode, setFilterMode] = useState<string>('all');

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Transit Fleet Telemetry & Delay Distribution
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>5,000 Ingested Records</span>
            <span aria-hidden="true">·</span>
            <span>8 Monitored Lines</span>
            <span aria-hidden="true">·</span>
            <span>10 Central Interchanges</span>
            <span aria-hidden="true">·</span>
            <span>Delay Threshold: ≥ 5.0 Minutes</span>
          </div>
        </div>

        {/* Filter segment */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start sm:self-auto">
          {['all', 'rail', 'surface'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                filterMode === mode ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'all' ? 'All Modes' : mode === 'rail' ? 'Rail Only' : 'Bus & BRT'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg">
          <div className="text-xs font-medium text-slate-400">Total Trips Processed</div>
          <div className="mt-2 text-3xl font-bold text-white font-mono tabular-nums">5,000</div>
          <div className="mt-1 text-xs text-slate-500">Across 24-hour temporal cycle</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg">
          <div className="text-xs font-medium text-slate-400">Fleet Delay Rate</div>
          <div className="mt-2 text-3xl font-bold text-amber-400 font-mono tabular-nums">34.2%</div>
          <div className="mt-1 text-xs text-slate-500">1,710 trips delayed ≥ 5 minutes</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg">
          <div className="text-xs font-medium text-slate-400">Mean Delay Duration</div>
          <div className="mt-2 text-3xl font-bold text-white font-mono tabular-nums">5.84 <span className="text-sm font-normal text-slate-400">mins</span></div>
          <div className="mt-1 text-xs text-slate-500">Median: 4.20 mins · Max: 31.6 mins</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg">
          <div className="text-xs font-medium text-slate-400">On-Time Reliability</div>
          <div className="mt-2 text-3xl font-bold text-emerald-400 font-mono tabular-nums">65.8%</div>
          <div className="mt-1 text-xs text-slate-500">Within ±4.9 min scheduled window</div>
        </div>
      </div>

      {/* Distribution & Route Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Bins Histogram */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Delay Magnitude Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Frequency of arrival variances relative to scheduled timetable</p>
          </div>

          <div className="space-y-3 pt-2">
            {DELAY_DISTRIBUTION.map((item) => {
              const isOverThreshold = item.bin === '6-8 min' || item.bin === '8-10 min' || item.bin === '10-15 min' || item.bin === '>15 min';
              return (
                <div key={item.bin} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${isOverThreshold ? 'text-amber-400' : 'text-slate-300'}`}>
                      {item.bin} {isOverThreshold && '(Delayed)'}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {item.count} trips ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverThreshold ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${item.percent * 2.5}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-800/80 flex items-center justify-between">
            <span>Dashed regulatory threshold: 5.0 mins</span>
            <span className="text-sky-400">Distribution skew: Right-tail Log-Normal</span>
          </div>
        </div>

        {/* Route Level Average Delays */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Mean Delay by Transit Route</h3>
            <p className="text-xs text-slate-400 mt-0.5">Average minutes behind schedule grouped by operational line</p>
          </div>

          <div className="space-y-3 pt-2">
            {ROUTE_PERFORMANCE.map((route) => {
              const maxScale = 10.0;
              const widthPct = Math.min(100, (route.delay / maxScale) * 100);
              const isHigh = route.delay >= 7.0;
              const isMedium = route.delay >= 4.0 && route.delay < 7.0;

              return (
                <div key={route.route} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{route.route}</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {route.delay.toFixed(1)} mins · {route.reliability}% on-time
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-800/80 flex items-center justify-between">
            <span>Grade-separated Rail: &lt;2.5 min</span>
            <span className="text-amber-400">Surface Mixed-Traffic Bus: 7.9–8.8 min</span>
          </div>
        </div>
      </div>

      {/* Environmental & Weather Friction Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white">Weather Friction & Delay Probability</h3>
          <p className="text-xs text-slate-400 mt-0.5">Atmospheric condition impact on fleet headway variance</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Weather Scenario</th>
                <th className="py-2.5 px-3 font-semibold text-right">Sample Count</th>
                <th className="py-2.5 px-3 font-semibold text-right">Average Delay</th>
                <th className="py-2.5 px-3 font-semibold text-right">Delay Likelihood</th>
                <th className="py-2.5 px-3 font-semibold">Primary Bottleneck</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {WEATHER_IMPACT.map((w) => (
                <tr key={w.condition} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-white">{w.condition}</td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-400">{w.count.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right font-medium">
                    {w.avgDelay.toFixed(1)} mins
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right">
                    <span className={w.delayProbability > 70 ? 'text-rose-400 font-semibold' : w.delayProbability > 40 ? 'text-amber-400' : 'text-emerald-400'}>
                      {w.delayProbability.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {w.condition === 'Clear' && 'Baseline traffic signals & passenger boarding dwell'}
                    {w.condition === 'Fog' && 'Visual approach deceleration & increased safety headways'}
                    {w.condition === 'Rain' && 'Reduced surface braking friction & windshield wiper speed restrictions'}
                    {w.condition === 'Heavy Rain' && 'Roadway hydroplaning hazard & rail track drainage saturation'}
                    {w.condition === 'Snow' && 'Switch point freezing, wheel slip traction control & reduced speed zones'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
