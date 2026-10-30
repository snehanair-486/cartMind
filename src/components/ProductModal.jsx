import React from 'react';
import { X, Star, ShieldCheck, Check, ShoppingCart, Tag } from 'lucide-react';
import { formatINR, calculateDiscount } from '../utils/formatters';
import { useCart } from '../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart, isInCart, getItemQuantity } = useCart();

  if (!product) return null;

  const inCart = isInCart(product.id);
  const qty = getItemQuantity(product.id);
  const discount = calculateDiscount(product.price, product.originalPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="bg-slate-50 p-6 flex items-center justify-center relative overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-72 w-full object-cover rounded-2xl shadow-sm"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
              }}
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Details Content */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md">
                  {product.category}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Brand: <strong className="text-slate-700">{product.brand}</strong>
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 leading-snug mb-2">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-slate-400">
                  ({product.reviewCount?.toLocaleString('en-IN')} verified reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-slate-900">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Specifications List */}
              {product.specifications && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Specifications
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-0.5">
                        <span className="text-slate-500 font-medium">{key}</span>
                        <span className="text-slate-800 font-semibold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => {
                  addToCart(product, 1);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-purple-200"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{inCart ? `Add Another (Currently: ${qty})` : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
