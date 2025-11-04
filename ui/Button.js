export function Button({
	variant = 'primary', // primary | success | danger | ghost
	size = 'md', // sm | md | lg
	fullWidth = false,
	icon = null, // svg string or Node
	onClick = () => {},
	children = '',
	className = '' // additional classes
}) {
	const btn = document.createElement('button');
	btn.type = 'button';

	// Base styles applied directly
	btn.style.display = 'inline-flex';
	btn.style.alignItems = 'center';
	btn.style.justifyContent = 'center';
	btn.style.gap = '1vh';
	btn.style.cursor = 'pointer';
	btn.style.border = 'none';
	btn.style.borderRadius = '1.2vh';
	btn.style.transition = 'transform .08s ease, box-shadow .12s ease';
	btn.style.fontWeight = '600';

	// Variant styles
	switch (variant) {
		case 'primary':
			btn.style.backgroundColor = 'rgb(126 34 206 / 0.7)';
			btn.style.color = '#ffffff';
			break;
		case 'success':
			btn.style.backgroundColor = '#7CE07A';
			btn.style.color = '#ffffff';
			break;
		case 'danger':
			btn.style.backgroundColor = 'rgb(220 38 38 / 0.9)';
			btn.style.color = '#ffffff';
			break;
		case 'ghost':
			btn.style.backgroundColor = 'transparent';
			btn.style.color = '#111827';
			btn.style.border = '1px solid #E5E7EB';
			break;
	}

	// Size styles
	switch (size) {
		case 'sm':
			btn.style.fontSize = '1.6vh';
			btn.style.padding = '0.6vh 1vh';
			break;
		case 'md':
			btn.style.fontSize = '2vh';
			btn.style.padding = '1.2vh 1.6vh';
			break;
		case 'lg':
			btn.style.fontSize = '2.4vh';
			btn.style.padding = '1.6vh 2vh';
			break;
	}

	if (fullWidth) {
		btn.style.width = '100%';
	}

	// Add any additional classes
	if (className) {
		btn.className = className;
	}

	// Active state
	btn.addEventListener('mousedown', () => {
		btn.style.transform = 'scale(.98)';
	});
	btn.addEventListener('mouseup', () => {
		btn.style.transform = 'scale(1)';
	});

	btn.onclick = (e) => { onClick(e); };

	if (icon) {
		const iconWrap = document.createElement('span');
		iconWrap.style.display = 'inline-flex';
		iconWrap.style.alignItems = 'center';
		iconWrap.style.justifyContent = 'center';
		if (typeof icon === 'string') iconWrap.innerHTML = icon; else iconWrap.appendChild(icon);
		btn.appendChild(iconWrap);
	}

	if (typeof children === 'string') btn.appendChild(document.createTextNode(children));
	else if (children instanceof Node) btn.appendChild(children);

	return btn;
}
