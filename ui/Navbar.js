import { state } from '../state.js';
import { Cart } from '../components/Cart.js';

export function Navbar({ title = "MONOPRIX VINCI", showCart = true } = {}) {
  const nav = document.createElement("div");
  nav.className = `
    fixed top-0 left-1/2 -translate-x-1/2
    w-[min(100vw,56.25vh)]
    h-[9vh]
    px-[2.2vh]
    border-b-2 border-purple-600
    flex items-center justify-between
    bg-white shadow-sm
    z-50
  `;

  // === Logo (gauche) ===
  const left = document.createElement("div");
  left.className = "flex items-center";
  left.innerHTML = `
    <img src="./assets/logo.png"
         alt="Logo"
         class="h-[5.2vh] object-contain" />
  `;

  // === Titre (centre) ===
  const center = document.createElement("div");
  center.className = "flex-1 text-center";
  center.innerHTML = `
    <h1 class="text-[2.2vh] font-extrabold tracking-wide text-gray-900">
      ${title}
    </h1>
  `;

  // === Bouton panier (droite, version allégée) ===
  const right = document.createElement("div");
  if (showCart) {
    const btn = document.createElement("button");
    btn.className = `
      w-[6.5vh] h-[6.5vh]
      rounded-full
      bg-primary/70
      flex items-center justify-center
      transition-all duration-150 shadow-sm
    `;

    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"
          class="w-[3.2vh] h-[3.2vh] text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8">   <!-- trait plus fin -->
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17
          m0 0a2 2 0 100 4 2 2 0 000-4m-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    `;

    btn.onclick = () => {
      // If hash isn't cart, navigate to #cart (app.js will open it). If it is already #cart,
      // hashchange won't fire, so open the cart overlay directly.
      if (window.location.hash.replace('#','') !== 'cart') {
        window.location.hash = 'cart';
        return;
      }
      // remove existing overlays and open a fresh Cart overlay
      document.querySelectorAll('[data-app-overlay]').forEach(n => n.remove());
      document.body.appendChild(Cart());
    };
    // badge container
    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    btn.setAttribute('aria-label','Ouvrir le panier');
    wrapper.appendChild(btn);
    const badge = document.createElement('span');
    badge.className = `absolute -top-[1vh] -right-[1vh] text-white text-[1.4vh] font-bold rounded-full w-[3vh] h-[3vh] flex items-center justify-center shadow`;
    badge.style.backgroundColor = '#7CE07A';
    badge.style.display = 'none';
    badge.setAttribute('data-cart-count','');
    wrapper.appendChild(badge);
    right.appendChild(wrapper);

    // listen to cart updates
    const updateBadge = (e) => {
      const cart = (e && e.detail && e.detail.cart) || [];
      const totalCount = cart.reduce((s,i)=>s + (Number(i.quantity)||0), 0);
      if (totalCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = String(totalCount);
      } else {
        badge.style.display = 'none';
        badge.textContent = '';
      }
    };
    window.addEventListener('cart:updated', updateBadge);
    // initialize badge from current state immediately (state.load() may have run earlier)
    try {
      const current = Array.isArray(state.cart) ? state.cart : [];
      updateBadge({ detail: { cart: current } });
    } catch (e) {
      // ignore
    }
  }

  nav.append(left, center, right);
  return nav;
}
