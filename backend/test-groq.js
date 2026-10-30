import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { isGroqConfigured, getGroqModel, testGroqConnection, parseShoppingRequestWithGroq } from './services/groqService.js';
import { calculateRecommendedCart, getAlternativesForProduct } from './services/shoppingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function runTests() {
  console.log('==================================================');
  console.log('   CartMind Phase 2 — Groq AI Integration Tests  ');
  console.log('==================================================\n');

  console.log(`1. Configuration Check:`);
  console.log(`   - Groq Configured: ${isGroqConfigured() ? 'YES (Key detected)' : 'NO (Missing or placeholder key in backend/.env)'}`);
  console.log(`   - Configured Model: ${getGroqModel()}\n`);

  if (!isGroqConfigured()) {
    console.log('ℹ️  Notice: GROQ_API_KEY is not set yet in backend/.env.');
    console.log('   Testing graceful fallback mode to deterministic optimizer...\n');
  } else {
    console.log('2. Testing Groq Connection & Model Response...');
    const pingResult = await testGroqConnection();
    console.log('   Result:', JSON.stringify(pingResult, null, 2));

    if (pingResult.success) {
      console.log('\n3. Testing Natural-Language Shopping Request Parsing...');
      try {
        const query = 'I need a college student setup with wireless headphones, a laptop stand, a mouse, and a backpack. My budget is ₹15,000. Prioritize quality and value for money.';
        const parsed = await parseShoppingRequestWithGroq(query);
        console.log('   Parsed output:', JSON.stringify(parsed, null, 2));
      } catch (err) {
        console.error('   Parsing error:', err.message);
      }
    }
  }

  console.log('\n4. Testing Full Recommendations Flow with Strict Budget Enforcement...');
  const rec = await calculateRecommendedCart({
    budget: 15000,
    query: 'college student setup with wireless headphones, a laptop stand, a mouse, and a backpack.',
    categories: ['Electronics', 'Accessories', 'Study Essentials'],
    priority: 'best-value',
    preferredBrands: ['boAt', 'Logitech']
  });

  console.log(`   - Total items recommended: ${rec.items.length}`);
  console.log(`   - Total cost: ₹${rec.totalCost.toLocaleString('en-IN')}`);
  console.log(`   - Budget target: ₹${rec.budget.toLocaleString('en-IN')}`);
  console.log(`   - Remaining budget: ₹${rec.remainingBudget.toLocaleString('en-IN')}`);
  console.log(`   - Budget utilization: ${rec.budgetUtilization}%`);
  console.log(`   - Strict budget compliance (cost <= budget): ${rec.totalCost <= rec.budget ? '✓ PASSED' : '✗ FAILED'}`);
  console.log(`   - AI Enhanced: ${rec.isAiEnhanced ? 'YES' : 'NO (Deterministic fallback active)'}`);
  if (rec.aiSummary) {
    console.log(`   - AI Cart Summary: "${rec.aiSummary}"`);
  }

  console.log('\n   Selected verified catalog products:');
  rec.items.forEach((item, idx) => {
    console.log(`     ${idx + 1}. ${item.name} (₹${item.price.toLocaleString('en-IN')}) — ${item.selectionReason}`);
  });

  console.log('\n5. Testing Alternatives Calculation & Budget Headroom...');
  const firstItem = rec.items[0];
  const altResult = await getAlternativesForProduct({
    productId: firstItem.id,
    currentCartItemIds: rec.items.map(i => i.id),
    budget: 15000,
    currentTotal: rec.totalCost,
    query: 'wireless headphones'
  });

  console.log(`   - Alternatives for "${firstItem.name}": ${altResult.alternatives.length} found`);
  altResult.alternatives.forEach((alt, idx) => {
    console.log(`     ${idx + 1}. ${alt.name} (₹${alt.price}) | Diff: ₹${alt.priceDiff} | Can afford: ${alt.canAfford}`);
  });

  console.log('\n==================================================');
  console.log('   All Core Backend Integration Tests Completed!  ');
  console.log('==================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
});
