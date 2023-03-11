function getCardsOfValue(value, count) {
	let cards = [];
	for (let i = 0; i < count; i++) {
		cards.push({
			value: value,
			visible: false
		});
	}

	return cards;
}

export function getNewCardsPack() {
	const cards = [];
	cards.push(...getCardsOfValue(-2, 5));
	cards.push(...getCardsOfValue(-1, 10));
	cards.push(...getCardsOfValue(0, 15));
	for (let i = 1; i <= 12; i++) {
		cards.push(...getCardsOfValue(i, 10));
	}
	shuffleArray(cards);

	return cards;
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}
