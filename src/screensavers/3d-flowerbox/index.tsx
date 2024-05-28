import { Screensaver } from '../../components/screensaver.tsx';
import { useRef } from 'preact/hooks';
import { init, stop } from './flowerbox.js';

export const Flowerbox = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	return (<Screensaver name="3d flower box.scr" onOpen={() => init(canvasRef.current!)} onClose={stop}>
		<canvas ref={canvasRef} />
	</Screensaver>)
};
