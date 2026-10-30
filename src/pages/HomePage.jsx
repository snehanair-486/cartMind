import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Wallet, 
  Package, 
  TrendingUp, 
  SlidersHorizontal, 
  CheckCircle, 
  Laptop, 
  Headphones, 
  BookOpen, 
  Home, 
  Coffee,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';
import productsData from '../data/products.json';
import BudgetProgress from '../components/BudgetProgress';

export default function HomePage() {
  const navigate = useNavigate();
  const { cartTotal, budget, remainingBudget, cartCount } = useCart();

  const totalProducts = productsData.length;

  const categories = [
    { name: 'Electronics', icon: Headphones, count: productsData.filter(p => p.category === 'Electronics').length, desc: 'Audio, mice, speakers & power accessories' },
    { name: 'Accessories', icon: Laptop, count: productsData.filter(p => p.category === 'Accessories').length, desc: 'Laptop stands, hubs, desk pads & organizers' },
    { name: 'Study Essentials', icon: BookOpen, count: productsData.filter(p => p.category === 'Study Essentials').length, desc: 'Backpacks, desk lamps, notebooks & calculators' },
    { name: 'Home & Living', icon: Home, count: productsData.filter(p => p.category === 'Home & Living').length, desc: 'Smart bulbs, cushions, ergonomic pillows & shelves' },
    { name: 'Lifestyle', icon: Coffee, count: productsData.filter(p => p.category === 'Lifestyle').length, desc: 'Insulated flasks, lunchboxes, blue-cut glasses' },
  ];

  const presets = [
    {
      title: "College Student Setup",
      budget: 15000,
      query: "College student setup with wireless headphones, laptop stand, mouse, and backpack. Prioritize quality and value.",
      priority: "best-value",
      tags: ["Headphones", "Stand", "Mouse", "Backpack"]
    },
    {
      title: "Productive Desk Essentials",
      budget: 8000,
      query: "Desk setup with wireless mouse, extended desk mat, USB hub, and rechargeable study lamp.",
      priority: "lowest-price",
      tags: ["Mouse", "Desk Mat", "USB Hub", "Lamp"]
    },
    {
      title: "Hostel Living & Study Kit",
      budget: 6000,
      query: "Hostel room essentials with insulated flask, desk lamp, spiral notebooks, and power bank.",
      priority: "best-quality",
      tags: ["Flask", "Lamp", "Notebooks", "Power Bank"]
    }
  ];

  const handleLaunchPreset = (preset) => {
    navigate('/builder', { state: { preset } });
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs sm:text-sm font-semibold shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>⚡ AI-Powered Shopping Assistant • Groq Integration Live</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Build a <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">smarter</span> shopping cart.
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <span className="font-semibold text-purple-700">Your budget. Your needs. Your smartest cart.</span>{' '}
            Stop juggling individual products. CartMind solves the budget knapsack equation to build the best combination of products tailored to your exact limits.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/builder"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Build My Cart</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5 text-slate-400" />
              <span>Browse Catalog ({totalProducts})</span>
            </Link>
          </div>
        </div>

        {/* Live Statistics Cards */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Products Available</span>
              <span className="text-2xl font-black text-slate-900">{totalProducts} Items</span>
              <span className="text-[11px] text-slate-500 block">Across 5 Curated Categories</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Cart Value</span>
              <span className="text-2xl font-black text-indigo-700">{formatINR(cartTotal)}</span>
              <span className="text-[11px] text-slate-500 block">{cartCount} items in active cart</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Remaining Budget</span>
              <span className="text-2xl font-black text-emerald-600">{formatINR(remainingBudget)}</span>
              <span className="text-[11px] text-slate-500 block">Target Budget: {formatINR(budget)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cart Presets */}
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
              Instant Starters
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Popular Pre-Configured Bundles
            </h2>
            <p className="text-sm text-slate-500">
              Click any starter setup to test the optimizer immediately with pre-filled goals.
            </p>
          </div>
          <Link
            to="/builder"
            className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 shrink-0"
          >
            <span>Custom Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {presets.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    Budget: {formatINR(p.budget)}
                  </span>
                  <span className="text-xs font-medium text-slate-400 capitalize">
                    {p.priority.replace('-', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  "{p.query}"
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLaunchPreset(p)}
                className="w-full bg-slate-900 hover:bg-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 group-hover:shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Optimize This Setup</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How CartMind Works Section */}
      <section className="max-w-6xl mx-auto bg-gradient-to-b from-purple-50/50 via-white to-slate-50/50 rounded-3xl p-6 sm:p-12 border border-purple-100/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100/60 px-3 py-1 rounded-full">
            The CartMind Difference
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
            How Cart Optimization Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Ordinary stores recommend random single items. CartMind solves the multi-item knapsack problem to deliver a coordinated, within-budget collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-purple-500/20">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Define Budget & Goal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your ceiling budget in INR and write what you need in plain English (e.g., "College student setup with headphones, mouse, and backpack").
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Item Solver</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our deterministic optimization engine cross-evaluates prices, specs, brand tags, and ratings to fit all your desired categories.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-violet-500/20">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Swap & Customize</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Examine each item's selection reason. Swap with cheaper or premium alternatives with one click, while real-time budget tracking updates.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
              4
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">One-Click Cart</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transfer the finalized combination into your active shopping cart with one click, fully persisted in LocalStorage.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Product Categories */}
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Browse by Category
            </h2>
            <p className="text-sm text-slate-500">
              Explore authentic products ready to be incorporated into your smart cart.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                  <span>{cat.count} Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
