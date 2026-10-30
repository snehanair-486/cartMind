import { optimizeCart, findAlternatives } from './optimizer.js';
import productsData from '../data/products.js';

const API_BASE = '/api/ai';

/**
 * Checks if the backend server is running and whether Groq is configured
 */
export async function checkAiBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      return { available: false, groqConfigured: false, model: null };
    }
    const data = await res.json();
    return {
      available: true,
      groqConfigured: Boolean(data.groqConfigured),
      model: data.model || 'llama-3.3-70b-versatile'
    };
  } catch (err) {
    return { available: false, groqConfigured: false, model: null, error: err.message };
  }
}

/**
 * Parses user shopping request via Groq AI (with deterministic fallback)
 */
export async function parseShoppingRequestWithAi(query) {
  try {
    const res = await fetch(`${API_BASE}/parse-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.parsed || null;
  } catch (err) {
    console.warn('AI request parsing unavailable, using local parsing:', err.message);
    return null;
  }
}

/**
 * Gets AI-enhanced recommendations from the backend.
 * Automatically falls back to the deterministic Phase 1 optimizer if the backend or Groq is unreachable.
 */
export async function fetchAiRecommendations({
  budget = 15000,
  query = '',
  categories = [],
  priority = 'best-value',
  preferredBrands = []
}) {
  try {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget,
        query,
        categories,
        priority,
        preferredBrands
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        source: data.isAiEnhanced ? 'groq-ai' : 'deterministic-backend'
      };
    } else {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${res.status}`);
    }
  } catch (networkOrServerError) {
    console.warn(
      'Backend AI endpoint unavailable. Falling back to local deterministic optimizer:',
      networkOrServerError.message
    );

    // Reliable Local Fallback (Phase 1 engine)
    const localResult = optimizeCart({
      budget,
      query,
      categories,
      priority,
      preferredBrands,
      allProducts: productsData
    });

    return {
      ...localResult,
      isAiEnhanced: false,
      aiSummary: null,
      fallback: true,
      source: 'local-fallback',
      fallbackNotice: 'Running on local deterministic engine (Backend offline or Groq API key not configured).'
    };
  }
}

/**
 * Fetches AI alternatives for an individual product from backend,
 * or falls back to local alternatives calculation.
 */
export async function fetchAiAlternatives({
  productId,
  currentCartItemIds = [],
  budget = 15000,
  currentTotal = 0,
  query = ''
}) {
  try {
    const res = await fetch(`${API_BASE}/alternatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        currentCartItemIds,
        budget,
        currentTotal,
        query
      })
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend alternatives unavailable, using local lookup:', err.message);
  }

  // Local fallback
  const product = productsData.find(p => p.id === productId);
  if (!product) return { alternatives: [], budgetHeadroom: 0 };

  const budgetHeadroom = Math.max(0, budget - currentTotal);
  const maxAffordable = budgetHeadroom + product.price;

  const alts = findAlternatives(product, productsData)
    .filter(a => !currentCartItemIds.includes(a.id))
    .map(alt => ({
      ...alt,
      priceDiff: alt.price - product.price,
      canAfford: alt.price <= maxAffordable
    }));

  return {
    currentProduct: product,
    alternatives: alts,
    budgetHeadroom,
    isAiEnhanced: false,
    swapAdvice: null
  };
}
