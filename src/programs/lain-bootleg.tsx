import { LainBootleg, LainWindowCloseEvent, LainWindowOpenEvent } from 'lain-bootleg-bootleg-bootleg';
import lainMov from 'lain-bootleg-bootleg-bootleg/lain_mov.webm?url';
import lainData from 'lain-bootleg-bootleg-bootleg/lain-bootleg-bootleg.data?url';
import lainWasm from 'lain-bootleg-bootleg-bootleg/lain-bootleg-bootleg.wasm?url';
import lainSmall from '@images/lain-small.webp';
import { Program } from '../components/program.tsx';
import { Window } from '../components/window.tsx';
import { useEffect, useState } from 'preact/hooks';

const Bootleg = () => {
	const [mainTitle, setMainTitle] = useState<string | null>(null);
	const [minigameTitle, setMinigameTitle] = useState<string | null>(null);

	useEffect(() => {
		const onOpen = (e: LainWindowOpenEvent) => {
			console.log(e);
			(e.detail.isMain ? setMainTitle : setMinigameTitle)(e.detail.title);
		};

		const onClose = (e: LainWindowCloseEvent) => {
			(e.detail.isMain ? setMainTitle : setMinigameTitle)(null);
		}

		LainBootleg.addEventListener('windowOpen', onOpen);
		LainBootleg.addEventListener('windowClose', onClose);

		return () => {
			LainBootleg.removeEventListener('windowOpen', onOpen);
			LainBootleg.removeEventListener('windowClose', onClose);
		};
	}, []);

	return (<Program name="lain_win.exe" onOpen={() => {
		setTimeout(() => LainBootleg.start(), 0);
	}}>
		<Window title={mainTitle ?? ''} id="lain-main" isOpen={mainTitle !== null} windowingStrategy="display"
		        x={5} y={5} icon={lainSmall}
		        onClose={() => {
				LainBootleg.closeMainWindow();
			}}>
			<canvas id="lain-main" />
		</Window>

		<Window title={minigameTitle ?? ''} id="lain-minigame" isOpen={minigameTitle !== null} windowingStrategy="display"
		        x={-1} y={-1} width={600} height={421} icon={lainSmall}
		        onClose={() => {
			        LainBootleg.closeMinigameWindow();
		        }}>
			<canvas id="lain-minigame" />
		</Window>
	</Program>);
};

export const load = async () => {
	await LainBootleg.init({
		wasmPath: lainWasm,
		dataPath: lainData,
		moviePath: lainMov,
		mainWindow: '#lain-main',
		minigameWindow: '#lain-minigame'
	});

	return (<Bootleg />);
};
