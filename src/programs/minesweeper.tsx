import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Program } from '../components/program.tsx';
import { Window } from '../components/window.tsx';
import { css } from '@linaria/core';

import faces from '@images/mine-faces.webp?inline';
import numbers from '@images/mine-numbers.webp?inline';
import sprites from '@images/mine-sprites.webp?inline';
import minesweeperSmall from '@images/minesweeper-small.webp';
import { choices } from '../utils/random.ts';
import cn from 'clsx/lite';
import { DropdownButton } from '../components/dropdown.tsx';
import { Check } from '../components/check.tsx';
import { MenuBarGroup } from '../components/menu-bar.tsx';
import { Fragment } from 'preact';

const content = css`
	border: 3px solid;
	border-color: #fff gray gray #fff;
	padding: 6px;
	margin-right: 2px;
`;

const topContainer = css`
	border: 2px solid;
	border-color: gray #fff #fff gray;
	padding: 4px 5px 3px 5px;
	margin-bottom: 6px;
	display: flex;
	justify-content: space-between;
`;

const buttonNoActive = css`
  &:active {
    box-shadow: inset 1px 1px #fff, inset -1px -1px gray !important;
  }
`;

const buttonActive = css``;

const fieldButtonContents = css`
	width: 15px;
	height: 15px;
	background: url(${sprites});
`;

const field = css`
	border: 3px solid;
	border-color: gray #fff #fff gray;
	display: grid;
	> div {
		min-width: 0;
		min-height: 0;
		padding: 0;
		outline: none;
		box-shadow: inset 1px 1px #fff, inset -1px -1px gray;
		border-right: 1px solid black;
		border-bottom: 1px solid black;
		&:not(.${buttonNoActive}).${buttonActive} {
			box-shadow: none;
			border-right-style: dotted;
			border-bottom-style: dotted;
			> * {
				transform: translateX(1px);
			}
		}
	}
`;

const cellRed = css`background: red`;

const counter = css`
	border: 1px solid;
	border-color: gray #fff #fff gray;
	padding: 1px;
	background: #000;
	display: grid;
	grid-template-columns: repeat(3, 11px);
	gap: 2px;
  height: 21px;
	> div {
		background: url(${numbers}) var(--b);
	}
`;

const faceButton = css`
	background: url(${faces});
	width: 26px;
	height: 26px;
	&:active {
		background-position-x: -26px !important;
	}
`;

const dropdown = css`
	height: 18px; 
	min-height: 18px;
	margin-bottom: 1px;
`;

const faceButtonSurprised = css`background-position-x: -52px`;
const faceButtonDead = css`background-position-x: -104px`;
const faceButtonWon = css`background-position-x: -78px`;

const highscoreContent = css`
	display: flex;
	flex-direction: column;
	padding: 13px 11px 12px 11px;
	height: 100%;
	justify-content: space-between;
	button {
		width: 76px;
		margin-left: auto;
	}
`;

const leaderboardContent = css`
	padding: 17px 10px 10px 12px;
  button {
    min-width: 74px;
  }
`;

const leaderboardPanel = css`
	width: 309px;
	height: 96px;
	position: relative;
	display: grid;
	padding: 17px 9px 17px 15px;
	box-sizing: border-box;
	margin-bottom: 9px;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	grid-template-rows: repeat(3, minmax(0, 1fr));
	gap: 14px 0;
`;

const leaderboardLabel = css`
	position: absolute;
	background: silver;
	top: -5px;
	left: 7px;
	padding: 0 2px;
`;

const leaderboardButtonContainer = css`
	display: flex;
	gap: 6px;
	justify-content: end;
`;

const customFieldContainer = css`
	display: flex;
	gap: 11px;
	padding: 11px 11px 12px 12px;
`;

const customFieldInputs = css`
	display: grid;
	grid-template-columns: 62px 62px;
	grid-template-rows: repeat(3, minmax(0, 1fr));
	gap: 15px 2px;
	align-items: center;
  margin-right: auto;
	input {
		width: 61px;
	}
`;

const customFieldButtons = css`
	display: flex;
	flex-direction: column;
	gap: 5px;
	button:first-child span {
		padding-left: 0.85px;
	}
`;

type MineCounterProps = {
	value: number
};

const MineCounter = ({ value }: MineCounterProps) => {
	const isNegative = value < 0;
	const abs = Math.abs(value);
	return (<div className={counter}>
		<div style={{'--b': isNegative ? '-110px' : `-${Math.floor(abs / 100) * 11}px`}}/>
		<div style={{'--b': `-${Math.floor(abs / 10) % 10 * 11}px`}}/>
		<div style={{'--b': `-${abs % 10 * 11}px`}}/>
	</div>)
};

const REVEALED_MINE = 10;
const REVEALED_MINE_RED = 11;
const REVEALED_INCORRECT = 9;

type Preset = {
	width: number,
	height: number,
	level: 'beginner' | 'intermediate' | 'expert' | 'custom',
	mineCount: number
};

const presets = {
	beginner: { level: 'beginner', width: 8, height: 8, mineCount: 10 },
	intermediate: { level: 'intermediate', width: 16, height: 16, mineCount: 40 },
	expert: { level: 'expert', width: 30, height: 16, mineCount: 99 }
} as const;

const genMines = (options: { x: number, y: number, preset: Preset }) => {
	const allMines = [];
	for (let x = 0; x < options.preset.width; ++x) {
		for (let y = 0; y < options.preset.height; ++y) {
			if (x !== options.x || y !== options.y)
				allMines.push(`${x},${y}`);
		}
	}
	return new Set(choices(allMines, options.preset.mineCount));
};

export const Minesweeper = () => {
	const [isOpen, setOpen] = useState(false);
	const [preset, setPreset] = useState<Preset>({ ...presets.beginner });
	const [mines, setMines] = useState(new Set<string>());
	const [flags, setFlags] = useState(new Set<string>());
	const [marks, setMarks] = useState(new Set<string>());
	const [active, setActive] = useState(new Set<string>());
	const [mouseDown, setMouseDown] = useState(false);
	const [enableMarks, setEnableMarks] = useState(true);
	const [gameState, setGameState] = useState<'playing' | 'dead' | 'won'>('playing');
	const [revealed, setRevealed] = useState<Record<string, number>>({});
	const [startTime, setStartTime] = useState<number | null>(null);
	const [elapsed, setElapsed] = useState(0);
	const [highscoreOpen, setHighscoreOpen] = useState(false);
	const [leaderboardOpen, setLeaderboardOpen] = useState(false);
	const [customOpen, setCustomOpen] = useState(false);
	const [, setUpdate] = useState(0);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const heightRef = useRef<HTMLInputElement | null>(null);
	const widthRef = useRef<HTMLInputElement | null>(null);
	const minesRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const onMouseUp = () => setMouseDown(false);
		document.addEventListener('mouseup', onMouseUp);
		return () => document.removeEventListener('mouseup', onMouseUp);
	}, []);

	useEffect(() => {
		if (startTime === null) return;

		const interval = setInterval(() => {
			setElapsed(Math.floor((Date.now() - startTime) / 1000));
		}, 500);

		return () => clearInterval(interval);
	}, [startTime]);

	const reset = useCallback(() => {
		setMines(new Set());
		setFlags(new Set());
		setMarks(new Set());
		setRevealed({});
		setElapsed(0);
		setStartTime(null);
		setGameState('playing');
	}, []);

	const flagMarkCell = useCallback((key: string) => {
		if (gameState !== 'playing') return;
		if (key in revealed) return;

		if (marks.has(key)) {
			setFlags(f => {
				f = new Set(f);
				f.delete(key);
				return f;
			});

			setMarks(m => {
				m = new Set(m);
				m.delete(key);
				return m;
			});
		} else if (flags.has(key)) {
			setFlags(f => {
				f = new Set(f);
				f.delete(key);
				return f;
			});

			if (enableMarks)
				setMarks(m => new Set([...m, key]));
		} else {
			setFlags(f => new Set([...f, key]));
		}
	}, [marks, flags, gameState, revealed, enableMarks]);

	const revealCell = useCallback((x: number, y: number) => {
		let mineSet = mines;
		if (!mines.size) {
			mineSet = genMines({ x, y, preset });
			setMines(mineSet);
			setStartTime(Date.now());
		}

		const newRevealed = { ...revealed };

		const floodReveal = (x: number, y: number) => {
			if (x < 0 || y < 0 || x >= preset.width || y >= preset.height) return;
			const key = `${x},${y}`;
			if (flags.has(key)) return;

			if (key in newRevealed) return;
			const adjacent = [...new Array(3)]
				.flatMap((_, i) => [...new Array(3)].map((_, j) => [x - 1 + i, y - 1 + j] as const));
			const count = adjacent.reduce((t, [x, y]) => t + +mineSet.has(`${x},${y}`), 0)

			newRevealed[key] = count;
			if (!count)
				adjacent.forEach(([x, y]) => floodReveal(x, y));
		};

		const key = `${x},${y}`;
		if (mineSet.has(key)) {
			for (const mine of mineSet)
				newRevealed[mine] = REVEALED_MINE;
			newRevealed[key] = REVEALED_MINE_RED;
			for (const flag of flags) {
				if (!mineSet.has(flag))
					newRevealed[flag] = REVEALED_INCORRECT;
			}
			setGameState('dead');
			setStartTime(null);
		} else {
			floodReveal(x, y);

			let allRevealed = true;

			for (let x1 = 0; x1 < preset.width; ++x1) {
				for (let y1 = 0; y1 < preset.height; ++y1) {
					const key = `${x1},${y1}`;
					if (!mines.has(key) && !(key in newRevealed)) {
						allRevealed = false;
						break;
					}
				}
			}

			if (allRevealed) {
				setGameState('won');
				setStartTime(null);
				if (preset.level !== 'custom' && elapsed < +(localStorage.getItem(`minesweeper-${preset.level}-highscore`) ?? 999))
					setHighscoreOpen(true);
			}
		}

		setRevealed(newRevealed);
	}, [mines, preset, revealed, flags, elapsed]);

	const cellActivate = useCallback((x: number, y: number, e: MouseEvent) => {
		if (gameState !== 'playing') return;

		e.preventDefault();
		const key = `${x},${y}`;

		if (e.buttons & 1) {
			setActive(new Set([key]))
		} else if (e.buttons & 4) {
			const active = new Set<string>();
			for (let x1 = x - 1; x1 <= x + 1; ++x1)
				for (let y1 = y - 1; y1 <= y + 1; ++y1)
					active.add(`${x1},${y1}`);
			setActive(new Set(active))
		} else if (e.buttons & 2 && e.type === 'mousedown') {
			flagMarkCell(key)
		}
	}, [flagMarkCell, gameState]);

	const cellDeactivate = useCallback((x: number, y: number, e: MouseEvent) => {
		if (gameState !== 'playing') return;

		e.preventDefault();
		setActive(new Set());

		if (e.type === 'mouseup' && e.button === 0 && !flags.has(`${x},${y}`))
			revealCell(x, y);
	}, [revealCell, flags, gameState]);

	return (<Program name="winmine.exe" onOpen={useCallback(() => setOpen(true), [])}>
		<Window title="Congratulations" id="winmine-highscore" isOpen={highscoreOpen} onClose={() => setHighscoreOpen(false)}
		        width={228} height={139} x={-1} y={-1}>
			<div className={highscoreContent}>
				<span>You have the fastest time for {preset.level} level. Please type your name:</span>
				<input type="text" ref={inputRef} defaultValue="Anonymous" />
				<button onClick={() => {
					if (gameState !== 'won') return;
					localStorage.setItem(`minesweeper-${preset.level}-highscore`, elapsed.toString());
					localStorage.setItem(`minesweeper-${preset.level}-highscore-user`, inputRef.current?.value ?? '');
					setHighscoreOpen(false);
					setLeaderboardOpen(true);
				}}>OK</button>
			</div>
		</Window>

		<Window title="Best Times" id="winmine-leaderboard" isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)}
		        width={331} height={179} x={-1} y={-1}>
			<div className={leaderboardContent}>
				<MenuBarGroup className={leaderboardPanel}>
					{Object.values(presets).map(p => (<Fragment key={p.level}>
						<div>{p.level[0].toUpperCase()}{p.level.slice(1)}</div>
						<div>{localStorage.getItem(`minesweeper-${p.level}-highscore`) ?? 999} seconds</div>
						<div>{localStorage.getItem(`minesweeper-${p.level}-highscore-user`) ?? 'Anonymous'}</div>
					</Fragment>))}

					<div className={leaderboardLabel}>Fastest Mine Sweepers</div>
				</MenuBarGroup>
				<div className={leaderboardButtonContainer}>
					<button onClick={() => {
						Object.values(presets).forEach(p => {
							localStorage.removeItem(`minesweeper-${p.level}-highscore`);
							localStorage.removeItem(`minesweeper-${p.level}-highscore-user`);
						});
						setUpdate(u => u + 1);
					}}>Reset Scores</button>
					<button onClick={() => setLeaderboardOpen(false)}>OK</button>
				</div>
			</div>
		</Window>

		<Window title="Custom Field" id="winmine-custom" isOpen={customOpen} onClose={() => setCustomOpen(false)}
		        width={237} height={136} x={-1} y={-1}>
			<div className={customFieldContainer}>
				<div className={customFieldInputs}>
					<div>Height:</div>
					<input type="text" inputMode="numeric" defaultValue="8" ref={heightRef} />
					<div>Width:</div>
					<input type="text" inputMode="numeric" defaultValue="8" ref={widthRef} />
					<div>Mines:</div>
					<input type="text" inputMode="numeric" defaultValue="10" ref={minesRef} />
				</div>
				<div className={customFieldButtons}>
					<button onClick={() => {
						let width = +(widthRef.current?.value ?? 0);
						let height = +(heightRef.current?.value ?? 0);
						let mineCount = +(minesRef.current?.value ?? 0);

						if (!Number.isInteger(width)) width = 0;
						if (!Number.isInteger(height)) height = 0;
						if (!Number.isInteger(mineCount)) mineCount = 0;

						width = Math.min(Math.max(width, 8), 30);
						height = Math.min(Math.max(height, 8), 24);
						mineCount = Math.min(Math.max(mineCount, 10), (width - 1) * (height - 1));

						setPreset({
							width,
							height,
							mineCount,
							level: 'custom'
						});
						reset();
						setCustomOpen(false);
					}}><span>OK</span></button>
					<button onClick={() => setCustomOpen(false)}>Cancel</button>
				</div>
			</div>
		</Window>

		<Window icon={minesweeperSmall} title="Minesweeper" id="winmine" isOpen={isOpen} onClose={() => setOpen(false)} x={-1} y={-1}>
			<DropdownButton items={[{
				name: 'New',
				onClick: reset
			}, '|', ...Object.values(presets).map(p => ({
				name: p.level[0].toUpperCase() + p.level.slice(1),
				onClick: () => {
					setPreset(p);
					reset();
				},
				icon: preset.level === p.level ? <Check /> : undefined
			})), {
				name: 'Custom...',
				onClick: () => setCustomOpen(true),
				icon: preset.level === 'custom' ? <Check /> : undefined
			}, '|', {
				name: 'Marks (?)',
				icon: enableMarks ? <Check /> : undefined,
				onClick: () => setEnableMarks(m => !m)
			}, '|', {
				name: 'Best Times...',
				onClick: () => setLeaderboardOpen(true)
			}]} className={dropdown}>
				Game
			</DropdownButton>

 			<div className={content} onMouseDown={e => (e.buttons & 5) && setMouseDown(true)}>
				<div className={topContainer}>
					<MineCounter value={preset.mineCount - flags.size} />
					<div className={cn(faceButton,
						gameState === 'dead' && faceButtonDead,
						gameState === 'won' && faceButtonWon,
						mouseDown && faceButtonSurprised
					)} onClick={reset} />
					<MineCounter value={elapsed} />
				</div>
			  <div className={field} style={{
					gridTemplateRows: `repeat(${preset.height}, 16px)`,
				  gridTemplateColumns: `repeat(${preset.width}, 16px)`,
			  }}>
				  {[...new Array(preset.height)]
					  .flatMap((_, y) => [...new Array(preset.width)]
						  .map((_, x) => {
								const key = `${x},${y}`;

								const isFlag = flags.has(key);
								let position = -1;
								const cellRevealed = revealed[key];

								if (cellRevealed !== undefined && cellRevealed !== 0) {
									position = (Math.min(cellRevealed, 10) - 1) * 15;
								} else if (isFlag) {
								  position = 165;
							  } else if (marks.has(key)) {
									position = 150;
								}

							  const activate = cellActivate.bind(null, x, y);
								const deactivate = cellDeactivate.bind(null, x, y);

								return (<div key={key} className={cn((active.has(key) || cellRevealed !== undefined) && buttonActive,
									isFlag && cellRevealed !== REVEALED_INCORRECT && buttonNoActive,
									!isFlag && cellRevealed === REVEALED_MINE_RED && cellRed)}
								             onContextMenu={e => e.preventDefault()}
								             onMouseDown={activate}
								             onMouseEnter={activate}
								             onMouseLeave={deactivate}
								             onMouseUp={deactivate}>
									{position >= 0 && <div className={fieldButtonContents} style={{ backgroundPositionX: `-${position}px` }} />}
					      </div>)
							}))}
			  </div>
		  </div>
		</Window>
	</Program>);
};
