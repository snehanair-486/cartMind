import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure backend/.env is loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

let groqClient = null;

/**
 * Initializes and returns the Groq SDK client instance
 */
function getGroqClient() {
  const currentKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
  if (!currentKey || currentKey === 'your_groq_api_key_here') {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: currentKey
    });
  }
  return groqClient;
}

/**
 * Checks if Groq API key is present and configured
 */
export function isGroqConfigured() {
  const key = process.env.GROQ_API_KEY || GROQ_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'your_groq_api_key_here');
}

/**
 * Returns current model name
 */
export function getGroqModel() {
  return process.env.GROQ_MODEL || GROQ_MODEL;
}

/**
 * Verifies Groq API connectivity with a lightweight ping
 */
export async function testGroqConnection() {
  const client = getGroqClient();
  if (!client) {
    return {
      success: false,
      error: 'GROQ_API_KEY is not configured in backend/.env',
      configured: false
    };
  }

  const model = getGroqModel();
  try {
    const completion = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are CartMind AI ping check. Respond with "pong" and nothing else.' },
        { role: 'user', content: 'ping' }
      ],
      max_tokens: 10,
      temperature: 0.1
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '';
    return {
      success: true,
      configured: true,
      model: model,
      reply
    };
  } catch (error) {
    return {
      success: false,
      configured: true,
      model: model,
      error: error.message || 'Groq connection failed',
      code: error.status || error.code || 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Parses a user's natural language shopping request using Groq
 * Extracts budget, needed items, categories, priority, and brand preferences.
 */
export async function parseShoppingRequestWithGroq(queryText) {
  const client = getGroqClient();
  if (!client) {
    throw new Error('Groq API client is not configured.');
  }

  const model = getGroqModel();

  const prompt = `You are the parsing brain of CartMind, an AI-powered smart shopping assistant.
A user has written their shopping requirements. Extract their shopping intent into strict JSON format.

Available categories in CartMind:
- Electronics
- Accessories
- Study Essentials
- Home & Living
- Lifestyle

Valid priorities:
- "lowest-price" (user wants maximum savings / budget picks)
- "best-quality" (user emphasizes durability, high specs, top brands, premium)
- "best-value" (balanced rating-to-price, default)

User query:
"${queryText}"

Respond ONLY with a valid JSON object matching this schema:
{
  "extractedBudget": number or null (extract amount in INR if mentioned, e.g. 15000),
  "requiredProducts": ["array of specific product keywords, e.g. 'headphones', 'mouse', 'laptop stand', 'backpack'"],
  "matchedCategories": ["Electronics", "Accessories", ...],
  "purpose": "brief summary of user goal, e.g. 'College student desk setup'",
  "preferredBrands": ["array of brands mentioned by user, e.g. 'boAt', 'Sony', 'Logitech'"],
  "priority": "lowest-price" | "best-quality" | "best-value",
  "additionalRequirements": "any extra constraints or notes"
}`;

  const completion = await client.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: 'You are a precise JSON extractor. Output valid JSON only, without markdown code fences or conversational text.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch (err) {
    // If wrapped in backticks or markdown
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Uses Groq to generate AI explanation and cart summary for a set of verified catalog items
 * Strictly uses the REAL products chosen by the deterministic optimizer.
 */
export async function generateCartExplanationsWithGroq({
  userQuery,
  budget,
  totalCost,
  remainingBudget,
  priority,
  items
}) {
  const client = getGroqClient();
  if (!client) {
    return null;
  }

  const model = getGroqModel();

  // Create compact product info for Groq
  const itemsContext = items.map((item, index) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    brand: item.brand,
    rating: item.rating,
    slotLabel: item.slotLabel || item.category
  }));

  const prompt = `You are CartMind AI Shopping Assistant.
The user requested: "${userQuery || 'Smart cart setup'}"
Budget: ₹${budget.toLocaleString('en-IN')}
Total Calculated Cost: ₹${totalCost.toLocaleString('en-IN')}
Remaining Unspent Budget: ₹${remainingBudget.toLocaleString('en-IN')}
Optimization Priority: ${priority}

Our deterministic knapsack optimizer has selected these EXACT products from our verified catalog:
${JSON.stringify(itemsContext, null, 2)}

Provide a concise, compelling AI analysis explaining:
1. "cartSummary": A warm 2-3 sentence overview explaining how this entire combination satisfies their needs within their ₹${budget.toLocaleString('en-IN')} budget.
2. "itemExplanations": An object mapping each product "id" to a 1-sentence explanation of why it was selected for their requirements and priority.
3. "valueInsight": 1-2 sentences on why this bundle gives good value and how the remaining ₹${remainingBudget.toLocaleString('en-IN')} helps them.

Respond ONLY with valid JSON:
{
  "cartSummary": "...",
  "itemExplanations": {
    "product-id-1": "...",
    "product-id-2": "..."
  },
  "valueInsight": "..."
}`;

  try {
    const completion = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are CartMind AI. Provide honest, enthusiastic shopping advice strictly for the provided products. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq cart explanation generation error:', error.message);
    return null;
  }
}

/**
 * Uses Groq to generate intelligent rationale for product alternatives
 * Explains why the user might swap to an alternative from the real catalog.
 */
export async function explainAlternativesWithGroq({
  currentProduct,
  alternatives,
  budgetHeadroom,
  userQuery
}) {
  const client = getGroqClient();
  if (!client) {
    return null;
  }

  const model = getGroqModel();

  const prompt = `You are CartMind AI Shopping Assistant.
A user is reviewing their shopping cart and considering swapping the following product:
Current Product:
- Name: "${currentProduct.name}"
- Price: ₹${currentProduct.price}
- Brand: "${currentProduct.brand}"
- Rating: ${currentProduct.rating}★

Available Real Alternatives from our catalog (Budget headroom for increase is ₹${budgetHeadroom}):
${JSON.stringify(alternatives.map(a => ({
  id: a.id,
  name: a.name,
  price: a.price,
  priceDiff: a.price - currentProduct.price,
  brand: a.brand,
  rating: a.rating
})), null, 2)}

Provide a brief, helpful 1-sentence recommendation rationale for each alternative:
Respond ONLY with valid JSON:
{
  "swapAdvice": "Brief overall tip on whether to swap",
  "alternativeReasons": {
    "alternative-id-1": "Specific 1-sentence reason to consider this (e.g. saves ₹X or gives premium specs)",
    "alternative-id-2": "..."
  }
}`;

  try {
    const completion = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are CartMind AI. Provide realistic alternative comparison advice. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq alternatives explanation error:', error.message);
    return null;
  }
}
