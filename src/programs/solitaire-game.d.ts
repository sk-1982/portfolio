export function initSolitaire(elements: {
	gameEl: HTMLElement,
	dealPileEl: HTMLElement,
	dealEl: HTMLElement,
	finishContainerEl: HTMLElement,
	deskContainerEl: HTMLElement,
	deckPileEl: HTMLElement,
});

export function resetGame();

export function setEventListeners(l?: null | {
	onGameBegin?: () => void,
	onGameReset?: () => void,
	onGameWin?: () => void
});

export async function load();
