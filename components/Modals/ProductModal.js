import { QuantitySelector } from '../../ui/QuantitySelector.js';

export function ProductModal() {
  const product = {
    name: "NOM DU PRODUIT",
    price: 10.0,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    details:
      "Puissance : 40W RMS • Connectivité : Bluetooth 5.0 • Autonomie : 12h • Garantie : 2 ans",
    images: [
      "https://via.placeholder.com/300x300?text=Casque+1",
      "https://via.placeholder.com/300x300?text=Casque+2",
      "https://via.placeholder.com/300x300?text=Casque+3",
    ],
    similarProducts: [
      { name: "Produit 1", price: 9.0 },
      { name: "Produit 2", price: 18.0 },
      { name: "Produit 3", price: 15.0 },
    ],
  };

  const appFrame = document.getElementById("app-frame");
  if (appFrame) appFrame.classList.add("modal-active");

  // === Overlay ===
  const overlay = document.createElement("div");
  overlay.className = `
    fixed top-[9vh] bottom-0 left-0 right-0
    bg-black/30 flex items-center justify-center z-[100]
    transition-opacity duration-300
  `;
  overlay.style.opacity = "0";
  requestAnimationFrame(() => (overlay.style.opacity = "1"));

  let _repositionHandler = null;
  const closeModal = () => {
    if (appFrame) appFrame.classList.remove("modal-active");
    overlay.style.opacity = "0";
    // remove resize listener if set
    if (_repositionHandler) window.removeEventListener('resize', _repositionHandler);
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  // === MODAL ===
  const modal = document.createElement("div");
  modal.className = `
    relative bg-white rounded-[2.5vh] w-[95%] max-w-[85vh]
    max-h-[85vh] flex flex-col p-[3vh] shadow-2xl
    overflow-y-auto overflow-x-hidden transition-all duration-300 pb-[0vh]
  `;
  modal.onclick = (e) => e.stopPropagation();

  /*
  // === Bouton fermeture (commented out per request)
  const closeBtn = document.createElement("button");
  closeBtn.className = `
    absolute
    bg-[#DC2626] text-white w-[6vh] h-[6vh]
    rounded-full text-[3.2vh] font-bold flex items-center justify-center
    active:scale-95 transition shadow-lg z-[200]
  `;
  closeBtn.textContent = "X";
  closeBtn.onclick = closeModal;
  */

  // === SECTION VISUEL DU HAUT ===
  const top = document.createElement("div");
  top.className = "flex gap-[3vh] mb-[3vh] items-start justify-center relative";

  // Vignettes
  const thumbnails = document.createElement("div");
  thumbnails.className = "flex flex-col gap-[1.5vh] flex-shrink-0";
  let activeImage = 0;

  // Image principale (carrée)
  const imageWrapper = document.createElement("div");
  imageWrapper.className = `
    relative w-[38vh] aspect-square bg-[#D9D9D9]
    rounded-[2vh] flex items-center justify-center overflow-hidden
  `;

  const fallbackIcon = document.createElement("div");
  fallbackIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-[20vh] h-[20vh] text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  `;
  fallbackIcon.className =
    "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 z-[5]";
  imageWrapper.append(fallbackIcon);

  const mainImage = document.createElement("img");
  mainImage.src = product.images[0];
  mainImage.alt = product.name;
  mainImage.className =
    "w-full h-full object-contain opacity-0 transition-opacity duration-500 z-[4]";
  imageWrapper.append(mainImage);

  mainImage.onload = () => {
    fallbackIcon.style.opacity = "0";
    mainImage.style.opacity = "1";
  };
  mainImage.onerror = () => {
    mainImage.style.display = "none";
    fallbackIcon.style.opacity = "1";
  };

  product.images.forEach((src, i) => {
    const thumb = document.createElement("button");
    thumb.className = `
      w-[10vh] h-[10vh] rounded-[1vh]
      border-[0.3vh] ${i === 0 ? "border-[#A855F7]" : "border-gray-400"}
      bg-[#D9D9D9] flex items-center justify-center
      active:scale-95 transition
    `;
    thumb.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-[5vh] h-[5vh] text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>`;
    thumb.onclick = () => {
      activeImage = i;
      mainImage.src = src;
      thumbnails.querySelectorAll("button").forEach((b) => {
        b.classList.remove("border-[#A855F7]");
        b.classList.add("border-gray-400");
      });
      thumb.classList.remove("border-gray-400");
      thumb.classList.add("border-[#A855F7]");
      mainImage.style.opacity = "0";
      fallbackIcon.style.opacity = "0";
    };
    thumbnails.append(thumb);
  });

  top.append(thumbnails, imageWrapper);

  // === INFOS PRODUIT + QUANTITÉ (refined)
  const infoRow = document.createElement("div");
  infoRow.className = "flex justify-between items-center mb-[2vh] mt-[1vh]";

  const infoLeft = document.createElement("div");
  const name = document.createElement("h2");
  name.className =
    "text-[3vh] font-extrabold uppercase text-black leading-tight";
  name.textContent = product.name;
  const price = document.createElement("p");
  price.className = "text-[2.8vh] font-bold text-[#A855F7]";
  price.textContent = `${product.price.toFixed(2)} €`;
  infoLeft.append(name, price);

  // === Quantity Selector avec max stock ===
  let qty = 1;
  const qtySelector = QuantitySelector({
    value: qty,
    min: 1,
    max: product.stock || 10, // Utilise le stock du produit s'il existe, sinon 10 par défaut
    onChange: (newValue) => {
      qty = newValue;
      // Mise à jour du bouton valider si besoin
      if (validateBtn) {
        validateBtn.disabled = qty > (product.stock || 10);
        validateBtn.className = `
          ${validateBtn.disabled ? 'bg-gray-400' : 'bg-[#4ADE80]'}
          text-white text-[2.5vh] font-bold rounded-[1.5vh]
          py-[2vh] px-[5vh] uppercase active:scale-95 transition shadow-lg flex-1 max-w-[25vh]
        `;
      }
    }
  });
  infoRow.append(infoLeft, qtySelector);

  // === ONGLETS
  let activeTab = "description";
  const tabContainer = document.createElement("div");
  tabContainer.className = "flex gap-[2vh] mb-[2vh]";
  const descBtn = document.createElement("button");
  const detBtn = document.createElement("button");
  const textContainer = document.createElement("p");

  const updateTabs = () => {
    descBtn.className = `
      px-[3vh] py-[1.2vh] text-[1.8vh] rounded-[2vh] font-semibold uppercase
      border-2 ${activeTab === "description"
        ? "border-[#A855F7] text-[#A855F7] bg-white"
        : "border-gray-400 text-gray-600 bg-gray-100"}
      transition
    `;
    detBtn.className = `
      px-[3vh] py-[1.2vh] text-[1.8vh] rounded-[2vh] font-semibold uppercase
      border-2 ${activeTab === "details"
        ? "border-[#A855F7] text-[#A855F7] bg-white"
        : "border-gray-400 text-gray-600 bg-gray-100"}
      transition
    `;
    textContainer.textContent =
      activeTab === "description"
        ? product.description
        : product.details;
  };

  descBtn.textContent = "DESCRIPTION";
  detBtn.textContent = "DETAILS";
  descBtn.onclick = () => {
    activeTab = "description";
    updateTabs();
  };
  detBtn.onclick = () => {
    activeTab = "details";
    updateTabs();
  };
  tabContainer.append(descBtn, detBtn);

  textContainer.className =
    "text-[1.9vh] text-gray-800 mb-[3vh] leading-snug";
  updateTabs();

  // === PRODUITS SIMILAIRES
  const similarTitle = document.createElement("h3");
  similarTitle.textContent = "PRODUITS SIMILAIRES";
  similarTitle.className = "text-[2.2vh] font-bold mb-[1.5vh]";

  const similarGrid = document.createElement("div");
  similarGrid.className = "flex gap-[2vh] mb-[10vh]"; // extra bottom space for fixed footer

  product.similarProducts.forEach((item) => {
    const card = document.createElement("button");
    card.className = `
      flex-1 bg-[#D9D9D9] rounded-[1.5vh] p-[2vh] border-2 border-[#A855F7]
      flex flex-col items-center justify-center active:scale-95 transition
    `;
    card.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-[7vh] h-[7vh] text-gray-600 mb-[1vh]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="text-[2.2vh] font-bold text-[#A855F7]">${item.price.toFixed(
        2
      )} €</span>
    `;
    similarGrid.append(card);
  });

  // === VALIDATE BUTTON (STICKY) ===
  const validateContainer = document.createElement("div");
  validateContainer.className = `
    sticky bottom-0 left-0 w-[calc(100%+6vh)] -ml-[3vh]
    bg-white pt-[1vh] pb-[1.5vh] px-[3vh] flex justify-center gap-[2vh] border-t border-gray-200
    opacity-100 z-[10]
    `;

  const validateBtn = document.createElement("button");
  validateBtn.className = `
    bg-[#4ADE80] text-white text-[2.5vh] font-bold rounded-[1.5vh]
    py-[2vh] px-[5vh] uppercase active:scale-95 transition shadow-lg flex-1 max-w-[25vh]
  `;
  validateBtn.textContent = "VALIDER";
  validateBtn.onclick = () => {
    console.log(`✅ Produit ajouté : ${product.name} x${qty}`);
    closeModal();
  };
  // === Retour button (left of VALIDER) which closes the modal
  const returnBtn = document.createElement("button");
  returnBtn.className = `
    bg-[#A855F7] text-white text-[2.5vh] font-bold rounded-[1.5vh]
    py-[2vh] px-[5vh] uppercase active:scale-95 transition shadow-lg flex-1 max-w-[25vh]
  `;
  returnBtn.textContent = "RETOUR";
  returnBtn.onclick = () => closeModal();

  validateContainer.append(returnBtn, validateBtn);

  modal.append(
    // don't append closeBtn to modal (we'll append it to overlay later)
    top,
    infoRow,
    tabContainer,
    textContainer,
    similarTitle,
    similarGrid,
    validateContainer
  );
  overlay.append(modal);
  /*
  // close button positioning commented out per request
  // append close button to overlay and position it at modal's top-right
  overlay.append(closeBtn);
  // Position the close button based on modal position so it won't be clipped
  const positionCloseBtn = () => {
    // small offsets so button sits slightly outside modal corner
    const rect = modal.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const top = rect.top - overlayRect.top - closeBtn.offsetHeight / 3;
    const left = rect.left - overlayRect.left + rect.width - closeBtn.offsetWidth / 3;
    closeBtn.style.top = `${Math.max(top, 4)}px`;
    closeBtn.style.left = `${left}px`;
  };
  // wait for layout then position
  requestAnimationFrame(positionCloseBtn);
  // reposition on resize or scroll inside overlay
  _repositionHandler = positionCloseBtn;
  window.addEventListener('resize', _repositionHandler);
  */
  return overlay;
}
