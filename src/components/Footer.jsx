import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 mt-20 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                CartMind
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              "Your budget. Your needs. Your smartest cart."
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Instead of recommending isolated items, CartMind generates the optimal combination of products that fits your exact budget and personal priorities.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 2: Groq AI Shopping Assistant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore CartMind
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-500 hover:text-purple-600 transition">
                  Shopping Dashboard
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-slate-500 hover:text-purple-600 transition">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/builder" className="text-slate-500 hover:text-purple-600 transition">
                  Smart Cart Builder
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-500 hover:text-purple-600 transition">
                  View Active Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Sample Categories
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Electronics & Gadgets</li>
              <li>Laptop Accessories</li>
              <li>Study Essentials & Books</li>
              <li>Home & Living Comfort</li>
              <li>Daily Lifestyle Gear</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CartMind — AI-Powered Smart Shopping Assistant. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Built with React + Vite + Tailwind CSS</span>
            <span>•</span>
            <span className="text-purple-600 font-medium">Phase 2: Powered by Groq AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
