import React from 'react';

export default function Card({value, visible, onCardClick, selected}) {
	const path = visible ? `./card${value}.png` : './back.png';

	let style;
	if (selected) {
		style = {
			border: '5px solid orange'
		};
	}
	
	return <img src={path} width="70" className='card' style={style} onClick={() => onCardClick()} />;
}
