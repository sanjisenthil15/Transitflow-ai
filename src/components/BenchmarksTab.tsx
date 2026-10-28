import React from 'react';
import { CLASSIFICATION_MODELS, REGRESSION_MODELS } from '../data/mockData';

export const BenchmarksTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Model Benchmarking & Evaluation Matrix
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>80% Train (4,000 trips)</span>
            <span aria-hidden="true">·</span>
            <span>20% Test (1,000 trips)</span>
            <span aria-hidden="true">·</span>
            <span>Stratified Sampling</span>
            <span aria-hidden="true">·</span>
            <span>K-Fold Cross-Validation</span>
          </div>
        </div>
      </div>

      {/* Classification Comparison Section */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            1. Classification Models (Arrival Delay Status · Threshold: ≥ 5.0 mins)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates binary delay detection accuracy and discriminative capability across test holdout.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Model Architecture</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Accuracy</th>
                <th className="py-2.5 px-3 font-semibold text-right">F1-Score</th>
                <th className="py-2.5 px-3 font-semibold text-right">ROC-AUC</th>
                <th className="py-2.5 px-3 font-semibold text-right">Precision</th>
                <th className="py-2.5 px-3 font-semibold text-right">Recall</th>
                <th className="py-2.5 px-3 font-semibold text-right">Fit Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {CLASSIFICATION_MODELS.map((m) => {
                const isBest = m.name.includes('XGBoost');
                return (
                  <tr
                    key={m.name}
                    className={`transition-colors ${
                      isBest ? 'bg-sky-950/20 hover:bg-sky-950/30 font-medium' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                      {isBest && <span className="text-sky-400">★</span>}
                      {m.name}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          isBest
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right">
                      {(m.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right font-medium text-white">
                      {m.f1Score.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right font-semibold text-sky-400">
                      {m.rocAuc.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-400">
                      {m.precision.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-400">
                      {m.recall.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-500">
                      {m.trainTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex flex-wrap gap-4 justify-between">
          <span>Winner: XGBoost Classifier delivers peak discriminative power (0.971 ROC-AUC).</span>
          <span className="text-slate-500">Artifact path: models/best_classifier.joblib</span>
        </div>
      </div>

      {/* Regression Comparison Section */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-lg space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            2. Regression Models (Continuous Arrival Delay in Minutes)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Measures precision of continuous minute variance predictions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Model Architecture</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAE (Minutes)</th>
                <th className="py-2.5 px-3 font-semibold text-right">RMSE (Minutes)</th>
                <th className="py-2.5 px-3 font-semibold text-right">R² Score</th>
                <th className="py-2.5 px-3 font-semibold text-right">Fit Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {REGRESSION_MODELS.map((m) => {
                const isSelected = m.name.includes('LightGBM') || m.name.includes('XGBoost');
                return (
                  <tr
                    key={m.name}
                    className={`transition-colors ${
                      isSelected ? 'bg-sky-950/20 hover:bg-sky-950/30' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                      {isSelected && <span className="text-sky-400">★</span>}
                      {m.name}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right font-semibold text-emerald-400">
                      {m.mae.toFixed(2)} mins
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-300">
                      {m.rmse.toFixed(2)} mins
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right font-medium text-sky-400">
                      {m.r2.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-500">
                      {m.trainTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex flex-wrap gap-4 justify-between">
          <span>Winner: XGBoost Regressor achieves 1.62 min MAE; LightGBM offers fastest inference throughput.</span>
          <span className="text-slate-500">Artifact path: models/best_regressor.joblib</span>
        </div>
      </div>

      {/* Technical Methodology & Feature Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold text-white">Cyclical Time Transformation</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuous sine and cosine projections preserve 24-hour periodic boundary conditions: hour 23:59 is mathematically adjacent to 00:01 without step discontinuities.
          </p>
          <div className="text-xs font-mono text-sky-400 pt-1">
            sin(2π·hr/24), cos(2π·hr/24)
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold text-white">Imputation & Standardization</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Median imputation for skewed weather and congestion statistics; mode imputation for categorical stops; StandardScaler applied to normalized zero-mean continuous inputs.
          </p>
          <div className="text-xs font-mono text-sky-400 pt-1">
            Median / Mode + StandardScaler
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold text-white">Serialization via Joblib</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The fitted transformer pipeline and trained gradient boosted models are bundled into reusable joblib artifacts with zero training-serving skew.
          </p>
          <div className="text-xs font-mono text-sky-400 pt-1">
            joblib.dump(pipeline, 'models/...')
          </div>
        </div>
      </div>
    </div>
  );
};
