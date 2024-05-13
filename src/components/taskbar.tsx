import win98 from '@98.css';
import startFlag from '@images/start-flag.webp';
import { Separator } from './separator';
import { useEffect, useRef, useState } from 'preact/hooks';
import { ResizableSeparator } from './resizable-separator';
import { StartMenu } from './start-menu.tsx';
import { css } from '@linaria/core';
import { ContextWindow, useWindows } from './window.tsx';
import { selected, taskbarZIndex } from '@/css';
import cn from 'clsx/lite';
import { useHoverCloser } from '../hooks/use-hover-closer.ts';

const taskbar = css`
	height: 29px;
	width: 100%;
	box-sizing: border-box;
	border-top: 1px solid #c2c6ca;
	background: #c2c6ca;
	z-index: ${taskbarZIndex};
	position: fixed;
	bottom: 0;
	left: 0;
	
	& > div {
	  border-top: 1px solid #fff;
	  padding: 2px;
	  display: flex;
	  height: 100%;
	  box-sizing: border-box;
	}
`;

const startButton = css`
	font-weight: bold;
	min-width: 0 !important;
	padding: 0 4px;
	display: flex;
	align-items: center;
	
	> img {
		margin-right: 3px;
		margin-left: 1px;
	}
`;

const startMenu = css`
	transition: 0s;
	transform: translateY(100%);
`;

const startMenuOpen = css`
	transition: .1s linear;
	transform: translateY(0);
`;

const startMenuContainer = css`
	position: fixed;
	bottom: 24px;
	left: 4px;
	z-index: ${taskbarZIndex + 10};
	clip-path: rect(-10000px 10000px 100% 0px);
`;

const icons = css`
	flex-grow: 0;
	display: flex;
	align-items: center;
	padding: 0 10px;
`;

const programs = css`
	flex-grow: 1;
	display: grid;
	grid-template-rows: 1fr;
	grid-auto-columns: minmax(0, 160px);
	grid-auto-flow: column;
	gap: 0 3px;
`;

const taskbarItem = css`
  display: flex;
  align-items: center;
  padding: 0 4px;
  outline: none !important;
	
	> span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
	}
		
	> div {
		width: 16px;
		display: grid;
		align-items: center;
		margin-right: 3px;
	}
		
	&.${selected} {
    background: repeating-conic-gradient(silver 0% 25%, #fff 0% 50%) 0 / 2px 2px;
    font-weight: bold;
	}
`;

const currentTime = () => new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const TaskbarItem = ({ win }: { win: ContextWindow }) => {
	const windows = useWindows();
	const ref = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		const resizeListener = () => {
			const rect = ref.current?.getBoundingClientRect();
			if (!rect) return;
			win.setTaskbarX(rect.left);
			win.setTaskbarWidth(rect.width);
		};

		resizeListener();
		window.addEventListener('resize', resizeListener);
		return () => window.removeEventListener('resize', resizeListener);
	}, [ref, win]);

	return (<button className={cn(taskbarItem, windows.activeWindow === win.id && `${win98.active} ${selected}`)} ref={ref}
	                onClick={() => {
										if (windows.activeWindow === win.id && !win.minimized) {
											win.setMinimized(true);
											return;
										}
										windows.setActiveWindow(win.id);
										if (win.minimized) win.setMinimized(false);
									}}>
		{win.icon && <div><img src={win.icon} alt="" /></div>}
		<span>{ win.title }</span>
	</button>);
};

export const Taskbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [time, setTime] = useState(currentTime());
	const interval = useRef<ReturnType<typeof setInterval> | null>(null);
	const windows = useWindows();

	useEffect(() => {
		interval.current = setInterval(() => {
			setTime(currentTime());
		}, 1000);

		return () => {
			if (interval.current)
				clearInterval(interval.current);
		};
	}, []);

	useHoverCloser({
		continueIf: e => e.classList.contains(startButton) || e.classList.contains(startMenuContainer),
		onClose: () => setIsOpen(false),
		hoverTrigger: false
	});

	return (<>
		<div className={startMenuContainer}>
			<StartMenu className={isOpen ? startMenuOpen : startMenu} onClose={() => setIsOpen(false)} />
		</div>

		<div className={taskbar}>
			<div>
				<button className={cn(startButton, isOpen && win98.active)} onClick={() => setIsOpen(o => !o)}>
					<img src={startFlag} alt="" />
					Start
				</button>

				<ResizableSeparator />

				<div className={programs}>
					{windows.windows.map(win => (<TaskbarItem win={win} />))}
				</div>

				<Separator/>

				<div className={`${win98.statusBarField} ${icons}`}>
					{time}
				</div>

			</div>
		</div>
	</>);
};
