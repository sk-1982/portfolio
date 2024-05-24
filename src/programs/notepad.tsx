import fixedSysExcelsior from '../assets/fonts/FSEX302.woff2';
import { Program } from '../components/program.tsx';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useWindows, Window } from '../components/window.tsx';
import { css } from '@linaria/core';
import cn from 'clsx/lite';
import { MenuBar } from '../components/menu-bar.tsx';
import { DropdownButton } from '../components/dropdown.tsx';
import { Check } from '../components/check.tsx';
import { NOTEPAD_FILES } from '../config.tsx';
import notepad from '@images/notepad.webp';
import win98 from '@98.css';

const cornerClass = css`
	border: solid #fff;
	border-width: 0 1px 1px 0;
`;

const container = css`
  width: 100%;
	height: 100%;
	overflow: hidden;
`;

const notepadText = css`
	@font-face {
		font-family: "Fixedsys";
		src: url(${fixedSysExcelsior}) format("woff2");
		font-weight: normal;
  }
	font-family: "Fixedsys", monospace;
	font-size: 16px;
	resize: none;
	width: 100%;
	height: 100%;
	margin: 0;
	line-height: 1;
	padding: 0 2px;
	box-shadow: none;
	overflow: hidden scroll;
`;

const notepadNoWordWrap = css`
	overflow-x: scroll;
	text-wrap: nowrap;
`;

const cornerBg = css`
	position: absolute;
	right: 3px;
	bottom: 3px;
	background: #c0c0c0;
	width: 17px;
	height: 18px;
	border: solid #fff;
	border-width: 0 1px 1px 0;
`;

const dropdown = css`min-height: 18px; height: 18px;`

export const Notepad = () => {
	const [isOpen, setOpen] = useState(false);
	const [wordWrap, setWordWrap] = useState(false);
	const textRef = useRef<HTMLTextAreaElement | null>(null);
	const [title, setTitle] = useState('Untitled');
	const windows = useWindows();

	const close = useCallback(() => {
		if (textRef.current)
			textRef.current.value = '';
		setOpen(false);
	}, []);

	return (<Program name="notepad.exe" onOpen={useCallback(file => {
		windows.setActiveWindow("notepad.exe");
		setOpen(true);

		if (!file && !isOpen) {
			setTitle('Untitled');
			return;
		}

		const contents = NOTEPAD_FILES.get(file.toLowerCase());
		setTitle(file.split(/[\\\/]/g).at(-1)!);
		setTimeout(() => {
			if (textRef.current)
				textRef.current.value = contents ?? '';
		}, 0);
	}, [isOpen, windows])}>
		<Window title={`${title} - Notepad`} id="notepad.exe" isOpen={isOpen} onClose={close} icon={notepad}
		        minWidth={100} minHeight={100} x={100} y={100} width={400} height={300} resizable cornerHandle={!wordWrap} cornerClass={cornerClass}>
			<MenuBar>
				<DropdownButton items={[{
					name: 'New',
					onClick: () => {
						setTitle('Untitled');
						if (textRef.current)
							textRef.current.value = '';
					}
				}, '|', {
					name: 'Exit',
					onClick: close
				}]} className={dropdown}>
					File
				</DropdownButton>
				<DropdownButton items={[{
					name: 'Select All',
					onClick: () => textRef.current?.select()
				}, {
					name: 'Time/Date',
					onClick: () => {
						const e = textRef.current;
						if (!e) return;
						const now = new Date();

						const start = e.selectionStart;
						const time = `${now.toLocaleTimeString(undefined, { timeStyle: 'short' })} ${now.toLocaleDateString(undefined, { dateStyle: 'short' })}`;
						e.value = e.value.slice(0, start) +
							time +
							e.value.slice(e.selectionEnd);
						e.selectionStart = start + time.length;
						e.selectionEnd = start + time.length;
					}
				}, '|', {
					name: 'Word Wrap',
					icon: wordWrap ? <Check /> : undefined,
					onClick: () => setWordWrap(w => !w)
				}]} className={dropdown}>
					Edit
				</DropdownButton>

			</MenuBar>
			<div className={cn(container, win98.sunkenPanel)}>
				<textarea className={cn(notepadText, !wordWrap && notepadNoWordWrap)} onKeyDown={e => {
					if (e.key === 'Enter' && !e.ctrlKey && !e.altKey)
						(e.target as HTMLTextAreaElement).scrollLeft = 0;
				}} ref={textRef} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}/>
			</div>
			{!wordWrap && <div className={cornerBg}/>}
		</Window>
	</Program>)
};
