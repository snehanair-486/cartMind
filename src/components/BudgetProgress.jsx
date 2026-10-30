import React from 'react';
import { formatINR } from '../utils/formatters';
import { Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BudgetProgress({
  spent = 0,
  budget = 15000,
  title = "Budget Allocation",
  className = ""
}) {
  const numericSpent = Math.max(0, spent);
  const numericBudget = Math.max(1, budget);
  const percentage = Math.min(100, Math.round((numericSpent / numericBudget) * 100));
  const remaining = numericBudget - numericSpent;
  const isOver = numericSpent > numericBudget;

  // Determine progress color
  let barColor = "bg-gradient-to-r from-indigo-500 to-purple-600";
  let statusText = `${percentage}% Utilized`;
  let statusBg = "bg-purple-50 text-purple-700 border-purple-200";

  if (isOver) {
    barColor = "bg-rose-500";
    statusText = `Over Budget by ${formatINR(Math.abs(remaining))}`;
    statusBg = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (percentage === 100) {
    barColor = "bg-emerald-500";
    statusText = "100% Optimized Fit";
    statusBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (percentage >= 85) {
    barColor = "bg-gradient-to-r from-purple-500 to-indigo-600";
    statusText = "Optimal High Efficiency";
    statusBg = "bg-indigo-50 text-indigo-700 border-indigo-200";
  }

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
            <p className="text-xs text-slate-500">Live spend vs target budget</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBg}`}>
          {statusText}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${Math.min(100, (numericSpent / numericBudget) * 100)}%` }}
        />
      </div>

      {/* Stat Numbers */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Total Budget</span>
          <span className="text-sm font-bold text-slate-800">{formatINR(numericBudget)}</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Current Spent</span>
          <span className="text-sm font-bold text-purple-700">{formatINR(numericSpent)}</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Remaining</span>
          <span className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isOver ? `-${formatINR(Math.abs(remaining))}` : formatINR(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
