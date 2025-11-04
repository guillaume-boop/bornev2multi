import { QuantitySelector } from '../../ui/QuantitySelector.js';
import { Button } from '../../ui/Button.js';
import { state } from '../../state.js';

export function ProductModal(p, allProducts = []) {
  const raw = p || {};
  // debug: log which product is being opened
  console.log("[ProductModal] open", { id_product: raw.id_product, ean: raw.ean, nom: raw.nom });

  // Normalize incoming product fields (support French keys used elsewhere)
  // We create two fields:
  // - shortDescription: shown in the DESCRIPTION tab
  // - fullDescription: shown in the DETAILS tab
  const product = {
    name: raw.name || raw.nom || "NOM DU PRODUIT",
    price:
      typeof raw.price === "number"
        ? raw.price
        : Number(raw.price ?? raw.prix) || 0,
    // try many possible keys for short description (include French `description_courte`)
    shortDescription:
      raw.description_courte ?? raw.short_description ?? raw.short_description_html ?? raw.resume ?? raw.excerpt ?? raw.description_short ?? raw.desc_short ?? null,
    // full description / details
    fullDescription:
      raw.description ?? raw.description_html ?? raw.details ?? raw.details_html ?? raw.long_description ?? raw.caracteristiques ?? "",
    images: Array.isArray(raw.images) && raw.images.length ? raw.images : raw.image_url ? [raw.image_url] : [],
    similarProducts: Array.isArray(raw.similarProducts) ? raw.similarProducts : [],
  };

  // If shortDescription is missing but fullDescription exists, derive a short one
  if (!product.shortDescription && product.fullDescription) {
    // try to extract the first <p>...</p> block if HTML
    const m = product.fullDescription.match(/<p[^>]*>.*?<\/p>/i);
    if (m) {
      product.shortDescription = m[0];
    } else {
      // fallback: first line / 200 chars
      const plain = String(product.fullDescription).split(/\n\n|\r\n\r\n|\n/)[0] || "";
      product.shortDescription = plain.length > 200 ? plain.slice(0, 197) + '...' : plain;
    }
  }

  // Defensive defaults in case some fields are still missing
  product.images = Array.isArray(product.images) && product.images.length
    ? product.images
    : ["https://via.placeholder.com/300x300?text=Produit"];
  // If similarProducts not provided, compute from allProducts using tags
  if ((!product.similarProducts || !product.similarProducts.length) && Array.isArray(allProducts) && allProducts.length) {
    // normalize tags helper
    const normalizeTags = (t) => (Array.isArray(t) ? t.map(x => String(x).toLowerCase().trim()) : []);
    const prodTags = normalizeTags(raw.tags);
    const prodTagSet = new Set(prodTags);

    // build candidates excluding the current product (try to match by id_product or nom)
    const candidates = allProducts.filter(c => {
      if (!c) return false;
      if (raw.id_product && c.id_product && c.id_product === raw.id_product) return false;
      if (raw.ean && c.ean && c.ean === raw.ean) return false;
      if (raw.nom && c.nom && c.nom === raw.nom) return false;
      return true;
    });

    // map candidates by exact tag-array match and by intersection size
    const exactMatches = [];
    const byIntersection = {}; // key = intersection size -> array

    const tagsKey = (arr) => (Array.isArray(arr) ? arr.map(x => String(x).toLowerCase().trim()).sort().join("||") : "");
    const targetKey = tagsKey(raw.tags);

    candidates.forEach(c => {
      const ctags = normalizeTags(c.tags);
      const cKey = tagsKey(ctags);
      // exact array match (same tags set and length)
      if (cKey && targetKey && cKey === targetKey) {
        exactMatches.push(c);
        return;
      }
      // compute intersection size
      const cSet = new Set(ctags);
      let inter = 0;
      for (const t of prodTagSet) if (cSet.has(t)) inter++;
      if (inter > 0) {
        if (!byIntersection[inter]) byIntersection[inter] = [];
        byIntersection[inter].push(c);
      }
    });

    const pickRandom = (arr, n) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, n);
    };

    const result = [];
    const needed = 3;
    if (exactMatches.length) {
      result.push(...pickRandom(exactMatches, needed));
    }
    if (result.length < needed) {
      // take from highest intersection to lowest
      const intersections = Object.keys(byIntersection).map(Number).sort((a,b) => b-a);
      for (const k of intersections) {
        const remaining = needed - result.length;
        if (remaining <= 0) break;
        const pick = pickRandom(byIntersection[k], remaining);
        // avoid duplicates
        pick.forEach(pickItem => {
          if (!result.includes(pickItem)) result.push(pickItem);
        });
      }
    }
    // if still not enough, fill with random products (excluding duplicates)
    if (result.length < needed) {
      const remaining = candidates.filter(c => !result.includes(c));
      result.push(...pickRandom(remaining, needed - result.length));
    }

    // keep the full product objects for reliable opening when clicked
    product.similarProducts = result;
  }

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

  // === Bouton fermeture ===
  const closeBtn = Button({
    variant: 'danger',
    size: 'lg',
    children: 'X',
    className: 'absolute -right-[2vh] -top-[2vh] w-[4.5vh] h-[4.5vh] rounded-full p-0 z-[200]',
    onClick: closeModal
  });

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
      w-[10vh] h-[10vh] rounded-md
      border-2 ${i === 0 ? "border-primary" : "border-gray-400"}
      bg-gray-200 flex items-center justify-center
      active:scale-95 transition
    `;
    // create an actual img for the thumbnail
    const thumbImg = document.createElement("img");
    thumbImg.src = src;
    thumbImg.alt = `${product.name} - ${i + 1}`;
    thumbImg.loading = "lazy";
    thumbImg.className = "w-full h-full object-contain rounded-[0.6vh]";
    // if thumbnail fails to load, hide it (mainImage has its own fallback)
    thumbImg.onerror = () => {
      thumbImg.style.display = "none";
    };

    thumb.append(thumbImg);
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
  // tightened vertical spacing to reduce header footprint
  infoRow.className = "flex justify-between items-center mb-[1vh] mt-[0.6vh]";

  const infoLeft = document.createElement("div");
  const name = document.createElement("h2");
  // slightly smaller title to save vertical space
  name.className = "text-[2.4vh] font-extrabold uppercase text-black leading-tight";
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
  
  const descBtn = Button({
    variant: "ghost",
    size: "md",
    children: "DESCRIPTION",
    unstyled: true,
    className: 'min-w-[12vh] py-[1vh] px-[2vh] bg-gray-200 rounded-[2vh] text-[1.8vh] font-medium',
    onClick: () => {
      activeTab = "description";
      updateTabs();
    }
  });

  const detBtn = Button({
    variant: "ghost",
    size: "md",
    children: "DETAILS",
    unstyled: true,
    className: 'min-w-[12vh] py-[1vh] px-[2vh] bg-gray-200 rounded-[2vh] text-[1.8vh] font-medium',
    onClick: () => {
      activeTab = "details";
      updateTabs();
    }
  });

  const textContainer = document.createElement("p");

  const updateTabs = () => {
    // Reset both buttons to inactive state
    descBtn.className = 'min-w-[12vh] py-[1vh] px-[2vh] bg-gray-200 rounded-[2vh] text-[1.8vh] font-medium';
    detBtn.className = 'min-w-[12vh] py-[1vh] px-[2vh] bg-gray-200 rounded-[2vh] text-[1.8vh] font-medium';
    
    // Add active state to selected tab
    if (activeTab === "description") {
      descBtn.className = 'min-w-[12vh] py-[1vh] px-[2vh] bg-white border-2 border-primary rounded-[2vh] text-[1.8vh] font-medium';
      textContainer.innerHTML = product.shortDescription || "";
    } else {
      detBtn.className = 'min-w-[12vh] py-[1vh] px-[2vh] bg-white border-2 border-primary rounded-[2vh] text-[1.8vh] font-medium';
      textContainer.innerHTML = product.fullDescription || "";
    }

    // Handle details button state
    if (!product.fullDescription) {
      detBtn.disabled = true;
      detBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      detBtn.disabled = false;
      detBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
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
        flex-1 bg-white rounded-lg p-4 border-2 border-primary
        flex flex-col items-center justify-center active:scale-95 transition cursor-pointer
      `;
    const priceVal = Number(item.price ?? item.prix ?? 0);
    const imgSrc = item.image_url || item.image || "https://via.placeholder.com/150x150?text=Produit";
    card.innerHTML = `
      <img src="${imgSrc}" class="h-[9vh] object-contain mb-3" alt="${item.nom || ''}" />
      <span class="text-[2vh] font-bold text-primary">${priceVal.toFixed(2)} €</span>
    `;
    // try to find the full product object from allProducts so we can open its modal
    let sourceProduct = null;
    if (Array.isArray(allProducts) && allProducts.length) {
      sourceProduct = allProducts.find(c => {
        if (!c) return false;
        // prefer exact id or ean match when available
        if (item.id_product != null && c.id_product != null && Number(c.id_product) === Number(item.id_product)) return true;
        if (item.ean && c.ean && c.ean === item.ean) return true;
        // fallback to name/image/price heuristics
        if (item.nom && c.nom && c.nom === item.nom) return true;
        if (item.image_url && c.image_url && c.image_url === item.image_url) return true;
        if (item.prix != null && c.prix != null && Number(c.prix) === Number(item.prix)) return true;
        return false;
      });
    }

    card.setAttribute('data-id-product', item.id_product ?? '');
    card.setAttribute('data-nom', item.nom ?? '');
    card.onclick = () => {
      // Prefer using the `item` object directly when it looks like a full product (has id/images/description)
      let toOpen = null;
      const looksFull = item && (item.id_product != null || item.ean || item.image_url || item.description || item.prix != null);
      if (looksFull) {
        toOpen = item;
      } else if (sourceProduct) {
        toOpen = sourceProduct;
      } else {
        // fallback: try resolving from allProducts
        toOpen = sourceProduct || item;
      }

      console.log('[ProductModal] similar click -> open', { requested: item && item.nom, resolved: toOpen && toOpen.nom, id_requested: item && item.id_product, id_resolved: toOpen && toOpen.id_product });

      // Open the new modal first, then close the current one behind it so the new stays on top
      const newOverlay = ProductModal(toOpen, Array.isArray(allProducts) ? allProducts : []);
      document.body.appendChild(newOverlay);
      // small timeout to allow the new overlay to render before closing the current one
      setTimeout(() => closeModal(), 40);
    };

    similarGrid.append(card);
  });

  // === VALIDATE BUTTON (STICKY) ===
  const validateContainer = document.createElement("div");
  validateContainer.className = `
    sticky bottom-0 left-0 w-[calc(100%+6vh)] -ml-[3vh]
    bg-white pt-[1vh] pb-[1.5vh] px-[3vh] flex justify-center gap-[2vh] border-t border-gray-200
    opacity-100 z-[10]
    `;

  const validateBtn = Button({
    variant: "success",
    size: "lg",
    children: "VALIDER",
    fullWidth: true,
    onClick: () => {
      // add normalized product to the cart
      try {
        state.addToCart({
          id_product: raw.id_product ?? raw.id ?? raw.ean,
          name: product.name,
          price: product.price,
          image: product.images && product.images[0] ? product.images[0] : (raw.image_url || raw.image),
          quantity: qty,
        });
        console.log(`✅ Produit ajouté : ${product.name} x${qty}`);
      } catch (e) {
        console.error('Erreur ajout au panier', e);
      }
      closeModal();
    }
  });

  // === Retour button (left of VALIDER) which closes the modal
  const returnBtn = Button({
    variant: "primary",
    size: "lg",
    children: "FERMER",
    fullWidth: true,
    attributes: { 'aria-label': 'Fermer la fenêtre produit' },
    onClick: () => closeModal()
  });

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
