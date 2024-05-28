declare module 'pinball' {
	declare const charPtr: unique symbol;
	type CharPtr = typeof charPtr;

	export type PinballModule = {
		stringToNewUTF8: (s: string) => CharPtr,
		_main: () => void,
		_high_score_entered: (name: CharPtr) => void,
		_toggle_pause: () => void,
		_new_game: () => void,
		_launch_ball: () => void,
		_demo: () => void,
		_set_players: (players: number) => void,
		_set_music: (music: boolean) => void,
		_set_sound: (sound: boolean) => void,
		_pause_game: () => void,
		_resume_game: () => void,
		_show_highscores: () => void,
		_reset_high_scores: () => void,
		_pause_main_loop: () => void,
		_resume_main_loop: () => void,
		locateFile: (path: string, prefix: string) => string,
		canvas: HTMLCanvasElement,
		showHighScoreDialog: () => void,
		showNewHighScoreDialog: (score: number, pos: number) => void,
	};

	export default function Module(options?: Partial<PinballModule>): Promise<PinballModule>;
}
