export function CategorySidebar({
  categories = [],
  active = null,
  onSelect = () => {},
} = {}) {
  const sidebar = document.createElement("div");
  sidebar.className = `
    absolute top-0 left-0
    pt-[10vh] pb-[10vh]
    w-[12vh] h-full
    flex flex-col items-center
    gap-[2vh]
    overflow-y-auto
    bg-[#D9D9D9]
    z-[10]
    rounded-tr-[1vh]
  `;

  // Masque la scrollbar mais garde le scroll
  sidebar.style.scrollbarWidth = "none"; // Firefox
  sidebar.style.msOverflowStyle = "none"; // IE/Edge

  const style = document.createElement("style");
  style.textContent = `
    .sidebar-no-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
  sidebar.classList.add("sidebar-no-scrollbar");

  // === création dynamique des boutons ===
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `
      relative
      w-[15vh]
      flex-shrink-0
      rounded-[1.2vh]
      overflow-hidden
      transition-all duration-200 active:scale-95
    `;

    btn.innerHTML = `
      <img
        src="${cat.image}"
        alt="${cat.label}"
        class="w-full h-auto object-contain transition-opacity duration-200
               ${cat.id === active ? "opacity-100" : "opacity-50"}"
      />
    `;

    // gestion du clic
    btn.onclick = () => {
      // supprime l’état actif précédent
      sidebar.querySelectorAll("img").forEach((img) => {
        img.classList.add("opacity-50");
        img.classList.remove("opacity-100");
      });

      // active le bouton cliqué
      const img = btn.querySelector("img");
      if (img) {
        img.classList.remove("opacity-50");
        img.classList.add("opacity-100");
      }

      onSelect(cat.id);
    };

    sidebar.appendChild(btn);
  });

  return sidebar;
}
