import { optimizeCart, findAlternatives } from './src/utils/optimizer.js';
import productsData from './src/data/products.js';

console.log("=== Testing CartMind Optimizer Engine ===");

// Test 1: College student setup (₹15,000)
console.log("\n--- Test 1: College Student Setup (Budget: ₹15,000, Best-Value) ---");
const test1 = optimizeCart({
  budget: 15000,
  query: "I need a college student setup with wireless headphones, a laptop stand, a mouse, and a backpack. My budget is ₹15,000. Prioritize quality and value for money.",
  categories: ['Electronics', 'Accessories', 'Study Essentials'],
  priority: 'best-value',
  preferredBrands: ['boAt', 'Logitech'],
  allProducts: productsData
});

console.log(`Items count: ${test1.items.length}`);
console.log(`Total cost: ₹${test1.totalCost.toLocaleString('en-IN')}`);
console.log(`Budget: ₹${test1.budget.toLocaleString('en-IN')}`);
console.log(`Remaining: ₹${test1.remainingBudget.toLocaleString('en-IN')}`);
console.log(`Utilization: ${test1.budgetUtilization}%`);
console.log(`Under budget guarantee: ${test1.totalCost <= test1.budget ? "PASSED" : "FAILED"}`);

test1.items.forEach((item, idx) => {
  console.log(`  ${idx + 1}. [${item.slotLabel}] ${item.name} - ₹${item.price.toLocaleString('en-IN')} (${item.rating}★)`);
  console.log(`     Why: ${item.selectionReason}`);
  console.log(`     Alternatives available: ${item.alternatives?.length || 0}`);
});

// Test 2: Low budget constraint (₹2,500)
console.log("\n--- Test 2: Low Budget Constraint (Budget: ₹2,500, Lowest-Price) ---");
const test2 = optimizeCart({
  budget: 2500,
  query: "Wireless mouse, mouse pad, and mobile stand.",
  categories: ['Electronics', 'Accessories'],
  priority: 'lowest-price',
  preferredBrands: [],
  allProducts: productsData
});

console.log(`Items count: ${test2.items.length}`);
console.log(`Total cost: ₹${test2.totalCost.toLocaleString('en-IN')}`);
console.log(`Under budget guarantee: ${test2.totalCost <= test2.budget ? "PASSED" : "FAILED"}`);
test2.items.forEach((item, idx) => {
  console.log(`  ${idx + 1}. ${item.name} - ₹${item.price.toLocaleString('en-IN')}`);
});

// Test 3: Tight budget downscaling test across many budgets
console.log("\n--- Test 3: Strict Budget Guarantee Under Stressed Budgets ---");
const budgetsToTest = [500, 1000, 2000, 5000, 10000, 15000, 25000, 50000];
let allPassed = true;

budgetsToTest.forEach(b => {
  const res = optimizeCart({
    budget: b,
    query: "headphones, mouse, laptop stand, backpack, desk lamp, bottle",
    categories: [],
    priority: 'best-value',
    preferredBrands: ['Sony', 'Logitech'],
    allProducts: productsData
  });

  const passed = res.totalCost <= b;
  if (!passed) allPassed = false;
  console.log(`Budget: ₹${b.toString().padEnd(6)} -> Cart Total: ₹${res.totalCost.toString().padEnd(6)} (${res.items.length} items) - ${passed ? '✓ PASSED' : '✗ FAILED'}`);
});

console.log(`\nOverall Strict Budget Rule Verification: ${allPassed ? "100% VERIFIED" : "FAILED"}`);
