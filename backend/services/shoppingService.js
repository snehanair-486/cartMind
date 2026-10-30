import productsData, { getProductById } from '../data/products.js';
import { optimizeCart, findAlternatives } from '../../src/utils/optimizer.js';
import {
  isGroqConfigured,
  parseShoppingRequestWithGroq,
  generateCartExplanationsWithGroq,
  explainAlternativesWithGroq
} from './groqService.js';

/**
 * Calculates a verified, budget-enforced shopping cart combination.
 * Uses the deterministic knapsack optimizer as the source of truth,
 * and enriches it with Groq AI insights when available.
 */
export async function calculateRecommendedCart({
  budget = 15000,
  query = '',
  categories = [],
  priority = 'best-value',
  preferredBrands = [],
  forceDeterministic = false
}) {
  const numericBudget = Math.max(500, Number(budget) || 15000);
  let effectiveQuery = query || '';
  let effectiveCategories = categories && categories.length > 0 ? categories : [];
  let effectivePriority = priority || 'best-value';
  let effectiveBrands = preferredBrands || [];
  let aiParsedMetadata = null;

  // 1. If Groq is configured and not forced to deterministic, parse the natural language query first
  if (!forceDeterministic && isGroqConfigured() && effectiveQuery.trim().length > 5) {
    try {
      const parsed = await parseShoppingRequestWithGroq(effectiveQuery);
      if (parsed) {
        aiParsedMetadata = parsed;
        // Use extracted budget if user hasn't explicitly overridden default
        if (parsed.extractedBudget && (!budget || budget === 15000)) {
          // Only adopt if valid positive number
          if (parsed.extractedBudget >= 500 && parsed.extractedBudget <= 500000) {
            // we can respect extracted budget
          }
        }
        if (parsed.matchedCategories && parsed.matchedCategories.length > 0 && effectiveCategories.length === 0) {
          effectiveCategories = parsed.matchedCategories;
        }
        if (parsed.priority && ['lowest-price', 'best-quality', 'best-value'].includes(parsed.priority)) {
          effectivePriority = parsed.priority;
        }
        if (parsed.preferredBrands && parsed.preferredBrands.length > 0 && effectiveBrands.length === 0) {
          effectiveBrands = parsed.preferredBrands;
        }
      }
    } catch (parseError) {
      console.warn('Groq parsing failed, continuing with deterministic parser:', parseError.message);
    }
  }

  // 2. Run the deterministic optimizer (knapsack algorithm) - SOURCE OF TRUTH
  const optimizedCart = optimizeCart({
    budget: numericBudget,
    query: effectiveQuery,
    categories: effectiveCategories,
    priority: effectivePriority,
    preferredBrands: effectiveBrands,
    allProducts: productsData
  });

  // Strict backend budget verification
  if (optimizedCart.totalCost > numericBudget) {
    throw new Error(`Critical error: Calculated cart total (₹${optimizedCart.totalCost}) exceeds target budget (₹${numericBudget}).`);
  }

  // Verify that all returned items strictly exist in our actual catalog
  const verifiedItems = optimizedCart.items.map(item => {
    const catalogProduct = getProductById(item.id);
    if (!catalogProduct) {
      throw new Error(`Security validation failed: Product ${item.id} not found in catalog.`);
    }
    return {
      ...catalogProduct, // enforce pristine catalog fields (price, image, specs, rating)
      slotLabel: item.slotLabel,
      selectionReason: item.selectionReason,
      alternatives: item.alternatives
    };
  });

  // Recalculate totals with pristine catalog data
  const finalTotalCost = verifiedItems.reduce((acc, i) => acc + i.price, 0);
  const finalRemainingBudget = Math.max(0, numericBudget - finalTotalCost);
  const finalUtilization = numericBudget > 0 ? Math.min(100, Math.round((finalTotalCost / numericBudget) * 100)) : 0;

  // 3. Enrich with Groq AI explanations if available
  let aiInsights = null;
  let isAiEnhanced = false;

  if (!forceDeterministic && isGroqConfigured() && verifiedItems.length > 0) {
    try {
      const explanations = await generateCartExplanationsWithGroq({
        userQuery: effectiveQuery,
        budget: numericBudget,
        totalCost: finalTotalCost,
        remainingBudget: finalRemainingBudget,
        priority: effectivePriority,
        items: verifiedItems
      });

      if (explanations) {
        aiInsights = explanations;
        isAiEnhanced = true;

        // Apply Groq's custom explanation to each verified item if provided
        if (explanations.itemExplanations) {
          verifiedItems.forEach(item => {
            if (explanations.itemExplanations[item.id]) {
              item.aiExplanation = explanations.itemExplanations[item.id];
              item.selectionReason = explanations.itemExplanations[item.id];
            }
          });
        }
      }
    } catch (aiErr) {
      console.warn('Groq explanation enrichment failed, using deterministic reasons:', aiErr.message);
    }
  }

  return {
    items: verifiedItems,
    totalCost: finalTotalCost,
    budget: numericBudget,
    remainingBudget: finalRemainingBudget,
    budgetUtilization: finalUtilization,
    itemCount: verifiedItems.length,
    priority: effectivePriority,
    detectedSlots: optimizedCart.detectedSlots,
    isAiEnhanced,
    aiSummary: aiInsights?.cartSummary || null,
    aiValueInsight: aiInsights?.valueInsight || null,
    aiParsedMetadata,
    fallback: !isAiEnhanced
  };
}

/**
 * Finds and explains alternatives for an individual product from the catalog.
 * Guarantees that suggested alternatives exist in the catalog and calculates budget headroom.
 */
export async function getAlternativesForProduct({
  productId,
  currentCartItemIds = [],
  budget = 15000,
  currentTotal = 0,
  userQuery = ''
}) {
  const currentProduct = getProductById(productId);
  if (!currentProduct) {
    throw new Error(`Product not found with ID: ${productId}`);
  }

  const numericBudget = Math.max(1, Number(budget) || 15000);
  const numericTotal = Math.max(0, Number(currentTotal) || 0);

  // Budget headroom for an individual replacement:
  // (budget - currentTotal) + currentProduct.price
  const maxAffordablePrice = (numericBudget - numericTotal) + currentProduct.price;
  const budgetHeadroom = Math.max(0, numericBudget - numericTotal);

  // Find real alternatives from catalog
  const catalogAlternatives = findAlternatives(currentProduct, productsData)
    .filter(alt => !currentCartItemIds.includes(alt.id));

  // Determine budget compliance for each alternative
  const alternativesWithCompliance = catalogAlternatives.map(alt => {
    const priceDiff = alt.price - currentProduct.price;
    const canAfford = alt.price <= maxAffordablePrice;

    return {
      ...alt,
      priceDiff,
      canAfford,
      newCartTotal: numericTotal + priceDiff,
      newRemainingBudget: Math.max(0, numericBudget - (numericTotal + priceDiff))
    };
  });

  // Enrich with Groq explanation if available
  let aiAlternativeInsights = null;
  let isAiEnhanced = false;

  if (isGroqConfigured() && alternativesWithCompliance.length > 0) {
    try {
      const groqAdvice = await explainAlternativesWithGroq({
        currentProduct,
        alternatives: alternativesWithCompliance,
        budgetHeadroom,
        userQuery
      });

      if (groqAdvice) {
        aiAlternativeInsights = groqAdvice;
        isAiEnhanced = true;

        if (groqAdvice.alternativeReasons) {
          alternativesWithCompliance.forEach(alt => {
            if (groqAdvice.alternativeReasons[alt.id]) {
              alt.aiReason = groqAdvice.alternativeReasons[alt.id];
            }
          });
        }
      }
    } catch (err) {
      console.warn('Groq alternative explanation failed, using catalog badges:', err.message);
    }
  }

  return {
    currentProduct,
    alternatives: alternativesWithCompliance,
    budgetHeadroom,
    isAiEnhanced,
    swapAdvice: aiAlternativeInsights?.swapAdvice || null
  };
}
