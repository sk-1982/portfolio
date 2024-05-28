import Module, { DoomModule } from 'doom';
import doomWasm from '../../submodules/wasmDOOM/public/wasm/wasm-doom.wasm?url';
import doomData from '../../submodules/wasmDOOM/public/wasm/wasm-doom.data?url';
import { Program } from '../components/program.tsx';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Window } from '../components/window.tsx';

import doomSmall from '@images/doom-small.webp';

let doom: DoomModule;

const Doom = () => {
	const [isOpen, setOpen] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const initialRun = useRef(true);

	useEffect(() => {

		doom.canvas = canvasRef.current!;
		doom.onQuit = () => {
			setOpen(false);
			document.exitPointerLock?.()
		}
	}, []);

	useEffect(() => {
		if (initialRun.current) {
			if (isOpen) {
				initialRun.current = false;
				doom.callMain(['-iwad', '/doom.wad']);
			}
		} else if (isOpen) {
			doom._resume_main_loop();
			doom._end_game();
			doom._unmute();
			doom._unpause_game();
		} else {
			doom._mute();
			doom._pause_game();
			doom._pause_main_loop();
		}
	}, [isOpen])

	return (<Program name="doom.exe" onOpen={useCallback(() => setOpen(true), [])}>
		<Window title="Doom" id="doom.exe" isOpen={isOpen} onClose={() => setOpen(false)} windowingStrategy="display" stopKeys={false} x={-1} y={-1} icon={doomSmall}>
			<canvas ref={canvasRef} onClick={() => canvasRef.current?.requestPointerLock?.()} />
		</Window>
	</Program>);
};

export const load = async () => {
	doom = await Module({
		locateFile: (path, prefix) => {
			if (path.endsWith('.wasm')) return doomWasm;
			if (path.endsWith('.data')) return doomData;

			return prefix + path;
		}
	});

	return (<Doom />);
};
