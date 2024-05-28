import { Screensaver } from '../../components/screensaver.tsx';
import { useRef } from 'preact/hooks';
import { init, stop } from './maze.js';

export const Maze = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	return (<Screensaver name="3d maze.scr" onOpen={() => init(canvasRef.current!)} onClose={stop}>
		<canvas ref={canvasRef} />
	</Screensaver>)
};
