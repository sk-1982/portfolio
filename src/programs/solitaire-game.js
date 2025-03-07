// https://github.com/rjanjic/js-solitaire

import { aces, card, cardBack, cardFront, cardMoving, finishDest, seven, sprite2 } from "./solitaire.styles.ts";
import cursors from "@/cursor.module.scss";
import cardFrontUrl from '@images/solitaire-cards.webp?url';
import cardBackUrl from '@images/solitaire-cards-2.webp?url';

let gameEl = null;
let dealPileEl = null;
let dealEl = null;
let finishContainerEl = null;
let deskContainerEl = null;
let deckPileEl = null;
let onGameBegin = () => {};
let onGameReset = () => {};
let onGameWin = () => {};
let cardFrontImg = '';
let cardBackImg = '';
let initialized = false;

export const load = async () => {
    const [b1, b2] = await Promise.all([
        fetch(cardFrontUrl).then(r => r.blob()),
        fetch(cardBackUrl).then(r => r.blob())
    ]);

    cardFrontImg = URL.createObjectURL(b1);
    cardBackImg = URL.createObjectURL(b2);
};

const X = {
    h: 0,
    c: -71,
    d: -142,
    s: -213
}

const cardWidth = 71;
const cardHeight = 96;
const state = {
    // clubs (♣), diamonds (♦), hearts (♥) and spades (♠)
    types: ['c', 'd', 'h', 's'],
    // 0 (black), 1 (red)
    colors: {'c': 0, 'd': 1, 'h': 1, 's': 0},
    cards: [
        // { el: null, type: 's', number: 0, facingUp: false }, {...}
    ],
    // dealer deck
    deal: {
        pile: {
            el: null,
            cards: [/* 0, 1, ... */]
        },
        deal: {
            el: null,
            cards: [/* 0, 1, ... */]
        },
    },
    // finish deck
    finish: [
        // { el: null, cards: [ 0, 1, ... ] }, {...}
    ],
    // playing desk
    desk: [
        // { el: null, cards: [ 0, 1, ... ]}, {...}
    ],
    // move target
    target: null,
    // moving
    moving: {
        card: {},
        element: null,
        index: -1,
        capture: false,
        container: {
            cards: [/* 0, 1, ... */]
        },
        target: null,
        origin: {},
        offset: {
            x: 0,
            y: 0,
        },
        destinations: []
    }
};

const getCard = index => state.cards[index];

const faceUp = card => {
    state.cards[card].facingUp = true;
    requestAnimationFrame(() => {
        state.cards[card].el.classList.add(cardFront, cursors.pointer);
        state.cards[card].el.classList.remove(cardBack, sprite2);
    });
};

const faceDown = card => {
    state.cards[card].facingUp = false;
    state.cards[card].el.classList.remove(cardFront, cursors.pointer);
    state.cards[card].el.classList.add(cardBack, sprite2);
};

const faceUpLastOnDesk = index => {
    const card = getLastOnDesk(index);
    if (card !== null) {
        faceUp(card);
    }
};

const appendToCard = (target, card) => {
    state.cards[target].el.appendChild(
        state.cards[card].el
    )
};

const appendToDesk = (desk, card) => {
    state.desk[desk].el.appendChild(
        state.cards[card].el
    )
};

const getLastOnDesk = desk => {
    const l = state.desk[desk].cards.length;
    if (l > 0) {
        return state.desk[desk].cards[l - 1];
    }
    return null;
};

const getLastOnPile = (pile, index) => {
    const l = state[pile][index].cards.length;
    if (l > 0) {
        const card = state[pile][index].cards[l - 1];
        return state.cards[card];
    }
    return {};
};

const getCardLocation = card => {
    for (let i = 0; i < 7; i++) {
        const index = state.desk[i].cards.indexOf(card);
        if (index > -1) {
            return {
                location: 'desk',
                pile: i,
                index: index
            }
        }
    }

    for (let i = 0; i < 4; i++) {
        const index = state.finish[i].cards.indexOf(card);
        if (index > -1) {
            return {
                location: 'finish',
                pile: i,
                index: index
            }
        }
    }

    for (let i of ['deal', 'pile']) {
        const index = state.deal[i].cards.indexOf(card);
        if (index > -1) {
            return {
                location: 'deal',
                pile: i,
                index: index
            }
        }
    }
    // debugger;
    // 'Card not found!';
};

const getSubCards = card => {
    const { location, pile, index } = getCardLocation(card);

    return state[location][pile].cards.filter(
        (elem, i, array) => array.indexOf(elem) > index
    );
};

const getPile = (pile, index) => {
    return state[pile][index];
};

const moveCardTo = (dest, i, card) => {
    const {
        location,
        pile,
        index
    } = getCardLocation(card);

    const moving = state[location][pile].cards.filter(
        (elem, i, array) => array.indexOf(elem) >= index
    );

    // remove from source
    state[location][pile].cards = state[location][pile].cards.filter(
        (elem, i, array) => moving.indexOf(elem) === -1
    );

    // append to destination
    state[dest][i].cards = state[dest][i].cards.concat(moving);

    // console.log(state);
};

const canBePlacedOnCard = (child, parent) => {
    const { type, number } = getCard(child);
    const {
        type: parentType,
        number: parentNumber
    } = getCard(parent);
    return (
        (parentNumber - 1) === number &&
        state.colors[parentType] !== state.colors[type]
    );
};

const placeCardTo = (dest, index, card) => {
    function remove(array, element) {
        const index = array.indexOf(element);

        if (index !== -1) {
            array.splice(index, 1);
        }
    }
    state[dest][index].cards.push(card);
    remove(state.deal.pile.cards, card);
};

function dealCards() {
    let card = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = i; j < 7; j++) {
            const last = getLastOnDesk(j);
            if (last !== null) {
                appendToCard(last, card)
            } else {
                appendToDesk(j, card);
            }

            placeCardTo('desk', j, card);

            if (j === i) {
                faceUp(card);
            }
            card++;
        }
    }
}

export function resetGame() {
    if (!initialized) return;
    // clear decks
    for (let i = 0; i < 7; i++) {
        state.desk[i].cards = [];
    }
    for (let i = 0; i < 4; i++) {
        state.finish[i].cards = [];
    }
    state.deal.pile.cards = [];
    state.deal.deal.cards = [];

    // randomise cards
    state.cards.sort(() => (Math.random() < .5) ? -1 : 1);

    // re-assign indexes
    requestAnimationFrame(() => {
        for (let i = 0, l = state.cards.length; i < l; i++) {
            const { facingUp, el } = state.cards[i];
            state.deal.pile.cards.push(i);

            el.onmousedown = captureMove(i);
            el.onmouseup = releaseMove;
            el.onclick = handleClick(i);

            if (facingUp) {
                faceDown(i);
            }
            dealPileEl.appendChild(el);
        }
        dealCards();
        onGameReset?.();
    });
}

const handleClick = index => event => {
    onGameBegin?.();
    event.stopPropagation();
    const { el, facingUp } = getCard(index);

    if (state.moving.capture) return;
    releaseMove();

    if (facingUp) {
        const { location, pile } = getCardLocation(index);

        if (location === 'deal' && pile === 'deal') {
            const {
                el: lastEl
            } = getLastOnPile('deal', 'deal');
            if (el !== lastEl) return;
        }

        const destinations = getAvailableDestinations(index, true);

        if (destinations.length > 0) {
            const {
                target,
                el: targetEl
            } = destinations[0];

            const {
                dest: destTarget,
                pile: pileTarget,
                card: cardTarget
            } = target;

            moveCardTo(destTarget, pileTarget, cardTarget);

            // face up last cards on desk
            if (location === 'desk') {
                faceUpLastOnDesk(pile);
            }
            targetEl.appendChild(el);
        } else {
            return;
        }
        gameFinish();
    } else {
        // is on deal deck
        const { location, pile } = getCardLocation(index);
        if (location === 'deal' && pile === 'pile') {
            const max = state.deal.pile.cards.length - 1;
            const min = Math.max(-1, max - 3);

            for (let i = max; i > min; i--) {
                const card = state.deal.pile.cards[i];
                const { el } = getCard(card);
                faceUp(card);
                moveCardTo('deal', 'deal', card);
                dealEl.appendChild(el);
            }
        }
    }
};

function restartDeal() {
    state.deal.pile.cards = state.deal.deal.cards;
    state.deal.deal.cards = [];

    for (const card of state.deal.pile.cards) {
        const { el } = getCard(card);
        faceDown(card);
        deckPileEl.appendChild(el);
    }
    onGameBegin?.();
}

function getMousePosition(event) {
    return {
        x: event.pageX,
        y: event.pageY
    };
}

const handleMove = event => {
    if (state.moving.capture) {
        const el = state.moving.element;
        const { x, y } = getMousePosition(event);

        el.style.left = `${x - state.moving.offset.x}px`;
        el.style.top = `${y - state.moving.offset.y}px`;
    }
};

const startMovingPosition = event => {
    const el = state.moving.element;
    const { x, y } = getMousePosition(event);
    const { top, left } = el.getBoundingClientRect();
    el.classList.add(cardMoving);

    state.moving.offset = {
        x: x - left,
        y: y - top,
    };

    el.style.left = `${x - state.moving.offset.x}px`;
    el.style.top = `${y - state.moving.offset.y - 5}px`;
};

let moving;
const captureMove = index => event => {
    event.preventDefault();
    event.stopPropagation();
    const { el, facingUp } = getCard(index);
    if (facingUp) {
        const { location, pile } = getCardLocation(index);
        if (location === 'deal' && pile === 'deal') {
            const { el: lastEl } = getLastOnPile('deal', 'deal');
            if (el !== lastEl) {
                return false;
            }
        }
        moving = setTimeout(() => {
            state.moving.element = event.target;
            state.moving.capture = true;
            state.moving.index = index;
            state.moving.card = getCard(index);
            state.moving.origin = getCardLocation(index);

            startMovingPosition(event);

            const destinations = getAvailableDestinations(index);
            state.moving.destinations = destinations;

            for (const dest of destinations) {
                dest.el.classList.add(finishDest);
            }

            for (let i = 0, l = destinations.length; i < l; i++) {
                const { top, left, width, height } = destinations[i].el.getBoundingClientRect();
                state.moving.destinations[i].offset = {
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                }
            }

            // console.log(state.moving.destinations);
        }, 200);
    }
};

const dropCard = (x, y) => {
    for (const destination of state.moving.destinations) {
        const { width, height, left, top } = destination.offset;
        destination.el.classList.remove(finishDest);
        if (
            (x > left && x < left + width) &&
            (y > top && y < top + height)
        ) {
            const { dest, pile, card } = destination.target;
            moveCardTo(dest, pile, card);

            destination.el.appendChild(state.moving.element);

            // check game finish
            gameFinish();

            // face up last on desk
            const {
                location: originLocation,
                pile: originPile
            } = state.moving.origin;

            if (originLocation === 'desk') {
                faceUpLastOnDesk(originPile);
            }
        }
    }
};

let release;
const releaseMove = event => {
    clearTimeout(moving);
    clearTimeout(release);
    if (state.moving.capture) {
        release = setTimeout(() => {
            const { x, y } = getMousePosition(event);
            requestAnimationFrame(() => {
                dropCard(x, y);

                state.moving.element.classList.remove(cardMoving);
                state.moving.element.style.left = '';
                state.moving.element.style.top = '';
                state.moving.element = null;
                state.moving.capture = false;
                // console.log('release');
            });
        }, 100);
    }
};

const getAvailableDestinations = (index, first = false) => {
    const { type, number } = getCard(index);
    const destinations = [];
    if (number === 1) { // aces
        // finish pile
        for (let i = 0; i < 4; i++) {
            const { cards, el} = getPile('finish', i);
            if (cards.length === 0) {
                destinations.push({
                    el: el,
                    target: {
                        dest: 'finish',
                        pile: i,
                        card: index
                    }
                });

                if (first) return destinations;
            }
        }
    }
    // other cards
    // move to finish pile
    const subCards = getSubCards(index);
    if (!subCards.length > 0) {
        for (let i = 0; i < 4; i++) {
            const l = state.finish[i].cards.length;
            if (l + 1 === number) {
                const {
                    type: lastType
                } = getLastOnPile('finish', i);

                if (lastType === type) {
                    destinations.push({
                        el: state.finish[i].el,
                        target: {
                            dest: 'finish',
                            pile: i,
                            card: index
                        }
                    });
                    if (first) return destinations;
                    break;
                }
            }
        }
    }
    // desk pile
    for (let i = 0; i < 7; i++) {
        const last = getLastOnDesk(i);
        if (last !== null) {
            if (canBePlacedOnCard(index, last)) {
                destinations.push({
                    el: state.cards[last].el,
                    target: {
                        dest: 'desk',
                        pile: i,
                        card: index
                    }
                });
                if (first) return destinations;
            }
        } else { // empty desk, accepts only kings
            if (number === 13) { // kings
                destinations.push({
                    el: state.desk[i].el,
                    target: {
                        dest: 'desk',
                        pile: i,
                        card: index
                    }
                });
                if (first) return destinations;
            }
        }
    }
    return destinations;
};


const gameFinish = () => {
    // game finish check
    for (let i = 3; i >= 0; i--) {
        const l = state.finish[i].cards.length;
        if (l < 13) return;
    }

    onGameWin?.();
    const { width, height, left, top } = gameEl.getBoundingClientRect();
    win(width, height, left, top);
};

const win = (canvasWidth, canvasHeight, canvasLeft, canvasTop) => {
    const image = document.createElement('img');
    image.src = cardFrontImg;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    gameEl.appendChild(canvas);

    const context = canvas.getContext('2d');
    let card = 52;
    const particles = [];

    const drawCard = (x, y, spriteX, spriteY) => {
        context.drawImage(
            image,
            spriteX,
            spriteY,
            cardWidth,
            cardHeight,
            x,
            y,
            cardWidth,
            cardHeight
        );
    };

    const Particle = function (id, x, y, sx, sy) {
        if (sx === 0) sx = 2;
        const spriteX = ( id % 4 ) * cardWidth;
        const spriteY = Math.floor(id / 4) * cardHeight;

        // initial position of the card
        drawCard(x, y, spriteX, spriteY);

        this.update = () => {
            x += sx;
            y += sy;

            // is particle out of canvas
            if (x < -cardWidth || x > (canvas.width + cardWidth)) {
                const index = particles.indexOf(this);
                particles.splice(index, 1);
                return false;
            }

            // bounce from floor
            if (y > canvas.height - cardHeight) {
                y = canvas.height - cardHeight;
                sy = -sy * 0.85;
            }
            sy += 0.98;

            drawCard(
                Math.floor(x),
                Math.floor(y),
                spriteX,
                spriteY
            );
            return true;
        };
    };

    const throwCard = (x, y) => {
        if (card < 1) return;
        card--;
        const particle = new Particle(
            card,
            x,
            y,
            Math.floor(Math.random() * 6 - 3) * 2,
            -Math.random() * 16
        );

        // const particle = new Particle(card, x, y, 0, 0);
        particles.push(particle);
    };

    let throwInterval = [];
    for (let i = 0; i < 4; i++) {
        const { left, top } = state.finish[i].el.getBoundingClientRect();
        throwInterval[i] = setInterval(function () {
            throwCard(left - canvasLeft, top - canvasTop);
        }, 1000);
        // throwCard(left - canvasLeft, top - canvasTop);
    }

    const updateInterval = setInterval(function () {
        let i = 0, l = particles.length;
        while (i < l) {
            particles[i].update() ? i++ : l--;
        }
        // clearInterval(updateInterval)
    }, 1000 / 60);

    function removeAnimation(event) {
        event.preventDefault();
        clearInterval(updateInterval);
        for (let i = 0; i < 4; i++) {
            clearInterval(throwInterval[i]);
        }
        canvas.parentNode.removeChild(canvas);
        document.removeEventListener('click', removeAnimation)
    }
    document.addEventListener('click', removeAnimation, false);
};

export const setEventListeners = (l) => {
    onGameBegin = l?.onGameBegin;
    onGameReset = l?.onGameReset;
    onGameWin = l?.onGameWin;
};

export function initSolitaire(elements) {
    if (initialized) return resetGame();
    initialized = true;

    gameEl = elements.gameEl;
    dealPileEl = elements.dealPileEl;
    dealEl = elements.dealEl;
    finishContainerEl = elements.finishContainerEl;
    deskContainerEl = elements.deskContainerEl;
    deckPileEl = elements.deckPileEl;

    gameEl.style.cssText = `--b:url(${cardFrontImg});--b2:url(${cardBackImg})`;

    // create all cards
    for (let i = 0; i < 4; i++) {
        for (let j = 1; j <= 13; j++) {
            const el = document.createElement('div');
            el.style.cssText = `--x:${X[state.types[i]]}px;--y:-${(j - 1) * cardHeight}px`;
            el.classList.add(
                card,
                cardBack,
                sprite2
            );

            state.cards.push({
                el: el,
                type: state.types[i],
                number: j,
                facingUp: false
            });
        }
    }

    // create aces decks
    for (let i = 0; i < 4; i++) {
        const el = document.createElement('div');
        el.classList.add(
            aces,
            sprite2
        );
        state.finish.push({
            el: el,
            cards: []
        });
        finishContainerEl.appendChild(el);
    }

    // create desk decks
    for (let i = 0; i < 7; i++) {
        const el = document.createElement('div');
        el.classList.add(
            seven,
        );
        state.desk.push({
            el: el,
            cards: []
        });
        deskContainerEl.appendChild(el);
    }

    dealPileEl.onclick = restartDeal;
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', releaseMove);

    resetGame();
}

