import productsData from '../data/products.js';

/**
 * Keyword taxonomy mapping user query terms to recognizable item types/slots.
 */
const KEYWORD_SLOTS = [
  {
    id: 'headphones',
    label: 'Headphones / Audio',
    keywords: ['headphone', 'headphones', 'earphone', 'earphones', 'headset', 'audio', 'earbuds', 'music', 'sound', 'over-ear'],
    matchTags: ['headphones', 'audio']
  },
  {
    id: 'mouse',
    label: 'Wireless Mouse',
    keywords: ['mouse', 'mice', 'pointer', 'optical mouse'],
    matchTags: ['mouse']
  },
  {
    id: 'stand',
    label: 'Laptop Stand',
    keywords: ['laptop stand', 'stand', 'riser'],
    matchTags: ['laptop stand']
  },
  {
    id: 'backpack',
    label: 'Laptop Backpack',
    keywords: ['backpack', 'laptop bag', 'college bag', 'bag'],
    matchTags: ['backpack', 'laptop bag']
  },
  {
    id: 'keyboard',
    label: 'Keyboard / Combo',
    keywords: ['keyboard', 'typing', 'keystroke', 'combo'],
    matchTags: ['keyboard', 'combo']
  },
  {
    id: 'lamp',
    label: 'Desk Lamp / Study Light',
    keywords: ['lamp', 'desk light', 'study lamp', 'study light', 'table lamp', 'lighting'],
    matchTags: ['lamp', 'study lamp', 'desk light', 'bulb', 'lighting']
  },
  {
    id: 'notebook',
    label: 'Notebooks & Stationery',
    keywords: ['notebook', 'notebooks', 'notes', 'register', 'spiral', 'book', 'paper'],
    matchTags: ['notebook', 'notes', 'stationery', 'paper']
  },
  {
    id: 'pen',
    label: 'Premium Pen',
    keywords: ['pen', 'rollerball', 'ballpen', 'writing', 'parker'],
    matchTags: ['pen', 'writing']
  },
  {
    id: 'calculator',
    label: 'Scientific Calculator',
    keywords: ['calculator', 'scientific calculator', 'casio', 'math'],
    matchTags: ['calculator', 'scientific calculator']
  },
  {
    id: 'speaker',
    label: 'Portable Bluetooth Speaker',
    keywords: ['speaker', 'speakers', 'bluetooth speaker', 'sounddrum'],
    matchTags: ['speaker']
  },
  {
    id: 'powerbank',
    label: 'Fast-Charging Power Bank',
    keywords: ['power bank', 'powerbank', 'battery pack', 'portable charger'],
    matchTags: ['power bank', 'battery']
  },
  {
    id: 'smartwatch',
    label: 'Smartwatch / Fitness Tracker',
    keywords: ['smartwatch', 'smart watch', 'fitness tracker', 'watch', 'wearable'],
    matchTags: ['smartwatch', 'watch']
  },
  {
    id: 'mousepad',
    label: 'Desk Mat / Mouse Pad',
    keywords: ['mouse pad', 'mousepad', 'desk mat', 'desk pad', 'mat'],
    matchTags: ['mouse pad', 'desk mat', 'mat']
  },
  {
    id: 'cable',
    label: 'Charging Cable',
    keywords: ['cable', 'charging wire', 'cord', 'fast charging cable', 'type-c cable', 'charger cable'],
    matchTags: ['cable', 'fast charging']
  },
  {
    id: 'usbhub',
    label: 'USB 3.0 Hub / Adapter',
    keywords: ['usb hub', 'usb port', 'hub', 'adapter', 'dongle', 'splitter'],
    matchTags: ['usb hub', 'adapter']
  },
  {
    id: 'organizer',
    label: 'Cable & Tech Organizer',
    keywords: ['organizer', 'pouch', 'travel pouch', 'cable organizer', 'cable case'],
    matchTags: ['organizer', 'pouch', 'case']
  },
  {
    id: 'bottle',
    label: 'Insulated Water Bottle / Flask',
    keywords: ['bottle', 'flask', 'water bottle', 'thermosteel', 'milton flask'],
    matchTags: ['bottle', 'flask', 'water bottle']
  },
  {
    id: 'lunchbox',
    label: 'Executive Lunch Box',
    keywords: ['lunch box', 'lunchbox', 'tiffin', 'food container'],
    matchTags: ['lunch box', 'tiffin']
  },
  {
    id: 'glasses',
    label: 'Anti-Glare Computer Glasses',
    keywords: ['glasses', 'spectacles', 'blue light', 'anti glare', 'blue cut', 'eyewear'],
    matchTags: ['glasses', 'blue cut']
  },
  {
    id: 'sunglasses',
    label: 'Polarized Sunglasses',
    keywords: ['sunglasses', 'sun glasses', 'aviators', 'shades', 'polarized'],
    matchTags: ['sunglasses']
  },
  {
    id: 'cushion',
    label: 'Ergonomic Seat Cushion',
    keywords: ['cushion', 'seat cushion', 'chair cushion', 'tailbone', 'memory foam cushion'],
    matchTags: ['cushion', 'back support']
  },
  {
    id: 'pillow',
    label: 'Sleeping Support Pillows',
    keywords: ['pillow', 'pillows', 'bedding', 'sleep'],
    matchTags: ['pillow']
  },
  {
    id: 'shelf',
    label: 'Storage Rack / Shelf',
    keywords: ['shelf', 'shelves', 'storage rack', 'book shelf', 'multipurpose rack'],
    matchTags: ['shelf', 'storage', 'rack']
  }
];

/**
 * Calculates a priority score for a product based on user settings
 */
function scoreProduct(product, priority, preferredBrands = []) {
  const isPreferredBrand = preferredBrands.some(
    b => b.toLowerCase() === product.brand.toLowerCase()
  );
  const brandBoost = isPreferredBrand ? 25 : 0;

  switch (priority) {
    case 'lowest-price': {
      // Lower price gets high priority, rating as quality threshold
      const priceFactor = 10000 / Math.max(product.price, 100);
      return (priceFactor * 10) + (product.rating * 6) + brandBoost;
    }
    case 'best-quality': {
      // Heavily favor rating and review reputation
      const ratingScore = Math.pow(product.rating, 3) * 3;
      const reviewScore = Math.min((product.reviewCount || 0) / 1000, 20);
      return ratingScore + reviewScore + brandBoost;
    }
    case 'best-value':
    default: {
      // Value balances high user satisfaction (rating) with fair pricing
      const ratingWeight = Math.pow(product.rating, 2.2) * 5;
      const affordabilityWeight = Math.max(0, 12 - Math.log2(Math.max(product.price, 100))) * 4;
      return ratingWeight + affordabilityWeight + brandBoost;
    }
  }
}

/**
 * Generates an intuitive explanation why this item was picked
 */
function generateReason(product, priority, matchedSlotLabel, preferredBrands = []) {
  const isPreferredBrand = preferredBrands.some(
    b => b.toLowerCase() === product.brand.toLowerCase()
  );

  if (isPreferredBrand) {
    return `Matches preferred brand (${product.brand}) with excellent ${product.rating}★ rating.`;
  }

  if (priority === 'lowest-price') {
    return `Budget-optimized choice under ₹${product.price.toLocaleString('en-IN')} with solid ${product.rating}★ rating.`;
  } else if (priority === 'best-quality') {
    return `Top-rated choice (${product.rating}★ from ${product.reviewCount.toLocaleString('en-IN')} reviews) for superior quality.`;
  } else {
    return `Best price-to-performance ratio in ${matchedSlotLabel || product.category}.`;
  }
}

/**
 * Finds alternative products for a given item
 */
export function findAlternatives(product, allProducts = productsData) {
  return allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.tags.some(t => product.tags.includes(t))))
    .map(alt => {
      let badge = 'Alternative';
      if (alt.price < product.price) {
        badge = `Saves ₹${(product.price - alt.price).toLocaleString('en-IN')}`;
      } else if (alt.rating > product.rating) {
        badge = `Higher rating (${alt.rating}★)`;
      } else if (alt.brand !== product.brand) {
        badge = `By ${alt.brand}`;
      }
      return {
        ...alt,
        badge,
        diff: alt.price - product.price
      };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

/**
 * Main Cart Optimization Engine for Phase 1.
 * Pure deterministic knapsack-inspired heuristic that guarantees total <= budget.
 *
 * @param {Object} params
 * @param {number} params.budget - Total shopping budget in INR
 * @param {string} params.query - User natural language description
 * @param {string[]} params.categories - Selected categories
 * @param {string} params.priority - 'lowest-price' | 'best-quality' | 'best-value'
 * @param {string[]} params.preferredBrands - Selected brand names
 * @param {Array} [params.allProducts] - Optional custom products array
 * @returns {Object} Optimized cart summary with products, budget metrics, and recommendations
 */
export function optimizeCart({
  budget = 10000,
  query = '',
  categories = [],
  priority = 'best-value',
  preferredBrands = [],
  allProducts = productsData
}) {
  const numericBudget = Math.max(Number(budget) || 1000, 100);
  const normalizedQuery = (query || '').toLowerCase().trim();

  // 1. Identify slots/requirements from query keywords
  const matchedSlots = [];
  KEYWORD_SLOTS.forEach(slot => {
    const isMatched = slot.keywords.some(kw => {
      // Word boundary or substring check
      const regex = new RegExp(`\\b${kw}`, 'i');
      return regex.test(normalizedQuery);
    });
    if (isMatched) {
      matchedSlots.push(slot);
    }
  });

  // 2. If no query keywords matched, derive slots from selected categories or popular essentials
  if (matchedSlots.length === 0) {
    if (categories && categories.length > 0) {
      // Pick representative slots from selected categories
      const categorySlots = {
        'Electronics': [KEYWORD_SLOTS[0], KEYWORD_SLOTS[1], KEYWORD_SLOTS[6]], // headphones, mouse, speaker
        'Accessories': [KEYWORD_SLOTS[2], KEYWORD_SLOTS[12], KEYWORD_SLOTS[14]], // stand, mousepad, usb hub
        'Study Essentials': [KEYWORD_SLOTS[3], KEYWORD_SLOTS[5], KEYWORD_SLOTS[6]], // backpack, lamp, notebook
        'Home & Living': [KEYWORD_SLOTS[5], KEYWORD_SLOTS[20], KEYWORD_SLOTS[21]], // lamp/bulb, cushion, pillow
        'Lifestyle': [KEYWORD_SLOTS[16], KEYWORD_SLOTS[17], KEYWORD_SLOTS[18]] // bottle, lunchbox, glasses
      };
      categories.forEach(cat => {
        if (categorySlots[cat]) {
          categorySlots[cat].forEach(s => {
            if (!matchedSlots.some(m => m.id === s.id)) {
              matchedSlots.push(s);
            }
          });
        }
      });
    } else {
      // Default balanced setup (Headphones, Laptop Stand, Mouse, Backpack)
      matchedSlots.push(KEYWORD_SLOTS[0], KEYWORD_SLOTS[1], KEYWORD_SLOTS[2], KEYWORD_SLOTS[3]);
    }
  }

  // 3. For each slot, gather candidate products
  const slotCandidates = [];
  matchedSlots.forEach(slot => {
    let pool = allProducts.filter(product => {
      // If user selected category filters, product should ideally match (unless specific keyword override)
      const matchesCategory = categories.length === 0 || categories.includes(product.category);
      const matchesTags = slot.matchTags.some(t => product.tags.includes(t));
      return matchesTags && (matchesCategory || matchedSlots.length <= 4);
    });

    if (pool.length === 0) {
      // Fallback: match tags without category constraint
      pool = allProducts.filter(product => slot.matchTags.some(t => product.tags.includes(t)));
    }

    if (pool.length > 0) {
      // Sort candidates by priority score descending
      pool.sort((a, b) => {
        const scoreB = scoreProduct(b, priority, preferredBrands);
        const scoreA = scoreProduct(a, priority, preferredBrands);
        return scoreB - scoreA;
      });

      slotCandidates.push({
        slot,
        candidates: pool
      });
    }
  });

  // 4. Initial Selection: Choose top-scoring candidate per slot
  let currentSelection = slotCandidates.map(({ slot, candidates }) => {
    return {
      product: candidates[0],
      slot,
      candidatePool: candidates,
      candidateIndex: 0
    };
  });

  // Calculate total cost
  let totalCost = currentSelection.reduce((acc, item) => acc + item.product.price, 0);

  // 5. Budget Adjustment / Optimization:
  // If totalCost > numericBudget, downgrade items to cheaper candidates within their slots
  if (totalCost > numericBudget) {
    let improved = true;
    while (totalCost > numericBudget && improved) {
      improved = false;
      // Find candidate with greatest potential savings
      let bestDowngrade = null;
      let maxSavings = 0;

      currentSelection.forEach((sel, selIndex) => {
        if (sel.candidateIndex + 1 < sel.candidatePool.length) {
          const currentPrice = sel.product.price;
          const nextProduct = sel.candidatePool[sel.candidateIndex + 1];
          const savings = currentPrice - nextProduct.price;
          if (savings > 0 && savings > maxSavings) {
            maxSavings = savings;
            bestDowngrade = { selIndex, nextProduct, nextIndex: sel.candidateIndex + 1 };
          }
        }
      });

      if (bestDowngrade) {
        const { selIndex, nextProduct, nextIndex } = bestDowngrade;
        currentSelection[selIndex].product = nextProduct;
        currentSelection[selIndex].candidateIndex = nextIndex;
        totalCost = currentSelection.reduce((acc, item) => acc + item.product.price, 0);
        improved = true;
      }
    }

    // If still exceeding budget even after all downgrades, drop the lowest-value slot
    while (totalCost > numericBudget && currentSelection.length > 1) {
      // Sort slots by lowest score
      currentSelection.sort((a, b) => {
        const scoreA = scoreProduct(a.product, priority, preferredBrands);
        const scoreB = scoreProduct(b.product, priority, preferredBrands);
        return scoreA - scoreB;
      });
      // Remove the lowest scoring item
      currentSelection.shift();
      totalCost = currentSelection.reduce((acc, item) => acc + item.product.price, 0);
    }
  }

  // 6. If leftover budget allows and we have headroom, check if we can add an essential complementary item
  const selectedProductIds = new Set(currentSelection.map(s => s.product.id));
  const selectedTagSet = new Set();
  currentSelection.forEach(s => s.product.tags?.forEach(t => selectedTagSet.add(t)));

  let remainingBudget = numericBudget - totalCost;

  if (remainingBudget >= 200) {
    // Find unselected products that fit within the remaining budget and don't duplicate existing item types
    const affordableAdditions = allProducts
      .filter(p => !selectedProductIds.has(p.id) && p.price <= remainingBudget)
      .filter(p => {
        // Exclude products that duplicate primary function (e.g., if headphones or mouse already chosen)
        const primaryTag = p.tags?.[0];
        const isDuplicateType = primaryTag && selectedTagSet.has(primaryTag);
        return !isDuplicateType;
      })
      .filter(p => categories.length === 0 || categories.includes(p.category))
      .sort((a, b) => {
        const scoreB = scoreProduct(b, priority, preferredBrands);
        const scoreA = scoreProduct(a, priority, preferredBrands);
        return scoreB - scoreA;
      });

    // If there is an affordable high-utility addition that fits and leaves budget >= 0
    if (affordableAdditions.length > 0 && currentSelection.length < 6) {
      const bonusProduct = affordableAdditions[0];
      if (totalCost + bonusProduct.price <= numericBudget) {
        currentSelection.push({
          product: bonusProduct,
          slot: { id: 'bonus', label: `Bonus Smart Match (${bonusProduct.category})` },
          candidatePool: [bonusProduct],
          candidateIndex: 0,
          isBonus: true
        });
        totalCost += bonusProduct.price;
        remainingBudget = numericBudget - totalCost;
      }
    }
  }

  // Double check strict budget guarantee
  if (totalCost > numericBudget && currentSelection.length > 0) {
    currentSelection = currentSelection.filter(s => s.product.price <= numericBudget);
    totalCost = currentSelection.reduce((acc, item) => acc + item.product.price, 0);
    remainingBudget = numericBudget - totalCost;
  }

  // 7. Format final recommended products with reasons and alternative options
  const recommendedItems = currentSelection.map(item => {
    const p = item.product;
    const reason = item.isBonus
      ? `Bonus value item added to utilize remaining budget within your target.`
      : generateReason(p, priority, item.slot?.label, preferredBrands);

    const alternatives = findAlternatives(p, allProducts);

    return {
      ...p,
      selectionReason: reason,
      slotLabel: item.slot?.label || p.category,
      alternatives
    };
  });

  const budgetUtilization = numericBudget > 0
    ? Math.min(100, Math.round((totalCost / numericBudget) * 100))
    : 0;

  return {
    items: recommendedItems,
    totalCost,
    budget: numericBudget,
    remainingBudget: Math.max(0, remainingBudget),
    budgetUtilization,
    itemCount: recommendedItems.length,
    priority,
    detectedSlots: matchedSlots.map(s => s.label)
  };
}
