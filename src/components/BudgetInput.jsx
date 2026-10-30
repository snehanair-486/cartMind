import React from 'react';
import { IndianRupee, Plus, Minus } from 'lucide-react';
import { formatINR } from '../utils/formatters';

const PRESETS = [5000, 10000, 15000, 25000, 50000];

export default function BudgetInput({
  value,
  onChange,
  label = "Total Shopping Budget",
  helperText = "Specify your target limit. CartMind guarantees your cart stays within this amount."
}) {
  const numericVal = Number(value) || 0;

  const handleAdjust = (delta) => {
    const updated = Math.max(500, numericVal + delta);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-purple-600 rounded-full inline-block"></span>
            {label}
          </label>
          <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
            Guaranteed strictly ≤ {formatINR(numericVal)}
          </span>
        </div>
      )}

      {/* Main Input Row */}
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none flex items-center text-slate-400">
          <span className="text-lg font-bold text-purple-600">₹</span>
        </div>
        <input
          type="number"
          min="500"
          step="500"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          placeholder="Enter budget (e.g., 15000)"
          className="w-full pl-10 pr-28 py-3.5 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition shadow-sm"
        />
        <div className="absolute right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleAdjust(-1000)}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Decrease by ₹1,000"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(1000)}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Increase by ₹1,000"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {helperText && (
        <p className="text-xs text-slate-500 leading-relaxed">{helperText}</p>
      )}

      {/* Quick Preset Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-slate-400">Quick presets:</span>
        {PRESETS.map((preset) => {
          const isSelected = numericVal === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              {formatINR(preset)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
