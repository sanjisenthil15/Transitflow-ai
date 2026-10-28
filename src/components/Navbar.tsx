import React from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickSimulate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onQuickSimulate }) => {
  const navItems = [
    { id: 'analytics', label: 'Fleet Analytics' },
    { id: 'predict', label: 'Live Predictor' },
    { id: 'explain', label: 'SHAP Explainability' },
    { id: 'benchmarks', label: 'Model Benchmarks' },
    { id: 'code', label: 'Code & Architecture' },
    { id: 'api', label: 'API Playground' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
            TF
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            TransitFlow
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 shrink-0 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickSimulate}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-sky-950"
          >
            Evaluate Trip Risk
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-2 bg-slate-950">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === item.id ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
