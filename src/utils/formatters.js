/**
 * Formats a number to Indian Rupee (INR) currency representation
 * Example: 15499 -> "₹15,499"
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}

/**
 * Calculates discount percentage
 */
export function calculateDiscount(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
