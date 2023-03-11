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
		setInterval(() => {
			if (this.state.turn != 'bot') {
				return;
			}

			if (this.state.step == 'begin') {
				const index1 = Math.floor(Math.random() * 12);
				let index2 = index1;
				while (index1 == index2) {
					index2 = Math.floor(Math.random() * 12);
				}
				this.botPlays(index1);
				this.botPlays(index2);
				this.setState({botCardsVisible: 2, turn: 'player'});
			}

			if (this.state.step == 'game') {
				const allHidden = this.state.botCards.filter(c => !c.visible);

				if (allHidden.length == 0) {
					return;
				}

				let index = Math.floor(Math.random() * allHidden.length);
				index = this.state.botCards.indexOf(allHidden[index]);

				this.botPlays(index);

				this.setState({turn: 'player'});
				this.checkFinished();
			}
		}, 1);
	}

	componentDidUpdate() {
		this.checkColumns('player', this.state.playerCards);
		this.checkColumns('bot', this.state.playerCards);
	}

	clickDeck() {
		if (this.state.step == 'begin' || this.state.turn == 'bot') {
			return;
		}

		if (this.state.choice != null) {
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
			if (card.visible) {
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
			this.setState({step: 'end'});
		}
	}

	updateScore() {
		const playerScore = this.state.playerScore + this.getScore(this.state.playerCards);
		const botScore = this.state.botScore + this.getScore(this.state.botCards);

		this.setState({playerScore: playerScore, botScore: botScore});
	}

	botPlays(i) {
		const cards = this.state.botCards;
		cards[i].visible = true;
		this.setState({botCards: cards});
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
						<Card value={this.state.face.value} visible={this.state.face.visible} onCardClick={() => this.clickDiscard()} />
					
					
						{restartButton}
					
					
						<Card value={this.state.back.value} visible={this.state.back.visible} onCardClick={() => this.clickDeck()} />
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
