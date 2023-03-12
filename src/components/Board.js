import React  from 'react';
import Card from './Card';
import Grid from './Grid';
import { getNewCardsPack } from '../utils/board';

export default class Board extends React.Component {
	constructor() {
		super();

		const cards = getNewCardsPack();

		const playerCards = [];
		const botCards = [];
		for (let i = 0; i < 12; i++) {
			playerCards.push(cards.pop());
			botCards.push(cards.pop());
		}

		const face = cards.pop();
		face.visible = true;

		const back = cards.pop();

		this.state = {
			cards: cards,
			playerCards: playerCards,
			botCards: botCards,
			face: face,
			back: back,
			step: 'begin',
			turn: 'bot',
			cardsVisible: 0,
			choice: null,
			botCardsVisible: 0,
			playerScore: 0,
			botScore: 0
		};
	}

	componentDidMount() {
		const index1 = Math.floor(Math.random() * 12);
		let index2 = index1;
		while (index1 == index2) {
			index2 = Math.floor(Math.random() * 12);
		}

		const cards = this.state.botCards;
		cards[index1].visible = true;
		cards[index2].visible = true;
		this.setState({botCardsVisible: 2, turn: 'player'});
	}

	componentDidUpdate() {
		this.checkColumns('player', this.state.playerCards);
		this.checkColumns('bot', this.state.botCards);

		if (this.state.step == 'game' && this.state.turn == 'bot') {
			this.botPlays();
		}
	}

	clickDeck() {
		if (this.state.step == 'begin' || this.state.turn == 'bot') {
			return;
		}
		
		const back = this.state.back;
		back.visible = true;
		this.setState({back: back, choice: 'back'});
	}

	clickDiscard() {
		if (this.state.step == 'begin' || this.state.turn == 'bot') {
			return;
		}

		if (this.state.choice == 'back') {
			this.setState({
				face: this.state.back,
				back: this.state.cards.pop(),
				turn: 'bot',
				choice: null
			});
		} else {
			this.setState({choice: 'face'});
		}
	}

	playerPlays(i) {
		if (this.state.turn == 'bot') {
			return;
		}

		if (this.state.step == 'game' && this.state.choice == null) {
			return;
		}

		const cards = this.state.playerCards;

		if (this.state.step == 'begin') {
			if (cards[i].visible) {
				return;
			}

			const cardsVisible = this.state.cardsVisible + 1;
			this.setState({cardsVisible: cardsVisible});

			cards[i].visible = true;
			this.setState({playerCards: cards});
			
			if (cardsVisible == 2) {
				this.setState({step: 'game'});
				this.decideWhoBegin();
			}
		} else {
			if (this.state.choice == 'face') {
				const face = cards[i];
				face.visible = true;

				cards[i] = this.state.face;
				cards[i].visible = true;

				this.setState({
					face: face,
					playerCards: cards,
					choice: null
				});
			} else if (this.state.choice == 'back') {
				const face = cards[i];
				face.visible = true;

				cards[i] = this.state.back;
				cards[i].visible = true;

				this.setState({
					face: face,
					back: this.state.cards.pop(),
					playerCards: cards,
					choice: null
				});
			}

			this.setState({turn: 'bot'});
			this.checkFinished();
		}
	}

	decideWhoBegin() {
		const playerScore = this.getScore(this.state.playerCards);
		const botScore = this.getScore(this.state.botCards);

		if (playerScore > botScore) {
			this.setState({turn: 'player'});
		} else {
			this.setState({turn: 'bot'});
		}
	}

	getScore(cards) {
		return cards.reduce((sum, card) => {
			if (card.visible || this.state.step == 'game') {
				sum += card.value;
			}
			return sum;
		}, 0);
	}

	checkColumns(who, cards) {
		const cols = cards.length / 3;

		for (let c = 0; c < cols; c++) {
			if (cards[c].visible && cards[c + cols].visible && cards[c + cols + cols].visible) {
				if (cards[c].value == cards[c + cols].value && cards[c + cols].value == cards[c + cols + cols].value) {
					const face = cards[c];

					cards.splice(c, 1);
					cards.splice(c + cols - 1, 1);
					cards.splice(c + cols + cols - 2, 1);

					if (who == 'player') {
						this.setState({
							face: face,
							playerCards: cards
						});
					} else if (who == 'bot') {
						this.setState({
							face: face,
							botCards: cards
						});
					}

					break;
				}
			}
		}
	}

	checkFinished() {
		const playerLast = this.state.playerCards.filter(c => !c.visible).length;
		const botLast = this.state.botCards.filter(c => !c.visible).length;

		if (playerLast == 0 || botLast == 0) {
			this.updateScore();

			const playerCards = this.state.playerCards;
			playerCards.map(c => c.visible = true);

			const botCards = this.state.botCards;
			botCards.map(c => c.visible = true);
			
			this.setState({
				step: 'end',
				playerCards: playerCards,
				botCards: botCards
			});
		}
	}

	updateScore() {
		const playerScore = this.state.playerScore + this.getScore(this.state.playerCards);
		const botScore = this.state.botScore + this.getScore(this.state.botCards);

		this.setState({playerScore: playerScore, botScore: botScore});
	}

	botPlays() {
		const allHidden = this.state.botCards.filter(c => !c.visible);

		if (allHidden.length == 0) {
			return;
		}

		let botCards = this.state.botCards;

		let face = this.state.face;
		let indexToModify = -1;

		if (this.state.face.value >= 1) {
			indexToModify = this.checkGoColumns(botCards, 'face');
		} else if (this.state.face.value <= 0) {
			for (let i = 0; i < botCards.length; i++) {
				if (botCards[i].value > 2) {
					indexToModify = i;
					break;
				}
			}
		} else {
			const back = this.state.back;
			back.visible = true;

			indexToModify = this.checkGoColumns(botCards, 'back');
		}
		
		if (indexToModify == -1) {
			indexToModify = Math.floor(Math.random() * allHidden.length);
			indexToModify = this.state.botCards.indexOf(allHidden[indexToModify]);

			botCards[indexToModify].visible = true;
		} else {
			face = botCards[indexToModify];
			face.visible = true;
			botCards[indexToModify] = this.state.face;
			botCards[indexToModify].visible = true;
		}

		this.setState({
			face: face,
			botCards: botCards,
			turn: 'player'
		});
		this.checkFinished();
	}

	checkGoColumns(botCards, bloc) {
		const cols = botCards.length / 3;

		for (let c = 0; c < cols; c++) {
			const value = bloc == 'face' ? this.state.face.value : this.state.back.value;

			if (value <= 0) {
				return;
			}

			const i1 = value == botCards[c].value && botCards[c].visible;
			const i2 = value == botCards[c + cols].value && botCards[c + cols].visible;
			const i3 = value == botCards[c + cols + cols].value && botCards[c + cols + cols].visible;

			if (i1 && i2) {
				return c + cols + cols;
			} else if (i2 && i3) {
				return c;
			} else if (i1 && i3) {
				return c + cols;
			} else if (i1) {
				return c + cols + cols;
			} else if (i2) {
				return c;
			} else if (i3) {
				return c + cols;
			}
		}

		return -1;
	}

	restartGame() {
		alert();
	}

	render() {
		let restartButton = '';
		if (this.state.step == 'end') {
			restartButton = <button onClick={() => this.restartGame()}>Nouvelle manche</button>;
		}

		return (
			<div className='container'>
				<div className='row'>
					<div className='col'>
						<label style={{color: 'white'}}>Score : { this.state.botScore }</label>
						<Grid cards={this.state.botCards} onGridClick={() => {}} />
					</div>
				</div>
				<br></br>
				<div className='row'>
					<div className='col'>
						<Card value={this.state.face.value} selected={this.state.choice == 'face'} visible={this.state.face.visible} onCardClick={() => this.clickDiscard()} />
					
					
						{restartButton}
					
					
						<Card value={this.state.back.value} selected={this.state.choice == 'back'} visible={this.state.back.visible} onCardClick={() => this.clickDeck()} />
					</div>
				</div>
				<br></br>
				<div className='row'>
					<div className='col'>
						<Grid cards={this.state.playerCards} onGridClick={(i) => this.playerPlays.bind(this, i)}/>
						<label style={{color: 'white'}}>Score : { this.state.playerScore }</label>
					</div>
				</div>
			</div>
		);
	}
}
