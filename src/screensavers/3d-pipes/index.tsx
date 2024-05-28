import { Screensaver } from '../../components/screensaver.tsx';
import { useRef } from 'preact/hooks';
import { init } from './pipes.js';
import { css } from '@linaria/core';

const canvas = css`
	position: absolute;
	inset: 0;
`

export const Pipes = () => {
	const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
	const canvasGlRef = useRef<HTMLCanvasElement | null>(null);
	const cleanup = useRef<(() => void) | null>(null);

	return (<Screensaver name="3d pipes.scr" onOpen={() => {
		cleanup.current = init(canvas2dRef.current!, canvasGlRef.current!);
	}} onClose={() => {
		cleanup.current?.();
		cleanup.current = null;
	}}>
		<div>
			<canvas className={canvas} ref={canvasGlRef}/>
			<canvas className={canvas} ref={canvas2dRef}/>
		</div>
	</Screensaver>)
};
