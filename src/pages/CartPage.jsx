import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Wallet, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw,
  PackageOpen
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';
import CartItem from '../components/CartItem';
import BudgetProgress from '../components/BudgetProgress';

export default function CartPage() {
  const navigate = useNavigate();
  const { 
    cart, 
    cartTotal, 
    cartOriginalTotal, 
    cartSavings, 
    cartCount, 
    budget, 
    setBudget, 
    remainingBudget, 
    isOverBudget, 
    clearCart 
  } = useCart();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  const handleSaveBudget = (e) => {
    e.preventDefault();
    setBudget(tempBudget);
    setIsEditingBudget(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
              Active Cart
            </span>
            <span className="text-xs text-slate-400">
              Persisted in LocalStorage
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your selected products, adjust quantities, and monitor budget allocation.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-auto text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Entire Cart</span>
          </button>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Items ({cartCount})
              </span>
              <span className="text-xs text-purple-600 font-medium">
                Changes recalculate automatically
              </span>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>

            {/* Cart footer helper */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <Link
                to="/products"
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
              >
                <span>+ Continue Browsing Products</span>
              </Link>
              <Link
                to="/builder"
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Re-optimize with Smart Cart Builder</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary & Budget Progress (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Visual Budget Meter */}
            <BudgetProgress
              spent={cartTotal}
              budget={budget}
              title="Target Budget Status"
            />

            {/* Quick Budget Adjuster */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-purple-600" />
                  <span>Session Budget</span>
                </span>
                {!isEditingBudget && (
                  <button
                    onClick={() => {
                      setTempBudget(budget);
                      setIsEditingBudget(true);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Adjust Budget
                  </button>
                )}
              </div>

              {isEditingBudget ? (
                <form onSubmit={handleSaveBudget} className="space-y-2 pt-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="500"
                      min="500"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-purple-700 transition"
                    >
                      Save Limit
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBudget(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-slate-500">Configured Limit:</span>
                  <span className="font-extrabold text-slate-900">{formatINR(budget)}</span>
                </div>
              )}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Items Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatINR(cartTotal)}</span>
                </div>

                {cartSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Total Savings (MRP):</span>
                    </span>
                    <span>-{formatINR(cartSavings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery:</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Total Amount:</span>
                  <span className="text-2xl font-black text-purple-700">
                    {formatINR(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Over budget banner */}
              {isOverBudget && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
                  <p className="font-semibold mb-1">Notice: Over Current Target Budget</p>
                  <p>
                    Your cart total exceeds your target budget by {formatINR(cartTotal - budget)}. You can reduce item quantities or click below to optimize.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/builder')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Optimize with Smart Cart Builder</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Phase 1 Demo • No real payment gateway required
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You don't have any products in your cart yet. You can manually browse our 28+ product catalog or let CartMind build an optimized cart for you!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/builder"
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition shadow-md shadow-purple-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Build Smart Cart</span>
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
