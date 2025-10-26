export function QuantitySelector({ value = 1, min = 1, max = 99, onChange }) {
  // Création du wrapper principal
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-stretch h-[8vh] bg-white rounded-[1vh] overflow-hidden border border-gray-300";

  // Affichage de la quantité (à gauche)
  const display = document.createElement("div");
  display.className = "w-[6vh] flex items-center justify-center text-[2vh] font-semibold text-gray-700 border-r border-gray-300";
  display.textContent = value;

  // Conteneur des boutons (à droite, empilés)
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "flex flex-col";

  // Fonction pour créer les boutons + et -
  const createButton = (text, onClick) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `
      bg-[#4B5563] text-white w-[4vh] h-[4vh]
      text-[1.8vh] font-bold flex items-center justify-center
      transition-colors hover:bg-[#374151]
      disabled:opacity-50 disabled:cursor-not-allowed
      ${text === "+" ? "border-b" : ""} border-gray-600
    `;
    btn.onclick = onClick;
    return btn;
  };

  // Bouton moins
  const minusBtn = createButton("−", () => {
    const newValue = Math.max(min, value - 1);
    if (newValue !== value) {
      value = newValue;
      display.textContent = value;
      onChange?.(value);
      updateButtonsState();
    }
  });

  // Bouton plus
  const plusBtn = createButton("+", () => {
    const newValue = Math.min(max, value + 1);
    if (newValue !== value) {
      value = newValue;
      display.textContent = value;
      onChange?.(value);
      updateButtonsState();
    }
  });

  // Mise à jour de l'état des boutons
  const updateButtonsState = () => {
    minusBtn.disabled = value <= min;
    plusBtn.disabled = value >= max;
  };

  // État initial des boutons
  updateButtonsState();

  buttonsContainer.append(plusBtn, minusBtn);
  wrapper.append(display, buttonsContainer);
  return wrapper;
}
