import Module, { PinballModule } from 'pinball';
import pinballWasm from '../../submodules/SpaceCadetPinball/bin/SpaceCadetPinball.wasm?url';
import pinballData from '../../submodules/SpaceCadetPinball/bin/SpaceCadetPinball.data?url';
import pinballSmall from '@images/pinball-small.webp';
import pinballSplash from '@images/pinball-splash.webp';

import { Program } from '../components/program.tsx';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Window } from '../components/window.tsx';
import { MenuBar } from '../components/menu-bar.tsx';
import { DropdownButton } from '../components/dropdown.tsx';
import { css } from '@linaria/core';
import { Check } from '../components/check.tsx';
import { useChange } from '../hooks/use-change.ts';
import { Fragment } from 'preact';
import { taskbarZIndex } from '@/css';

let pinball: PinballModule;

const button = css`min-height: 18px !important; height: 18px !important;`

const canvas = css`
	height: 420px !important;
	width: 606px !important;
`;

const scoreContainer = css`
	padding: 13px 55px 30px 22px;
	display: grid;
	gap: 4px 29px;
	grid-template-rows: 26px repeat(5, 22px);
	grid-template-columns: 25px 297px 56px;
	> * {
		align-self: center;
	}
`;

const scoreRank = css`
	justify-self: center;
	padding-left: 0.85px;
`;

const scoreHeader = css`align-self: start`;

const scoreValue = css`justify-self: end`;

const buttonContainer = css`
	display: flex;
	gap: 6px;
	padding-right: 10px;
	justify-content: end;
`;

const labelPadding = css`padding-left: 0.85px`;

const confirmContent = css`
	padding: 13px;
	display: flex;
	flex-direction: column;
	height: 100%;
	> div {
			margin-top: auto;
			display: flex;
			gap: 6px;
			justify-content: center;
	}
`;

const parseScore = (s: string | null | undefined) => {
	if (s === '-999') return '';
	return s;
}

const Pinball = () => {
	const [isOpen, setOpen] = useState(false);
	const initialRun = useRef(true);
	const ref = useRef<HTMLCanvasElement | null>(null);
	const [players, setPlayers] = useState(1);
	const [sound, setSound] = useState(true);
	const [music, setMusic] = useState(false);
	const [confirm, setConfirm] = useState(false);
	const [highscore, setHighscore] = useState<boolean | { pos: number, score: number }>(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		pinball.showHighScoreDialog = () => setHighscore(true)
		pinball.showNewHighScoreDialog = (score, pos) => setHighscore({ score, pos });
		pinball.canvas = ref.current!;
	}, []);

	useEffect(() => {
		if (initialRun.current) {
			if (isOpen) {
				initialRun.current = false;
				pinball._main();
			}
		} else if (isOpen) {
			pinball._resume_game();
			pinball._new_game();
		} else {
			pinball._pause_game();
		}

	}, [isOpen]);

	useChange(sound, () => {
		pinball._set_sound(sound);
	});

	useChange(music, () => {
		pinball._set_music(music);
	});

	useChange(players, () => {
		pinball._set_players(players);
	});

	return (<Program name="pinball.exe" onOpen={useCallback(() => setOpen(true), [])}>
		<Window title="Confirm" id="pinball-confirm" isOpen={confirm} onClose={() => setConfirm(false)} x={-1} y={-1} width={185} height={100}>
			<div className={confirmContent}>
				Clear High Scores?
				<div>
					<button onClick={() => {
						setConfirm(false);
						setHighscore(false);
						pinball._reset_high_scores();
					}}><span>OK</span></button>
					<button onClick={() => setConfirm(false)}><span className={labelPadding}>Cancel</span></button>
				</div>
			</div>
		</Window>

		<Window title="High Scores" id="pinball-highscore" isOpen={!!highscore} onClose={() => setHighscore(false)} x={-1} y={-1} width={517} height={254}>
			<div className={scoreContainer}>
				<span className={scoreHeader}>Rank</span>
				<span className={scoreHeader}>Name</span>
				<span className={scoreHeader}>Score</span>

				{[...new Array(5)].map((_, i) => {
					const isHighscore = typeof highscore === 'object' && highscore.pos === i;

					return (<Fragment key={i}>
						<span className={scoreRank}>{i + 1}</span>
						{isHighscore ? <input defaultValue="Player" type="text" ref={inputRef} /> : <span>{localStorage.getItem(`pinball_${i}.Name`)}</span>}
						<span className={scoreValue}>
							{isHighscore ? highscore.score : parseScore(localStorage.getItem(`pinball_${i}.Score`))}
						</span>
					</Fragment>)
				})}
			</div>
			<div className={buttonContainer}>
				<button onClick={() => {
					if (typeof highscore === 'object' && inputRef.current) {
						const val = inputRef.current.value;
						pinball._high_score_entered(pinball.stringToNewUTF8(val));
					}
					setHighscore(false);
				}}>
					<span className={labelPadding}>OK</span>
				</button>
				<button onClick={() => setHighscore(false)}><span>Cancel</span></button>
				<button onClick={() => setConfirm(true)}><span className={labelPadding}>Clear</span></button>
			</div>
		</Window>

		<Window stopKeys={false}
		        icon={pinballSmall}
		        title="3D Pinball for Windows - Space Cadet"
		        id="pinball.exe"
		        isOpen={isOpen}
		        onClose={() => setOpen(false)} windowingStrategy="display" x={-1} y={-1}>
			<MenuBar>
				<DropdownButton className={button} padding={6} items={[{
					name: 'New Game',
					shortcut: 'F2',
					onClick: () => pinball._new_game()
				}, {
					name: 'Launch Ball',
					onClick: () => pinball._launch_ball()
				}, {
					name: 'Pause/Resume Game',
					shortcut: 'F3',
					onClick: () => pinball._toggle_pause()
				}, '|', {
					name: 'High Scores',
					onClick: () => pinball._show_highscores()
				}, {
					name: 'Demo',
					onClick: () => pinball._demo()
				}]}>Game</DropdownButton>
				<DropdownButton className={button} padding={6} items={[{
					name: 'Select Players',
					children: [...new Array(4)].map((_, i) => ({
						name: `${i + 1}\u2002Player${i ? 's' : ''}`,
						icon: players === i + 1 ? (<Check />) : undefined,
						onClick: () => setPlayers(i + 1)
					})),
				}, '|', {
					name: 'Sounds',
					icon: sound ? (<Check />) : undefined,
					onClick: () => setSound(s => !s)
				}, {
					name: 'Music',
					icon: music ? (<Check />) : undefined,
					onClick: () => setMusic(m => !m)
				}]}>Options</DropdownButton>
			</MenuBar>
			<canvas className={canvas} ref={ref} id="pinball" />
		</Window>
	</Program>)
};

const loadingElement = css`
	position: fixed;
	inset: 0;
	background: #000;
	z-index: ${taskbarZIndex - 1};
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const load = async () => {
	let loaded = false;
	let url: string = '';
	let elem: HTMLElement | null = null;

	fetch(pinballSplash).then(async res => {
		const blob = await res.blob();
		if (loaded) return;
		url = URL.createObjectURL(blob);
		elem = document.createElement('div');
		elem.className = loadingElement;
		const img = document.createElement('img');
		img.src = url;
		elem.appendChild(img);
		document.body.appendChild(elem);
	})

	pinball = await Module({
		locateFile: (path, prefix) => {
			if (path.endsWith('.wasm')) return pinballWasm;
			if (path.endsWith('.data')) return pinballData;

			return prefix + path;
		},
	});
	loaded = true;
	if (url) {
		elem!.remove();
		URL.revokeObjectURL(url);
	}
	return (<Pinball />);
};
