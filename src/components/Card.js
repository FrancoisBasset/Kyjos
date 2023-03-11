import React from 'react';

const style = {
	margin: '4px'
};

export default function Card({value, visible, onCardClick}) {
	let path;

	if (visible) {
		path = `/card${value}.png`;
	} else {
		path = '/back.png';
	}
	
	return <img src={path} width="65" style={style} onClick={() => onCardClick()} />;
}
