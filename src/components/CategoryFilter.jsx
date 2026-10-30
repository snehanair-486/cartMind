import React from 'react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Accessories',
  'Study Essentials',
  'Home & Living',
  'Lifestyle'
];

export default function CategoryFilter({
  selectedCategory = 'All',
  onSelectCategory,
  categoryCounts = {}
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = categoryCounts[cat] !== undefined ? categoryCounts[cat] : null;

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isSelected
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-200 font-semibold'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span>{cat}</span>
            {count !== null && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-purple-700 text-purple-100'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
