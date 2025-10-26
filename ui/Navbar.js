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

    btn.onclick = () => (window.location.hash = "cart");
    right.appendChild(btn);
  }

  nav.append(left, center, right);
  return nav;
}
