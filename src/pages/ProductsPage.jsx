import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, Package } from 'lucide-react';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc, rating-desc

  // Sync category state when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Extract unique brands
  const allBrands = useMemo(() => {
    const brands = new Set(productsData.map(p => p.brand));
    return ['All', ...Array.from(brands).sort()];
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: productsData.length };
    productsData.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...productsData];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesDesc = p.shortDescription.toLowerCase().includes(q);
        const matchesTags = p.tags?.some(t => t.toLowerCase().includes(q));
        return matchesName || matchesBrand || matchesDesc || matchesTags;
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        // High rated and popular products first
        result.sort((a, b) => (b.rating * (b.reviewCount || 100)) - (a.rating * (a.reviewCount || 100)));
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrand, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedBrand !== 'All' || sortBy !== 'featured';

  const resetFilters = () => {
    setSearchQuery('');
    handleCategoryChange('All');
    setSelectedBrand('All');
    setSortBy('featured');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md">
              Catalog
            </span>
            <span className="text-xs text-slate-400">
              {productsData.length} Verified Products in Stock
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Explore Product Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse individual items or assemble them into an optimized cart with Smart Cart Builder.
          </p>
        </div>

        {/* CTA to Builder */}
        <Link
          to="/builder"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs sm:text-sm border border-purple-200/80 transition"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Launch Smart Cart Builder</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Search Input & Select Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="relative md:col-span-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, or tag (e.g., 'headphones', 'logitech', 'bag')..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Brand Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            >
              <option value="All">All Brands ({allBrands.length - 1})</option>
              {allBrands.filter(b => b !== 'All').map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
              >
                <option value="featured">Featured / Top Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating: Highest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
            categoryCounts={categoryCounts}
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of {productsData.length} products
          {selectedCategory !== 'All' && <span> in <strong className="text-purple-700">{selectedCategory}</strong></span>}
          {selectedBrand !== 'All' && <span> by <strong className="text-purple-700">{selectedBrand}</strong></span>}
        </span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No matching products found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            We couldn't find any products matching your current search terms or filter selection.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
