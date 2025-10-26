import products from "../products.json" assert { type: "json" };
// tu pourras adapter le chemin selon ton arborescence

export function ProductList({ category = null, onSelectProduct = () => {} } = {}) {
  const container = document.createElement("div");
  container.className = `
    grid grid-cols-2 gap-[3vh] p-[3vh] overflow-y-auto
  `;

  // Filtrer les produits selon la catégorie
  const filtered = category
    ? products.filter((p) =>
        (p.tags || []).some((tag) => tag.toLowerCase().includes(category.toLowerCase()))
      )
    : [];

  if (filtered.length === 0) {
    container.innerHTML = `
      <p class="text-center text-gray-500 text-[2vh] col-span-2">
        Aucun produit trouvé pour cette catégorie 😔
      </p>
    `;
    return container;
  }

  filtered.forEach((prod) => {
    const card = document.createElement("button");
    card.className = `
      bg-white rounded-[1.5vh] shadow-md overflow-hidden
      flex flex-col items-center justify-between
      active:scale-95 transition h-[32vh]
    `;

    const img = document.createElement("img");
    img.src = prod.image_url || "https://via.placeholder.com/200x200?text=Produit";
    img.alt = prod.nom;
    img.className = "w-full h-[20vh] object-contain bg-[#F3F3F3]";

    const name = document.createElement("p");
    name.textContent = prod.nom;
    name.className =
      "text-[1.7vh] font-semibold text-center px-[1vh] leading-tight mt-[1vh] line-clamp-2";

    const price = document.createElement("p");
    price.textContent = `${prod.prix.toFixed(2)} €`;
    price.className = "text-[2vh] font-bold text-[#A855F7]";

    card.append(img, name, price);

    card.onclick = () => {
      onSelectProduct(prod);
    };

    container.appendChild(card);
  });

  return container;
}
