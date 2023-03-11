import React from 'react';
import Card from './Card';

export default function Grid({cards, onGridClick}) {
	const cols = cards.length / 3;

	let row1 = [];
	let row2 = [];
	let row3 = [];

	let i = 0;
	
	for (let c = 0; c < cols; c++, i++) {
		row1.push(<Card value={cards[i].value} visible={cards[i].visible} key={i} onCardClick={onGridClick(i)} />);
	}
	row1 = <div className='row'><div className='col'>{ row1 }</div></div>;

	for (let c = 0; c < cols; c++, i++) {
		row2.push(<Card value={cards[i].value} visible={cards[i].visible} key={i} onCardClick={onGridClick(i)} />);
	}
	row2 = <div className='row'><div className='col'>{ row2 }</div></div>;

	for (let c = 0; c < cols; c++, i++) {
		row3.push(<Card value={cards[i].value} visible={cards[i].visible} key={i} onCardClick={onGridClick(i)} />);
	}
	row3 = <div className='row'><div className='col'>{ row3 }</div></div>;

	return (
		<div className="container-fluid">
			{row1}
			{row2}
			{row3}
		</div>
	);
}
