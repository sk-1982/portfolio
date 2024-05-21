import { Program, usePrograms } from '../components/program.tsx';
import { useCallback, useRef, useState } from 'preact/hooks';
import { Window } from '../components/window.tsx';
import { css } from '@linaria/core';

import runLarge from '@images/run-large.webp';
import { ErrorWindow } from '../components/error-window.tsx';
import { DESKTOP_ICONS, IE_LOCAL_PAGES, NOTEPAD_FILES } from '../config.tsx';

const container = css`
	padding: 19px 13px 14px 19px;
	display: flex;
	flex-direction: column;
	height: 100%;
`;

const header = css`
	display: flex;
	gap: 12px;
	span {
		line-height: 1.5;
		margin-top: -2px;
  }
	img {
		display: block;
	}
`

const openContainer = css`
	margin-top: 12px;
	display: flex;
	align-items: center;
	gap: 15px;
	input {
		flex-grow: 1;
	}
`;

const buttons = css`
	margin: auto 0 0 auto;
	gap: 6px;
	display: flex;
	button:first-child span {
		padding-left: .85px;
	}
`;

export const Run = () => {
	const [isOpen, setOpen] = useState(false);
	const [errorTitle, setErrorTitle] = useState('');
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const programs = usePrograms();

	const submit = () => {
		if (!inputRef.current) return;
		const val = inputRef.current.value.trim();

		const parts = val.match(/"([^"]+)"|\S+/g)?.map(x => x.replace(/^"(.+)"$/, '$1')) ?? [];

		let program = parts[0].toLowerCase();
		if (/^[a-z]:/i.test(program)) {
			if (program.startsWith('c:\\windows\\desktop\\')) {
				const file = program.replace('c:\\windows\\desktop\\', '');
				const desktopIcon = DESKTOP_ICONS.find(i => i.name.toLowerCase() === file);
				if (desktopIcon) {
					if (desktopIcon.launch)
						programs.openProgram(desktopIcon.launch[0], ...desktopIcon.launch.slice(1));
					desktopIcon.onOpen?.();
					return setOpen(false);
				}
			}
		} else {
			if (programs.openProgram(program.endsWith('.exe') ? program : `${program}.exe`, ...parts.slice(1)))
				return setOpen(false);
		}

		setErrorTitle(program);
	};

	return (<Program name="run" onOpen={useCallback(() => setOpen(true), [])}>
		<Window id="run" title="Run" x={8} y={window.innerHeight - 40 - 163} width={347} height={163} isOpen={isOpen} onClose={() => setOpen(false)}>
			<div className={container}>
				<div className={header}>
					<img src={runLarge} alt="" />
					<span>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</span>
				</div>
				<div className={openContainer}>
					Open:
					<input ref={inputRef} type="text" onKeyDown={e => {
						if (e.key === 'Enter') submit()
					}} onInput={e => setSubmitDisabled(!(e.target as HTMLInputElement).value.trim())} />
				</div>
				<div className={buttons}>
					<button onClick={submit} disabled={submitDisabled}><span>OK</span></button>
					<button onClick={() => setOpen(false)}><span>Cancel</span></button>
				</div>
			</div>
		</Window>

		<ErrorWindow title={errorTitle} id="run-error" onClose={() => setErrorTitle('')} width={720}
		             error={errorTitle && `Cannot find the file '${errorTitle}' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.`} />
	</Program>)
};
