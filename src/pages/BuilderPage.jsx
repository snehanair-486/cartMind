import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Wallet, 
  Sliders, 
  RotateCcw, 
  ShoppingBag, 
  Check, 
  Plus, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Tag,
  Zap,
  DollarSign,
  Award,
  Scale,
  Bot,
  Cpu,
  RefreshCw,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { optimizeCart, findAlternatives } from '../utils/optimizer';
import { formatINR } from '../utils/formatters';
import productsData from '../data/products.js';
import BudgetInput from '../components/BudgetInput';
import BudgetProgress from '../components/BudgetProgress';
import RecommendationCard from '../components/RecommendationCard';
import {
  checkAiBackendHealth,
  fetchAiRecommendations,
  fetchAiAlternatives,
  parseShoppingRequestWithAi
} from '../utils/aiApi';

const ALL_CATEGORIES = [
  'Electronics',
  'Accessories',
  'Study Essentials',
  'Home & Living',
  'Lifestyle'
];

const POPULAR_BRANDS = [
  'boAt',
  'Sony',
  'Logitech',
  'Xiaomi',
  'Noise',
  'Cosmus',
  'American Tourister',
  'Wipro',
  'Milton',
  'Classmate'
];

const PROMPT_TEMPLATES = [
  {
    label: "College Setup (₹15,000)",
    budget: 15000,
    text: "I need a college student setup with wireless headphones, a laptop stand, a mouse, and a backpack. Prioritize quality and value.",
    priority: "best-value",
    categories: ['Electronics', 'Accessories', 'Study Essentials']
  },
  {
    label: "Home Desk (₹8,000)",
    budget: 8000,
    text: "Work from home desk setup with wireless mouse, extended desk mat, USB hub, and rechargeable study lamp.",
    priority: "lowest-price",
    categories: ['Electronics', 'Accessories', 'Study Essentials']
  },
  {
    label: "Hostel Living (₹6,000)",
    budget: 6000,
    text: "Hostel living essentials with insulated flask, desk lamp, spiral notebooks, and power bank.",
    priority: "best-quality",
    categories: ['Study Essentials', 'Lifestyle', 'Electronics']
  }
];

export default function BuilderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setBudget, applyOptimizedCart } = useCart();

  // Builder form state
  const [budgetVal, setBudgetVal] = useState(15000);
  const [queryText, setQueryText] = useState(
    "I need a college student setup with wireless headphones, a laptop stand, a mouse, and a backpack. Prioritize quality and value for money."
  );
  const [selectedCategories, setSelectedCategories] = useState(['Electronics', 'Accessories', 'Study Essentials']);
  const [priority, setPriority] = useState('best-value'); // 'lowest-price' | 'best-quality' | 'best-value'
  const [preferredBrands, setPreferredBrands] = useState(['boAt', 'Logitech']);

  // Results & AI state
  const [optimizedResult, setOptimizedResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Analyzing with Groq AI...');
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState({
    checked: false,
    available: false,
    groqConfigured: false,
    model: 'llama-3.3-70b-versatile'
  });

  // Check backend health on mount
  useEffect(() => {
    async function verifyBackend() {
      const health = await checkAiBackendHealth();
      setBackendHealth({
        checked: true,
        available: health.available,
        groqConfigured: health.groqConfigured,
        model: health.model || 'llama-3.3-70b-versatile'
      });
    }
    verifyBackend();
  }, []);

  // Check if routed with preset from HomePage
  useEffect(() => {
    if (location.state?.preset) {
      const p = location.state.preset;
      setBudgetVal(p.budget);
      setQueryText(p.query);
      setPriority(p.priority || 'best-value');
      executeOptimization(p.budget, p.query, selectedCategories, p.priority || 'best-value', preferredBrands);
    } else {
      executeOptimization(budgetVal, queryText, selectedCategories, priority, preferredBrands);
    }
  }, [location.state]);

  // Main optimization execution using AI endpoint with seamless local fallback
  const executeOptimization = async (b, q, cats, prio, brands) => {
    setIsOptimizing(true);
    setLoadingStepText('Groq AI is parsing your shopping requirements...');

    try {
      // Step timer for visual feedback
      const timer = setTimeout(() => {
        setLoadingStepText('Solving budget constraints and cross-referencing catalog...');
      }, 400);

      const result = await fetchAiRecommendations({
        budget: b,
        query: q,
        categories: cats,
        priority: prio,
        preferredBrands: brands
      });

      clearTimeout(timer);
      setOptimizedResult(result);
    } catch (err) {
      console.error('Optimization error:', err);
      // Hard fallback to local optimizer in case of any unhandled issue
      const local = optimizeCart({
        budget: b,
        query: q,
        categories: cats,
        priority: prio,
        preferredBrands: brands,
        allProducts: productsData
      });
      setOptimizedResult({
        ...local,
        isAiEnhanced: false,
        fallback: true
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunOptimizer = (e) => {
    e?.preventDefault();
    executeOptimization(budgetVal, queryText, selectedCategories, priority, preferredBrands);
  };

  // Toggle category
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Toggle brand
  const toggleBrand = (brand) => {
    setPreferredBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Load a prompt template
  const applyTemplate = (tmpl) => {
    setBudgetVal(tmpl.budget);
    setQueryText(tmpl.text);
    setPriority(tmpl.priority);
    if (tmpl.categories) setSelectedCategories(tmpl.categories);
    executeOptimization(tmpl.budget, tmpl.text, tmpl.categories || selectedCategories, tmpl.priority, preferredBrands);
  };

  // Replace item in active recommendation
  const handleReplaceItem = (oldProductId, newProduct) => {
    if (!optimizedResult) return;

    const updatedItems = optimizedResult.items.map(item => {
      if (item.id === oldProductId) {
        return {
          ...newProduct,
          slotLabel: item.slotLabel,
          selectionReason: `Swapped for ${newProduct.name} (${newProduct.rating}★).`,
          aiExplanation: `Swapped for ${newProduct.name} (${newProduct.rating}★).`,
          alternatives: findAlternatives(newProduct, productsData)
        };
      }
      return item;
    });

    // Recalculate strictly
    const newTotal = updatedItems.reduce((acc, i) => acc + i.price, 0);
    const newRemaining = Math.max(0, optimizedResult.budget - newTotal);
    const newUtilization = Math.min(100, Math.round((newTotal / optimizedResult.budget) * 100));

    setOptimizedResult({
      ...optimizedResult,
      items: updatedItems,
      totalCost: newTotal,
      remainingBudget: newRemaining,
      budgetUtilization: newUtilization
    });
  };

  // Remove item from recommendation
  const handleRemoveItem = (productId) => {
    if (!optimizedResult) return;

    const updatedItems = optimizedResult.items.filter(item => item.id !== productId);
    const newTotal = updatedItems.reduce((acc, i) => acc + i.price, 0);
    const newRemaining = Math.max(0, optimizedResult.budget - newTotal);
    const newUtilization = Math.min(100, Math.round((newTotal / optimizedResult.budget) * 100));

    setOptimizedResult({
      ...optimizedResult,
      items: updatedItems,
      totalCost: newTotal,
      remainingBudget: newRemaining,
      budgetUtilization: newUtilization
    });
  };

  // Request AI explanations for alternatives for a specific item
  const handleRequestAiAlternatives = async (targetItem) => {
    if (!optimizedResult) return;

    try {
      const altData = await fetchAiAlternatives({
        productId: targetItem.id,
        currentCartItemIds: optimizedResult.items.map(i => i.id),
        budget: optimizedResult.budget,
        currentTotal: optimizedResult.totalCost,
        query: queryText
      });

      if (altData && altData.alternatives) {
        // Update target item's alternatives with the enriched ones
        setOptimizedResult(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map(item =>
              item.id === targetItem.id
                ? { ...item, alternatives: altData.alternatives, swapAdvice: altData.swapAdvice }
                : item
            )
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch AI alternatives:', err);
    }
  };

  // Manually add product to recommended list
  const handleManualAddProduct = (product) => {
    if (!optimizedResult) return;

    const updatedItems = [
      ...optimizedResult.items,
      {
        ...product,
        slotLabel: `Manual Addition (${product.category})`,
        selectionReason: `Added manually from catalog.`,
        alternatives: findAlternatives(product, productsData)
      }
    ];

    const newTotal = updatedItems.reduce((acc, i) => acc + i.price, 0);
    const newRemaining = Math.max(0, optimizedResult.budget - newTotal);
    const newUtilization = Math.min(100, Math.round((newTotal / optimizedResult.budget) * 100));

    setOptimizedResult({
      ...optimizedResult,
      items: updatedItems,
      totalCost: newTotal,
      remainingBudget: newRemaining,
      budgetUtilization: newUtilization
    });

    setIsManualAddOpen(false);
  };

  // Apply to actual cart
  const handleApplyToCart = () => {
    if (!optimizedResult || optimizedResult.items.length === 0) return;
    applyOptimizedCart(optimizedResult.items, optimizedResult.budget);
    navigate('/cart');
  };

  // Filter available products for manual addition that fit within remaining budget
  const manualAddCandidates = productsData.filter(p => {
    if (!optimizedResult) return false;
    const isAlreadyIn = optimizedResult.items.some(i => i.id === p.id);
    const fitsBudget = p.price <= optimizedResult.remainingBudget;
    return !isAlreadyIn && fitsBudget;
  });

  return (
    <div className="space-y-10">
      
      {/* Page Header with AI Status Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Smart Cart Builder • Phase 2</span>
            </span>

            {/* AI Assistant Indicator */}
            {backendHealth.groqConfigured ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Groq AI Active ({backendHealth.model})</span>
              </span>
            ) : backendHealth.available ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Groq AI Ready (Key pending in backend/.env)</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-slate-500" />
                <span>Deterministic Knapsack Engine (Active)</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Optimize Your Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Describe your shopping requirements and budget. Groq AI extracts your intent while our knapsack engine strictly enforces your budget limit.
          </p>
        </div>

        {/* AI Guarantee Notice */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-600 max-w-xs flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p>
            <strong>Catalog Verified:</strong> Recommendations use our real 28-product catalog. Cost is strictly mathematically guaranteed ≤ budget.
          </p>
        </div>
      </div>

      {/* Main Grid: Input Form vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Configuration Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
            
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-purple-600" />
              <span>Input Parameters</span>
            </h2>

            {/* 1. Total Shopping Budget */}
            <BudgetInput
              value={budgetVal}
              onChange={(newVal) => setBudgetVal(newVal)}
              label="1. Total Shopping Budget (INR)"
              helperText="Target limit. The generated cart will never exceed this budget."
            />

            {/* 2. Natural Language Requirements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-purple-600 rounded-full inline-block"></span>
                  2. Describe Your Shopping Requirements
                </label>
              </div>

              <textarea
                rows={4}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="E.g., I need a college student setup with wireless headphones, a laptop stand, a mouse, and a backpack. My budget is ₹15,000. Prioritize quality and value for money."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition leading-relaxed"
              />

              {/* Template shortcuts */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Quick Prompt Examples:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className="text-[11px] font-medium bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 transition"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Categories Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-purple-600 rounded-full inline-block"></span>
                3. Target Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Priority Option */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-purple-600 rounded-full inline-block"></span>
                4. Optimization Priority
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lowest-price', label: 'Lowest Price', desc: 'Max savings', icon: DollarSign },
                  { id: 'best-value', label: 'Best Value', desc: 'Top rating / ₹', icon: Scale },
                  { id: 'best-quality', label: 'Best Quality', desc: 'Top specs', icon: Award }
                ].map((item) => {
                  const isSelected = priority === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPriority(item.id)}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-between ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-600 text-purple-900 shadow-xs ring-1 ring-purple-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold leading-tight block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Preferred Brands */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-purple-600 rounded-full inline-block"></span>
                  5. Preferred Brands (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Bonus weight</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BRANDS.map((brand) => {
                  const isSelected = preferredBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={isOptimizing}
              onClick={handleRunOptimizer}
              className={`w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer ${
                isOptimizing ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{loadingStepText}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Optimized Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Optimization Results Dashboard (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Loading State Overlay */}
          {isOptimizing && (
            <div className="bg-white rounded-3xl border border-purple-200 p-8 sm:p-12 text-center shadow-md animate-pulse space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
                <Bot className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  CartMind AI is Computing Your Best Cart
                </h3>
                <p className="text-sm text-purple-700 font-medium mt-1">
                  {loadingStepText}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Querying Groq API ({backendHealth.model}) • Enforcing budget limits strictly
                </p>
              </div>
            </div>
          )}

          {!isOptimizing && optimizedResult ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Fallback Notice Banner if applicable */}
              {optimizedResult.fallback && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2.5 shadow-xs">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Operating in Deterministic Mode</span>
                    <span>
                      Cart was calculated using our local knapsack optimizer. To activate full Groq LLM natural language parsing and AI narratives, add your <code className="bg-amber-100 px-1 rounded font-mono">GROQ_API_KEY</code> to <code className="bg-amber-100 px-1 rounded font-mono">backend/.env</code>.
                    </span>
                  </div>
                </div>
              )}

              {/* AI Cart Summary & Insights Card (When Groq is Active) */}
              {optimizedResult.aiSummary && (
                <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/80 to-violet-50/90 rounded-3xl border border-purple-200 p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Groq AI Cart Analysis
                        </h4>
                        <span className="text-[11px] text-purple-700 font-medium">
                          Powered by {backendHealth.model}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✓ Catalog Verified & Budget Compliant
                    </span>
                  </div>

                  {/* Summary Text */}
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {optimizedResult.aiSummary}
                  </p>

                  {/* Value Insight */}
                  {optimizedResult.aiValueInsight && (
                    <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-purple-100 text-xs text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Value Assessment:</strong> {optimizedResult.aiValueInsight}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Results Top Banner */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Optimized Combination Generated</span>
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2">
                      Recommended Smart Cart
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated against {productsData.length} catalog items for strict budget compliance.
                    </p>
                  </div>

                  {/* Actions: Apply to Cart */}
                  <button
                    onClick={handleApplyToCart}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl transition shadow-md shadow-purple-200 flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Apply to Active Cart</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar visual */}
                <BudgetProgress
                  spent={optimizedResult.totalCost}
                  budget={optimizedResult.budget}
                  title="Optimized Cart Budget Utilization"
                />

                {/* Detected Slot Chips */}
                {optimizedResult.detectedSlots && optimizedResult.detectedSlots.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                      Matched Requirements:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {optimizedResult.detectedSlots.map((slot) => (
                        <span
                          key={slot}
                          className="text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-purple-500" />
                          <span>{slot}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Items Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Selected Combination ({optimizedResult.items.length} items)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Swap with alternatives or remove items to customize your cart.
                  </p>
                </div>

                {/* Manual Add Button */}
                {optimizedResult.remainingBudget >= 200 && (
                  <button
                    type="button"
                    onClick={() => setIsManualAddOpen(!isManualAddOpen)}
                    className="text-xs font-semibold text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item ({formatINR(optimizedResult.remainingBudget)} left)</span>
                  </button>
                )}
              </div>

              {/* Manual Add Drawer / Panel */}
              {isManualAddOpen && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-purple-200/80 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Available Products Within Remaining Budget ({formatINR(optimizedResult.remainingBudget)})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Choose any item below to add to this optimized bundle.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsManualAddOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  {manualAddCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                      {manualAddCandidates.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                            <span className="font-bold text-purple-700">{formatINR(product.price)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleManualAddProduct(product)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-2 py-1 rounded-lg shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No additional products found under {formatINR(optimizedResult.remainingBudget)}.
                    </p>
                  )}
                </div>
              )}

              {/* Recommended Items List */}
              <div className="space-y-4">
                {optimizedResult.items.map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    onReplace={handleReplaceItem}
                    onRemove={handleRemoveItem}
                    budgetHeadroom={optimizedResult.remainingBudget}
                    onRequestAiAlternatives={handleRequestAiAlternatives}
                    isAiEnhanced={optimizedResult.isAiEnhanced}
                  />
                ))}
              </div>

              {/* Bottom Summary & Actions */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Final Cart Estimate:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatINR(optimizedResult.totalCost)}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      ({formatINR(optimizedResult.remainingBudget)} unspent)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRunOptimizer}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToCart}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-purple-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Transfer to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ) : !isOptimizing && (
            /* Blank state before generation */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Optimize</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                Fill in your shopping parameters on the left and click "Generate Optimized Cart" to view your customized product combination.
              </p>
              <button
                onClick={handleRunOptimizer}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition shadow-xs"
              >
                Generate Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
