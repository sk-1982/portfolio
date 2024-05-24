import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Program } from '../components/program.tsx';
import { Window } from '../components/window.tsx';
import { board, deck, deckDeal, deckPile, finish, playField, sprite2 } from './solitaire.styles.ts';
import { initSolitaire, resetGame, setEventListeners, load as loadGame } from './solitaire-game';
import cursors from '@/cursor.module.scss';
import { DropdownButton } from '../components/dropdown.tsx';
import solitaireSmall from '@images/solitaire-small.webp';
import { css } from '@linaria/core';
import win98 from '@98.css';

const timeContainer = css`
  position: absolute;
  bottom: 0;
  text-align: right;
  right: 0;
  left: 0;
  padding: 2px 4px;
  background: #fff;
`;

const Solitaire = () => {
	const [isOpen, setOpen] = useState(false);
	const gameRef = useRef<HTMLDivElement | null>(null);
	const finishRef = useRef<HTMLDivElement | null>(null);
	const boardRef = useRef<HTMLDivElement | null>(null);
	const deckPileRef = useRef<HTMLDivElement | null>(null);
	const deckDealRef = useRef<HTMLDivElement | null>(null);
	const [bg, setBg] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [startTime, setStartTime] = useState(0);
	const [elapsed, setElapsed] = useState(0);
	const [won, setWon] = useState(false);

	useEffect(() => {
		if (!playing || won) return;
		const interval = setInterval(() => {
			setElapsed(Math.floor((Date.now() - startTime) / 1000));
		}, 500);
		return () => clearInterval(interval);
	}, [startTime, playing, won]);

	useEffect(() => {
		initSolitaire({
			gameEl: gameRef.current!,
			finishContainerEl: finishRef.current!,
			dealPileEl: deckPileRef.current!,
			deckPileEl: deckPileRef.current!,
			dealEl: deckDealRef.current!,
			deskContainerEl: boardRef.current!
		});

		setEventListeners({
			onGameBegin: () => setPlaying(p => {
				if (!p) {
					setStartTime(Date.now());
					setElapsed(0);
				}
				return true;
			}),
			onGameReset: () => {
				setPlaying(false);
				setElapsed(0);
				setWon(false);
			},
			onGameWin: () => {
				setPlaying(false);
				setWon(true);
			}
		})

		return () => setEventListeners(null);
	}, []);

	return (<Program name="sol.exe" onOpen={useCallback(() => {
		setOpen(o => {
			if (!o) resetGame();
			return true;
		});
		setBg(Math.floor(Math.random() * 12));
	}, [])}>
		<Window title="Solitaire" id="sol.exe" isOpen={isOpen} onClose={() => setOpen(false)}
		        icon={solitaireSmall}
		        windowingStrategy="display" positionStrategy="position"
		        x={10} y={10}>
			<DropdownButton items={[{
				name: 'Deal',
				onClick: () => resetGame()
			}, '|', {
				name: 'Exit',
				onClick: () => setOpen(false)
			}]}>
				Game
			</DropdownButton>
			<div className={playField} style={{ '--bg-pos': `${bg * -71}px` }}>
				<div ref={gameRef}>
					<div className={finish} ref={finishRef}/>
					<div className={board} ref={boardRef}/>

					<div className={deck}>
						<div className={`${deckPile} ${cursors.pointer} ${sprite2}`} ref={deckPileRef}/>
						<div className={deckDeal} ref={deckDealRef}/>
					</div>

					<div className={`${timeContainer} ${win98.bold}`}>Time: {elapsed}</div>
				</div>
			</div>
		</Window>
	</Program>);
};

export const load = async () => {
	await loadGame();
	return (<Solitaire />);
};
