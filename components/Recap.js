import { state } from '../state.js';
import { Button } from '../ui/Button.js';

export function Recap() {
  const overlay = document.createElement('div');
  overlay.setAttribute('data-app-overlay','recap');
  overlay.className = `fixed inset-0 bg-black/30 z-[150]`;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  // Variable pour contrôler les modes de paiement disponibles
  const paymentOptions = {
    card: true, // Paiement par carte disponible
    cash: true  // Paiement en caisse disponible
  };

  const modal = document.createElement('div');
  modal.className = `absolute top-10 bottom-10 left-[50%] -translate-x-[50%] w-[90vw] bg-white rounded-xl flex flex-col`;
  
  const content = document.createElement('div');
  content.className = 'flex-1 overflow-auto px-[3vh] pt-[8vh] pb-[15vh]';

  const headerContainer = document.createElement('div');
  headerContainer.className = 'px-[3vh] py-[3vh] relative border-b border-gray-100';
  
  const header = document.createElement('h2');
  header.className = 'text-[2.6vh] font-extrabold text-center';
  header.textContent = 'RECAPITULATIF DE LA COMMANDE';
  
  // Bouton close
  const closeBtn = Button({
    variant: 'danger',
    size: 'lg',
    children: 'X',
    className: 'absolute -right-[1.5vh] -top-[1.5vh] w-[5vh] h-[5vh] rounded-full p-0',
    onClick: () => overlay.remove()
  });
  
  headerContainer.append(header, closeBtn);

  const list = document.createElement('div');
  list.className = 'flex flex-col gap-[1.6vh] mb-[2vh]';

  const totalRow = document.createElement('div');
  totalRow.className = 'text-center my-[2vh]';
  const totalLabel = document.createElement('div');
  totalLabel.className = 'text-[3vh] font-extrabold';

  const footer = document.createElement('div');
  footer.className = 'absolute bottom-0 left-0 right-0 bg-white pt-[2vh] pb-[3vh] px-[3vh] border-t border-gray-100 flex flex-col items-center gap-[2vh]';
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'flex gap-[1.6vh] w-full';
  
  if (paymentOptions.card) {
    const cardBtn = Button({
      variant: 'primary',
      size: 'md',
      children: 'Payer par carte',
      fullWidth: !paymentOptions.cash,
      className: paymentOptions.cash ? 'flex-1' : '',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-[2.4vh] h-[2.4vh]">
        <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
        <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clip-rule="evenodd" />
      </svg>`,
      onClick: () => {
        state.clearCart?.();
        overlay.remove();
      }
    });
    buttonsContainer.appendChild(cardBtn);
  }

  if (paymentOptions.cash) {
    const cashBtn = Button({
      variant: 'primary',
      size: 'md',
      children: 'Payer en caisse',
      fullWidth: !paymentOptions.card,
      className: paymentOptions.card ? 'flex-1' : '',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-[2.4vh] h-[2.4vh]">
        <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
        <path fill-rule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clip-rule="evenodd" />
      </svg>`,
      onClick: () => {
        state.clearCart?.();
        overlay.remove();
      }
    });
    buttonsContainer.appendChild(cashBtn);
  }

  const abandonBar = document.createElement('div');
  abandonBar.className = `absolute left-4 bottom-[-3.6vh]`;
  const abandonBtn = Button({
    variant: 'danger',
    size: 'sm',
    children: 'ABANDONNER LA COMMANDE',
    className: 'px-[2vh] py-[0.8vh] text-[1.4vh]',
    onClick: () => {
      state.clearCart?.();
      window.location.hash = 'home';
      overlay.remove();
    }
  });
  abandonBar.appendChild(abandonBtn);

  // helper to render items
  function renderItems() {
    list.innerHTML = '';
    const cart = Array.isArray(state.cart) ? state.cart : [];
    if (!cart.length) {
      const empty = document.createElement('p');
      empty.className = 'text-center text-gray-500 text-[1.9vh]';
      empty.textContent = 'Votre panier est vide.';
      list.appendChild(empty);
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'flex items-center bg-gray-100 rounded-lg p-4 gap-4';
        
        // Image container
        const imgContainer = document.createElement('div');
        imgContainer.className = 'w-[8vh] h-[8vh] bg-white rounded-[1.2vh] flex items-center justify-center p-[1vh]';
        const img = document.createElement('img');
        img.src = item.image || 'https://via.placeholder.com/80x80?text=Img';
        img.alt = item.name || '';
        img.className = 'w-full h-full object-contain';
        imgContainer.appendChild(img);

        // Product info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex-1';
        
        const title = document.createElement('div');
        title.className = 'font-extrabold text-[1.6vh] mb-[0.5vh]';
        title.textContent = item.name || 'NOM DU PRODUIT';
        
        const qtyLabel = document.createElement('div');
        qtyLabel.className = 'text-[1.8vh] text-gray-600';
        qtyLabel.textContent = `Quantité: ${item.quantity || 1}`;
        
        infoContainer.append(title, qtyLabel);

        // Price container
        const priceContainer = document.createElement('div');
        priceContainer.className = 'flex items-end';
        
        const price = document.createElement('div');
        price.className = 'text-[2.4vh] font-bold text-primary/70';
        price.textContent = ((Number(item.price)||0) * (Number(item.quantity)||1)).toFixed(2) + ' €';
        
        priceContainer.appendChild(price);
        row.append(imgContainer, infoContainer, priceContainer);
        list.appendChild(row);
      });
    }

    // total
    const total = cart.reduce((s,i)=> s + (Number(i.price)||0) * (Number(i.quantity)||1), 0);
    totalLabel.textContent = 'TOTAL: ' + total.toFixed(2) + '€';
  }

  // listen for cart updates to refresh UI
  const onUpdate = () => renderItems();
  window.addEventListener('cart:updated', onUpdate);

  // initial render
  renderItems();

  content.append(list);
  footer.appendChild(totalLabel);
  footer.appendChild(buttonsContainer);
  modal.append(headerContainer, content, footer);
  overlay.append(modal, abandonBar);

  // cleanup when removed
  const observer = new MutationObserver(() => {
    if (!document.body.contains(overlay)) {
      window.removeEventListener('cart:updated', onUpdate);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return overlay;
}
