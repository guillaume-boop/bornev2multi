export const state = {
  cart: [],

  addToCart(product) {
    const found = this.cart.find(p => p.id === product.id);
    if (found) found.quantity += product.quantity;
    else this.cart.push(product);
    this.save();
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(p => p.id !== id);
    this.save();
  },

  clearCart() {
    this.cart = [];
    this.save();
  },

  save() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  },

  load() {
    this.cart = JSON.parse(localStorage.getItem("cart") || "[]");
  },
};
