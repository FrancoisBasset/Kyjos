import React  from 'react';
import Board from '../components/Board';

export default function GameView() {
	return (
		<div className="container-fluid text-center">
			<div className="row" style={{backgroundColor: 'gray'}}>
				<div className="col">
					<Board />
				</div>
			</div>
		</div>
	);
}
