declare module 'doom' {
	export type DoomModule = {
		callMain: (args: string[]) => void,
		_pause_game: () => void,
		_unpause_game: () => void,
		_mute: () => void,
		_unmute: () => void,
		_end_game: () => void,
		_pause_main_loop: () => void,
		_resume_main_loop: () => void,
		onQuit: () => void,
		canvas: HTMLCanvasElement,
		locateFile: (path: string, prefix: string) => string,
	};

	export default function Module(options?: Partial<DoomModule>): Promise<DoomModule>;
}
