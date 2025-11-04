export const state = {
  cart: [],

  addToCart(product) {
    // normalize id key (support id_product or id)
    const id = product.id ?? product.id_product ?? product.ean ?? null;
    const item = {
      id: id,
      name: product.name || product.nom || product.title || "Produit",
      price: Number(product.price ?? product.prix ?? 0) || 0,
      image: product.image || product.image_url || (Array.isArray(product.images) ? product.images[0] : null) || "",
      quantity: Number(product.quantity) || Number(product.qty) || 1,
    };

    const found = id != null ? this.cart.find(p => p.id === id) : null;
    if (found) found.quantity += item.quantity;
    else this.cart.push(item);
    this.save();
    // notify listeners
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart.slice() } }));
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(p => p.id !== id);
    this.save();
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart.slice() } }));
  },

  // set absolute quantity for an item (id may be id_product or ean)
  setQuantity(id, qty) {
    if (id == null) return;
    const found = this.cart.find(p => p.id === id);
    if (!found) return;
    const q = Number(qty) || 0;
    if (q <= 0) {
      // remove if zero or negative
      this.removeFromCart(id);
      return;
    }
    found.quantity = q;
    this.save();
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart.slice() } }));
  },

  clearCart() {
    this.cart = [];
    this.save();
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart.slice() } }));
  },

  save() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  },

  load() {
    try {
      this.cart = JSON.parse(localStorage.getItem("cart") || "[]") || [];
    } catch (e) {
      this.cart = [];
    }
    // notify listeners of current state
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart.slice() } }));
  },
};
