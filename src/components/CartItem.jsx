import React from 'react';
import { Trash2, Plus, Minus, Tag } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const itemTotal = product.price * quantity;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-purple-200 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              {product.category}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {product.brand}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1 mb-1">
            {product.name}
          </h4>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-700">
              {formatINR(product.price)} each
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Quick tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quantity & Item Subtotal */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Stepper */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
          <button
            type="button"
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="w-8 h-8 rounded-lg bg-white text-slate-600 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center font-bold shadow-xs transition"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-slate-800">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-8 h-8 rounded-lg bg-white text-slate-600 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center font-bold shadow-xs transition"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[90px]">
          <span className="text-[11px] font-medium text-slate-400 block uppercase">Subtotal</span>
          <span className="text-base font-black text-slate-900">
            {formatINR(itemTotal)}
          </span>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={() => removeFromCart(product.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
