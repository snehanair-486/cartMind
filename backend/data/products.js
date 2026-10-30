import productsData from '../../src/data/products.js';

export const products = productsData;
export default products;

// Helper to look up a product by ID
export function getProductById(id) {
  return products.find(p => p.id === id) || null;
}

// Compact catalog representation for LLM prompt context (excludes large image URLs to save context tokens)
export function getCompactCatalog() {
  return products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    brand: p.brand,
    rating: p.rating,
    tags: p.tags,
    shortDescription: p.shortDescription
  }));
}
