import { Button } from './Button.js';

export function FooterActions({
  onCancel = () => (window.location.hash = "home"),
  onConfirm = () => (window.location.hash = "recap"),
} = {}) {
  const footer = document.createElement("div");
  footer.className = `
    fixed bottom-0 left-1/2 -translate-x-1/2
    w-[min(100vw,56.25vh)]
    h-[8.5vh]
    bg-white
    border-t-2 border-purple-600
    flex items-center justify-between
    px-[2vh]
    z-50
    shadow-[0_-2px_4px_rgba(0,0,0,0.1)]
  `;

  // === Bouton "Abandonner la commande" ===
  const cancelBtn = Button({
    children: "ABANDONNER",
    variant: "danger",
    className: "w-[42%] h-[5.8vh]",
    icon: `<svg xmlns="http://www.w3.org/2000/svg"
           class="w-[1.8vh] h-[1.8vh]"
           fill="none" viewBox="0 0 24 24"
           stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12" />
      </svg>`,
    onClick: onCancel
  });

  // === Bouton "Confirmer la commande" ===
  const confirmBtn = Button({
    children: "VALIDER",
    variant: "success",
    className: "w-[42%] h-[5.8vh] shadow-md",
    icon: `<svg xmlns="http://www.w3.org/2000/svg"
         class="w-[1.8vh] h-[1.8vh]"
         fill="none" viewBox="0 0 24 24"
         stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M5 13l4 4L19 7" />
    </svg>`,
    onClick: onConfirm
  });

  footer.append(cancelBtn, confirmBtn);
  return footer;
}
