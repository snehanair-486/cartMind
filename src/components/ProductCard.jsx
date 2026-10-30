import React, { useState } from 'react';
import { Star, ShoppingCart, Check, Eye, Plus, Minus } from 'lucide-react';
import { formatINR, calculateDiscount } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, isInCart, getItemQuantity } = useCart();
  const [showModal, setShowModal] = useState(false);

  const inCart = isInCart(product.id);
  const qty = getItemQuantity(product.id);
  const discount = calculateDiscount(product.price, product.originalPrice);

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-purple-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setShowModal(true)}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
              {product.brand}
            </span>
            {discount > 0 && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Quick View Button on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-purple-600 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Quick view specifications"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal text-[11px]">
                  ({product.reviewCount > 1000 ? `${(product.reviewCount / 1000).toFixed(1)}k` : product.reviewCount})
                </span>
              </div>
            </div>

            {/* Title */}
            <h3
              onClick={() => setShowModal(true)}
              className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 cursor-pointer mb-1.5"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          <div>
            {/* Price section */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg sm:text-xl font-black text-slate-900">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Actions: Add to Cart / Quantity controls */}
            {inCart ? (
              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(product.id, qty - 1)}
                  className="w-8 h-8 rounded-lg bg-white text-purple-700 hover:bg-purple-100 flex items-center justify-center font-bold shadow-xs transition"
                  title="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>{qty} in Cart</span>
                </div>
                <button
                  onClick={() => updateQuantity(product.id, qty + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-purple-700 hover:bg-purple-100 flex items-center justify-center font-bold shadow-xs transition"
                  title="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, 1)}
                className="w-full bg-slate-900 hover:bg-purple-600 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
