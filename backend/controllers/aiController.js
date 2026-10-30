import {
  isGroqConfigured,
  getGroqModel,
  testGroqConnection,
  parseShoppingRequestWithGroq
} from '../services/groqService.js';
import {
  calculateRecommendedCart,
  getAlternativesForProduct
} from '../services/shoppingService.js';

/**
 * Health check & Groq configuration status
 * GET /api/ai/health
 */
export async function getHealthStatus(req, res) {
  try {
    const configured = isGroqConfigured();
    const model = getGroqModel();
    return res.json({
      status: 'ok',
      service: 'CartMind AI Backend',
      groqConfigured: configured,
      model: model,
      phase: 2
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

/**
 * Test Groq API connectivity
 * POST /api/ai/test
 */
export async function testGroqApi(req, res) {
  try {
    const result = await testGroqConnection();
    if (!result.success) {
      return res.status(result.configured ? 502 : 400).json(result);
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Parse natural-language shopping request
 * POST /api/ai/parse-request
 * Body: { query: string }
 */
export async function parseShoppingRequest(req, res) {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required "query" string in request body.'
      });
    }

    if (!isGroqConfigured()) {
      // Deterministic fallback response when Groq is not configured
      return res.json({
        fallback: true,
        message: 'Groq API is not configured. Using deterministic query extractor.',
        parsed: {
          extractedBudget: null,
          requiredProducts: [],
          matchedCategories: [],
          purpose: 'Shopping Request',
          preferredBrands: [],
          priority: 'best-value',
          additionalRequirements: query
        }
      });
    }

    try {
      const parsed = await parseShoppingRequestWithGroq(query);
      return res.json({
        fallback: false,
        parsed
      });
    } catch (groqError) {
      console.warn('Groq parsing encountered error, falling back:', groqError.message);
      return res.json({
        fallback: true,
        error: groqError.message,
        parsed: {
          extractedBudget: null,
          requiredProducts: [],
          matchedCategories: [],
          purpose: 'Shopping Request',
          preferredBrands: [],
          priority: 'best-value',
          additionalRequirements: query
        }
      });
    }
  } catch (err) {
    console.error('Error in parseShoppingRequest controller:', err);
    return res.status(500).json({
      error: 'Internal server error while parsing request',
      details: err.message
    });
  }
}

/**
 * Generate optimized product combination with AI explanations
 * POST /api/ai/recommendations
 * Body: { budget, query, categories, priority, preferredBrands, forceDeterministic }
 */
export async function getRecommendations(req, res) {
  try {
    const {
      budget = 15000,
      query = '',
      categories = [],
      priority = 'best-value',
      preferredBrands = [],
      forceDeterministic = false
    } = req.body;

    // Validate budget
    const numericBudget = Number(budget);
    if (isNaN(numericBudget) || numericBudget < 100) {
      return res.status(400).json({
        error: 'Budget must be a valid positive number (minimum ₹100).'
      });
    }

    // Execute shopping optimization & AI explanation service
    const result = await calculateRecommendedCart({
      budget: numericBudget,
      query: String(query || ''),
      categories: Array.isArray(categories) ? categories : [],
      priority: String(priority || 'best-value'),
      preferredBrands: Array.isArray(preferredBrands) ? preferredBrands : [],
      forceDeterministic: Boolean(forceDeterministic)
    });

    return res.json(result);
  } catch (err) {
    console.error('Error in getRecommendations controller:', err);
    return res.status(500).json({
      error: 'Failed to calculate recommendations',
      details: err.message
    });
  }
}

/**
 * Get alternatives for an individual product with AI reasoning
 * POST /api/ai/alternatives
 * Body: { productId, currentCartItemIds, budget, currentTotal, query }
 */
export async function getAlternatives(req, res) {
  try {
    const {
      productId,
      currentCartItemIds = [],
      budget = 15000,
      currentTotal = 0,
      query = ''
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: 'Missing required "productId" parameter.'
      });
    }

    const result = await getAlternativesForProduct({
      productId,
      currentCartItemIds: Array.isArray(currentCartItemIds) ? currentCartItemIds : [],
      budget: Number(budget) || 15000,
      currentTotal: Number(currentTotal) || 0,
      userQuery: String(query || '')
    });

    return res.json(result);
  } catch (err) {
    console.error('Error in getAlternatives controller:', err);
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({
      error: 'Failed to retrieve alternatives',
      details: err.message
    });
  }
}
