import { css } from '@linaria/core';

const CARD_WIDTH = 71;
const CARD_HEIGHT = 96;

export const sprite2 = css`background: var(--b2)`;

export const playField = css`
	background: green;
	border: 1px solid;
	border-color: gray #fff #fff gray;
	> div {
		box-shadow: inset 1px 1px #000, inset -1px -1px #dfdfdf;
		width: 580px;
		height: 385px;
		position: relative;
		clip-path: inset(0);
	}
	* {
		box-sizing: border-box;
	}
`;

export const card = css`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  position: absolute;
  left: 0;
  top: 0;
  user-select: none;
`;

export const cardFront = css`
	background: var(--b) var(--x) var(--y);
`;

export const cardBack = css`
  background-position-x: var(--bg-pos);
`;

export const cardMoving = css`
	position: fixed;
	z-index: 1;
`;

export const deck = css`
	width: 250px;
	position: absolute;
	left: 11px;
	top: 5px;
`;

export const deckPile = css`
	width: ${CARD_WIDTH}px;
	height: ${CARD_HEIGHT}px;
	top: 0;
	position: absolute;
	background-position-x: 142px;
	
	.${card} + .${card} {
		margin-top: 1px;
		margin-left: 2px;
		
		+ .${card} {
			margin-top: 2px;
			margin-left: 4px;
		}
	}
`;

export const deckDeal = css`
	left: 81px;
	top: 0;
	position: absolute;
	
	.${card}:last-child {
		left: 28px;
		top: 2px;
	}

  .${card}:nth-last-child(2) {
    left: 12px;
	  top: 1px;
  }
	
	.${card}:first-child {
		left: 0;
	}

  .${card}:first-child + .${card}:last-child {
    left: 12px;
    top: 1px;
  }
`;

export const finish = css`
	position: absolute;
	left: 244px;
	top: 5px;
`;

export const board = css`
	position: absolute;
	top: 107px;
	
	.${cardFront} > .${cardFront} {
		top: 15px;
	}
	
	.${cardBack} {
		> .${cardFront}, > .${cardBack} {
			top: 3px;
		}
	}
`;

export const seven = css`
  position: relative;
  float: left;
  width: ${CARD_WIDTH}px;
  top: 0;
  margin-left: 10px;
  height: ${CARD_HEIGHT}px;
  border: 1px dotted;
  border-radius: 4px;
`;

export const aces = css`
  width: ${CARD_WIDTH}px;
  position: relative;
  margin-left: 10px;
  height: ${CARD_HEIGHT}px;
  float: left;
	background-position-x: 71px;
`;

export const finishDest = css`
		border-radius: 2px;
		box-shadow: 0 0 0 1px #03ffff
`;
