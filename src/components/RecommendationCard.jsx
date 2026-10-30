import React, { useState } from 'react';
import { Star, ArrowLeftRight, Trash2, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Bot, Info } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function RecommendationCard({
  item,
  onReplace,
  onRemove,
  budgetHeadroom = 0,
  onRequestAiAlternatives,
  isAiEnhanced = false
}) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

  const handleToggleAlternatives = async () => {
    const nextState = !showAlternatives;
    setShowAlternatives(nextState);

    if (nextState && onRequestAiAlternatives && (!item.alternatives || item.alternatives.length === 0 || !item.alternatives[0]?.aiReason)) {
      setIsLoadingAlternatives(true);
      try {
        await onRequestAiAlternatives(item);
      } finally {
        setIsLoadingAlternatives(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Top Banner: Reason for Selection */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>{item.slotLabel || item.category}</span>
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          {item.aiExplanation && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-700 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              <span>AI Pick</span>
            </span>
          )}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{item.rating}</span>
          </div>
        </div>
      </div>

      {/* Main product snippet */}
      <div className="flex items-start gap-4 mb-3">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="flex-1 min-w-0">
          <span className="text-xs text-slate-400 font-medium">{item.brand}</span>
          <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
            {item.name}
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-purple-700">
              {formatINR(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(item.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contextual selection reason / AI explanation */}
      {(item.aiExplanation || item.selectionReason) && (
        <div className={`rounded-xl p-3 mb-3 border text-xs leading-relaxed ${
          item.aiExplanation
            ? 'bg-purple-50/60 border-purple-200/80 text-purple-900'
            : 'bg-slate-50 border-slate-100/80 text-slate-600'
        }`}>
          <div className="flex items-start gap-2">
            {item.aiExplanation ? (
              <Bot className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block text-[11px] mb-0.5 text-slate-500">
                {item.aiExplanation ? 'Groq AI Rationale:' : 'Why Selected:'}
              </span>
              <p>{item.aiExplanation || item.selectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleToggleAlternatives}
          className="text-xs font-semibold text-purple-700 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200/70 transition flex items-center gap-1.5"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Alternatives {item.alternatives?.length ? `(${item.alternatives.length})` : ''}</span>
          {showAlternatives ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
          title="Remove from recommended cart"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove</span>
        </button>
      </div>

      {/* Dropdown / Accordion for Alternatives */}
      {showAlternatives && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Catalog Alternatives:
            </p>
            <span className="text-[11px] text-slate-500">
              Budget Headroom: <strong className="text-emerald-600">+{formatINR(budgetHeadroom)}</strong>
            </span>
          </div>

          {isLoadingAlternatives && (
            <div className="p-3 text-center text-xs text-purple-600 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing catalog alternatives...</span>
            </div>
          )}

          {item.alternatives && item.alternatives.length > 0 ? (
            item.alternatives.map((alt) => {
              const priceDiff = alt.price - item.price;
              const affordableWithHeadroom = priceDiff <= budgetHeadroom;

              return (
                <div
                  key={alt.id}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-white transition flex flex-col gap-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={alt.image}
                        alt={alt.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate" title={alt.name}>
                          {alt.name}
                        </p>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="font-bold text-slate-900">{formatINR(alt.price)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {alt.rating}
                          </span>
                          {alt.badge && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-medium">
                              {alt.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onReplace(item.id, alt);
                        setShowAlternatives(false);
                      }}
                      disabled={!affordableWithHeadroom && priceDiff > 0}
                      className={`shrink-0 px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                        !affordableWithHeadroom && priceDiff > 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      }`}
                      title={!affordableWithHeadroom && priceDiff > 0 ? "Exceeds available budget headroom" : "Switch to this item"}
                    >
                      Swap
                    </button>
                  </div>

                  {/* AI Reason for alternative if present */}
                  {alt.aiReason && (
                    <div className="bg-purple-50/70 p-2 rounded-lg text-[11px] text-purple-900 border border-purple-100 flex items-start gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{alt.aiReason}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 py-1">No alternatives found in this product slot.</p>
          )}
        </div>
      )}
    </div>
  );
}
