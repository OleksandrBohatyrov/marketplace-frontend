// src/utils/cart.js
const CART_KEY = 'cart_items';

export function getCart() {
  const data = localStorage.getItem(CART_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToCart(product) {
  const cart = getCart();
  if (!cart.find(p => p.id === product.id)) {
    cart.push(product);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function removeFromCart(id) {
  const cart = getCart().filter(p => p.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
