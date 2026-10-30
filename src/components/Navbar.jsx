import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sparkles, SlidersHorizontal, Package, Home, Menu, X, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';

export default function Navbar() {
  const location = useLocation();
  const { cartCount, cartTotal, budget, remainingBudget, isOverBudget } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Product Catalog', path: '/products', icon: Package },
    { label: 'Smart Cart Builder', path: '/builder', icon: Sparkles, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-slate-900 bg-clip-text text-transparent">
                  CartMind
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200/80">
                  ⚡ Groq AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Smart Shopping Assistant
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-purple-50 text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  } ${link.highlight && !active ? 'border border-purple-200/60 text-purple-600' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Group: Budget Pill & Cart Button */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Quick Budget Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
                <Wallet className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block leading-none">Target Budget</span>
                <span className="font-bold text-slate-800">{formatINR(budget)}</span>
              </div>
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <div>
                <span className="text-slate-400 text-[10px] block leading-none">Remaining</span>
                <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatINR(remainingBudget)}
                </span>
              </div>
            </div>

            {/* Cart Link Button */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-xs ${
                isActive('/cart')
                  ? 'bg-purple-600 text-white shadow-purple-200'
                  : 'bg-slate-900 hover:bg-purple-600 text-white hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-purple-400 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden xl:inline text-xs opacity-90 pl-1 border-l border-white/20">
                  {formatINR(cartTotal)}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-fade-in">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    active
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-purple-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Mobile Budget Overview */}
            <div className="pt-2 border-t border-slate-100 px-4 py-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Target Budget:</span>
                <span className="font-bold text-slate-800">{formatINR(budget)}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-slate-500">Remaining Budget:</span>
                <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatINR(remainingBudget)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
