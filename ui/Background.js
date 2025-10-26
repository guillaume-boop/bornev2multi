export function Background() {
  const container = document.createElement("div");
  container.className = `
    fixed inset-0 -z-10 bg-white overflow-hidden
    flex items-center justify-center
  `;

  const grid = document.createElement("div");
  grid.className = `
    absolute inset-0
    grid place-items-center
    grid-cols-[repeat(auto-fill,minmax(30%,1fr))]  /* 3 colonnes max */
    grid-rows-[repeat(auto-fill,minmax(15%,1fr))]  /* remplit bien le vertical */
    gap-[8vh]
    opacity-[0.07]
    select-none
  `;

  const logos = Array.from({ length: 60 }).map(() => {
    const img = document.createElement("img");
    img.src = "./assets/logo.png";
    img.alt = "Logo TicketEasy";
    img.className = "w-[100%] object-contain"; // logos bien visibles
    return img;
  });

  logos.forEach((logo) => grid.appendChild(logo));

  const overlay = document.createElement("div");
  overlay.className = `
    absolute inset-0 bg-black/20 z-[1]
  `;

  container.appendChild(grid);
  container.appendChild(overlay);
  return container;
}
