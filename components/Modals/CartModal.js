import { state } from '../../state.js';
import { QuantitySelector } from '../../ui/QuantitySelector.js';
import { Button } from '../../ui/Button.js';

export function CartModal() {
	const overlay = document.createElement('div');
	overlay.setAttribute('data-app-overlay','cart');
	overlay.className = `fixed inset-0 bg-black/30 z-[160] flex items-center justify-center`;
	overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

	const modal = document.createElement('div');
	// add extra bottom padding so the sticky footer doesn't cover content when scrolling
	modal.className = `relative bg-white rounded-xl w-[95%] max-w-[95vw] h-[95vh] max-h-[100vh] shadow-xl`;

	// Header
	const header = document.createElement('div');
	header.className = 'absolute top-0 left-0 right-0 flex items-center justify-center h-[9vh] bg-white border-b border-gray-100 z-20 rounded-t-xl';
	const title = document.createElement('h2');
	title.className = 'text-[3vh] font-extrabold';
	title.textContent = 'PANIER';
	header.appendChild(title);

	// Items list - avec scroll
	const list = document.createElement('div');
	list.className = 'flex flex-col gap-[1.6vh] overflow-auto absolute top-[9vh] bottom-[15vh] left-0 right-0 px-[2vh] pt-[2vh]';

	// Total label
	const totalLabel = document.createElement('div');
	totalLabel.className = 'text-[3vh] font-extrabold text-center my-[2vh]';

	// Footer: fixed at the bottom of the modal (absolute) with white background
	const footer = document.createElement('div');
	// use absolute positioning so footer stays at bottom of modal regardless of content height
	footer.className = 'absolute bottom-0 left-0 right-0 bg-white pt-[1.6vh] pb-[1.6vh] px-[2vh] flex flex-col gap-[1vh] border-t border-gray-200 z-20 rounded-b-xl';

	// Centered total above the buttons
	const totalCenter = document.createElement('div');
	totalCenter.className = 'w-full text-center';
	// reuse totalLabel element for value
	totalLabel.className = 'text-[2.6vh] font-extrabold';
	totalCenter.appendChild(totalLabel);

	// Buttons row
	const btnRow = document.createElement('div');
	btnRow.className = 'w-full flex items-center justify-center gap-[1.6vh]';

	const closeBtn = Button({
		variant: 'danger',
		size: 'md',
		children: 'FERMER',
		className: 'w-[42%] h-[5.8vh]',
		onClick: () => overlay.remove()
	});

	const validateBtn = Button({
		variant: 'success',
		size: 'md',
		children: 'VALIDER',
		className: 'w-[42%] h-[5.8vh] shadow-md',
		onClick: () => { window.location.hash = 'recap'; overlay.remove(); }
	});

	btnRow.append(closeBtn, validateBtn);

	footer.append(totalCenter, btnRow);

	// Abandon floating bar
	const abandonBar = document.createElement('div');
	abandonBar.className = 'absolute left-4 -bottom-[3.6vh]';
	const abandonBtn = Button({
		variant: 'danger',
		size: 'sm',
		children: 'FERMER',
		className: 'px-[2vh] py-[0.8vh] text-[1.4vh]',
		onClick: () => { state.clearCart?.(); window.location.hash = 'home'; overlay.remove(); }
	});
	abandonBar.appendChild(abandonBtn);

	// render function
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
				// item card
				const card = document.createElement('div');
				card.className = 'flex items-center justify-between bg-gray-100 rounded-lg p-4 gap-3 relative';

				// left: image
				const left = document.createElement('div');
				left.className = 'flex items-center gap-[1vh] flex-1';
				const thumbWrap = document.createElement('div');
				thumbWrap.className = 'w-[7vh] h-[7vh] rounded-[1.2vh] bg-white flex items-center justify-center p-[0.6vh]';
				const img = document.createElement('img');
				img.src = item.image || 'https://via.placeholder.com/80x80?text=Img';
				img.alt = item.name || '';
				img.className = 'max-w-full max-h-full object-contain';
				thumbWrap.appendChild(img);
				left.append(thumbWrap);

				// center: title + qty controls
				const center = document.createElement('div');
				center.className = 'flex-1 ml-[1vh]';
				const name = document.createElement('div');
				name.className = 'font-extrabold text-[2vh] leading-tight';
				name.textContent = item.name || 'NOM DU PRODUIT';

				const qtySelector = QuantitySelector({
					value: item.quantity || 1,
					onChange: (newQ) => state.setQuantity(item.id, newQ),
					smallSize: true,
					style: {
						numberWidth: '4vh',
						numberSize: '1.6vh'
					}
				});
				qtySelector.className += ' mt-[0.6vh] w-fit';

				center.append(name, qtySelector);
				left.append(center);

				// right: price + delete
				const right = document.createElement('div');
				right.className = 'flex flex-col items-end';
				const price = document.createElement('div');
				price.className = 'text-[2.2vh] font-bold text-primary';
				price.textContent = ((Number(item.price)||0) * (Number(item.quantity)||1)).toFixed(2) + ' €';
				right.append(price);

				// Bouton X pour supprimer
				const removeBtn = Button({
					variant: 'danger',
					size: 'sm',
					children: 'X',
					className: 'absolute -right-[1vh] -top-[1vh] w-[3vh] h-[3vh] rounded-full p-0',
					onClick: () => { state.removeFromCart(item.id); }
				});

				card.append(left, right, removeBtn);
				list.appendChild(card);
			});
		}

		const total = cart.reduce((s,i)=> s + (Number(i.price)||0) * (Number(i.quantity)||1), 0);
		totalLabel.textContent = 'TOTAL: ' + total.toFixed(2) + '€';
	}

	const onUpdate = () => renderItems();
	window.addEventListener('cart:updated', onUpdate);
	renderItems();

	modal.append(header, list, footer);
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
