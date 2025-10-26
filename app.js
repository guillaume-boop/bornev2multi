import { Navbar } from "./ui/Navbar.js";
import { Background } from "./ui/Background.js";
import { FooterActions } from "./ui/FooterActions.js";
import { CategorySidebar } from "./ui/CategorySidebar.js";
// import { ProductModal } from "./components/Modals/ProductModal.js";

console.log("charge", CategorySidebar);

const $app = document.getElementById("app");
const $header = document.getElementById("header");
const $footer = document.getElementById("footer");

// Map entre IDs de la sidebar et tags du JSON
const CATEGORY_TAG_MAP = {
  cat1: "cat1", // accessoires informatique
  cat2: "cat2", // accessoires smartphone
  cat3: "cat3", // chargeurs
  cat4: "cat4", // audio
  cat5: "cat5", // stockage
};

let _productsCache = null;

// === CHARGEMENT DU JSON PRODUITS ===
async function loadProductsJson() {
  if (_productsCache) return _productsCache;
  const res = await fetch("./products.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger products.json");
  _productsCache = await res.json();
  return _productsCache;
}

// === AFFICHAGE DES PRODUITS ===
function renderProductGrid(list = []) {
  $app.innerHTML = ""; // reset

  const wrapper = document.createElement("section");
  wrapper.className = "p-[3vh] opacity-0 transition-opacity duration-500";

  if (!list.length) {
    wrapper.innerHTML = `
      <p class="text-center text-gray-500 text-[2vh]">
        Aucun produit trouvé pour cette catégorie.
      </p>
    `;
    $app.appendChild(wrapper);
    requestAnimationFrame(() => (wrapper.style.opacity = 1));
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-2 gap-[3vh]";

  list.forEach((p) => {
    const card = document.createElement("button");
    card.className = `
      bg-white rounded-[1.5vh] shadow-md overflow-hidden
      flex flex-col items-center justify-between
      active:scale-95 transition h-[32vh]
    `;

    const img = document.createElement("img");
    img.src = p.image_url || "https://via.placeholder.com/200x200?text=Produit";
    img.alt = p.nom;
    img.className = "w-full h-[20vh] object-contain bg-[#F3F3F3]";

    const name = document.createElement("p");
    name.textContent = p.nom;
    name.className =
      "text-[1.7vh] font-semibold text-center px-[1vh] leading-tight mt-[1vh] line-clamp-2";

    const price = document.createElement("p");
    const prix = Number(p.prix || 0);
    price.textContent = isNaN(prix) ? "" : `${prix.toFixed(2)} €`;
    price.className = "text-[2vh] font-bold text-[#A855F7] mb-[1vh]";

    card.append(img, name, price);

    // futur : ouverture du ProductModal
    // card.onclick = () => document.body.appendChild(ProductModal(p));

    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
  $app.appendChild(wrapper);
  requestAnimationFrame(() => (wrapper.style.opacity = 1));
}

// === CHARGEMENT + FILTRAGE DES CATÉGORIES ===
async function loadAndRenderCategory(catId) {
  try {
    const tag = CATEGORY_TAG_MAP[catId] || catId;
    const raw = await loadProductsJson();

    // The products are stored under the 'produits' key in our JSON
    const all = raw && raw.produits ? raw.produits : [];

    if (!Array.isArray(all)) {
      console.error("Format inattendu de products.json", raw);
      return;
    }

    // Filtrage robuste et insensible à la casse
    // Debug logs
    console.log('Données brutes:', all);
    console.log('Tag recherché:', tag);

    const filtered = all.filter((p) => {
      // Log pour chaque produit
      console.log('Produit en cours:', p);
      
      // Si pas de tags, on ne peut pas filtrer
      if (!p.tags) {
        console.log('Produit sans tags:', p);
        return false;
      }

      // Normaliser tous les tags en minuscules
      const productTags = Array.isArray(p.tags)
        ? p.tags.map(t => t.toLowerCase().trim())
        : String(p.tags).split(",").map(t => t.toLowerCase().trim());

      // Vérifier si le produit a le tag de catégorie
      const hasTag = productTags.includes(tag.toLowerCase());
      console.log('Tags du produit:', productTags, 'Tag recherché:', tag.toLowerCase(), 'Match?', hasTag);
      
      return hasTag;
    });


    console.log("Catégorie sélectionnée :", catId, "→ tag:", tag);
    console.log("Produits trouvés :", filtered.length);

    renderProductGrid(filtered);
  } catch (e) {
    console.error(e);
    $app.innerHTML = `
      <section class="p-[3vh] text-center text-red-600">
        <p class="text-[2vh]">Erreur lors du chargement des produits.</p>
      </section>
    `;
  }
}

// === INITIALISATION ===
function boot() {
  if (!document.getElementById("background")) {
    document.body.prepend(Background());
  }

  $header.innerHTML = "";
  $header.appendChild(
    Navbar({
      title: "MONOPRIX VINCI",
      showCart: true,
    })
  );

  const categories = [
    { id: "cat1", label: "ACCESSOIRES INFORMATIQUE", image: "https://monopsolut6.fr/vignettes/accueil/cat2.png" },
    { id: "cat2", label: "ACCESSOIRES SMARTPHONE", image: "https://monopsolut6.fr/vignettes/accueil/cat3.png" },
    { id: "cat3", label: "CHARGEURS", image: "https://monopsolut6.fr/vignettes/accueil/cat1.png" },
    { id: "cat4", label: "AUDIO", image: "https://monopsolut6.fr/vignettes/accueil/cat4.png" },
    { id: "cat5", label: "STOCKAGE", image: "https://monopsolut6.fr/vignettes/accueil/cat5.png" },
  ];

  document.getElementById("app-frame").appendChild(
    CategorySidebar({
      categories,
      active: "cat3", // on démarre sur chargeurs
      onSelect: (id) => {
        console.log("Catégorie sélectionnée :", id);
        loadAndRenderCategory(id);
      },
    })
  );

  // chargement initial
  loadAndRenderCategory("cat3");

  // Footer
  $footer.innerHTML = "";
  $footer.appendChild(
    FooterActions({
      onCancel: () => {
        console.log("Commande annulée");
        window.location.hash = "home";
      },
      onConfirm: () => {
        console.log("Commande confirmée");
        window.location.hash = "recap";
      },
    })
  );
}

boot();
