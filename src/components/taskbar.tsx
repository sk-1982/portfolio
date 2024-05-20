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
import { Tooltip } from './tooltip.tsx';
import { ContextMenu } from './context-menu.tsx';
import { Restore } from './restore.tsx';
import { Minimize } from './minimize.tsx';
import { Maximize } from './maximize.tsx';
import { Close } from './close.tsx';
import { SmallButton } from './small-button.tsx';
import iexploreSmall from '@images/iexplore-small.webp';
import { usePrograms } from './program.tsx';

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
	min-width: 0 !important;
  padding: 0 4px;
		
	> div {
    display: flex;
    align-items: center;
	}
	
	img {
		margin-right: 3px;
		margin-left: 1px;
	}
`;

const startMenu = css`
	transition: 0s;
	transform: translateY(100%);
`;


const startMenuContainer = css`
	position: fixed;
	bottom: 24px;
	left: 4px;
	z-index: ${taskbarZIndex + 10};
	clip-path: inset(0);
	pointer-events: none;
`;

const startMenuContainerOpen = css`
	animation: clip .1s steps(2, end) 1 forwards;
	pointer-events: auto;
	.${startMenu} {
    transition: .1s linear;
    transform: translateY(0);
	}
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
		line-height: 2;
	}
		
	> div {
		width: 16px;
		display: grid;
		align-items: center;
		margin-right: 3px;
	}
		
	&.${selected} {
    background: repeating-conic-gradient(silver 0% 25%, #fff 0% 50%) 0 / 2px 2px;
	}
`;

const taskbarIconButton = css`
	height: 100%;
	aspect-ratio: 1/1;
	margin-right: 4px;
	&, & div {
		display: flex;
		align-items: center;
		justify-content: center;
		img {
			margin: 0 1px 1px 0;
		}
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

	return (<ContextMenu items={[{
			name: 'Restore',
			icon: (<Restore />),
			onClick: () => {
				if (win.minimized) return win.setMinimized(false);
				win.setMaximized(false)
			},
			disabled: !win.minimized && (!win.resizable || !win.maximized)
		}, {
			name: 'Minimize',
			icon: (<Minimize />),
			onClick: () => win.setMinimized(true),
			disabled: win.minimized
		}, {
			name: 'Maximize',
			icon: (<Maximize />),
			onClick: () => win.setMaximized(true),
			disabled: !win.resizable || win.maximized
		}, '|', {
			name: 'Close',
			bold: true,
			icon: (<Close />),
			onClick: () => win.onClose?.()
		}]}>
		<Tooltip content={win.title} overflowOnly>
			<button className={cn(taskbarItem, windows.activeWindow === win.id && `${win98.active} ${selected} ${win98.bold}`)}
			                ref={ref}
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
			</button>
		</Tooltip>
	</ContextMenu>);
};

export const Taskbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [time, setTime] = useState(currentTime());
	const interval = useRef<ReturnType<typeof setInterval> | null>(null);
	const windows = useWindows();
	const program = usePrograms();

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
		<div className={cn(startMenuContainer, isOpen && startMenuContainerOpen)}>
			<StartMenu className={startMenu} onClose={() => setIsOpen(false)} />
		</div>

		<div className={taskbar} onMouseDown={e => {
			let elem = e.target as HTMLElement | null;
			if (!elem) return;

			while (elem) {
				if (elem.classList.contains(taskbarItem))
					return;
				elem = elem.parentElement;
			}

			windows.setActiveWindow(null);
		}}>
			<div>
				<Tooltip content="Click here to begin." disabled={isOpen}>
					<button className={cn(startButton, isOpen && win98.active, win98.bold)}
					        onClick={() => setIsOpen(o => !o)}>
						<div>
							<img src={startFlag} alt=""/>
							Start
						</div>
					</button>
				</Tooltip>

				<ResizableSeparator />

				<Tooltip content="Launch Internet Explorer Browser">
					<div>
						<SmallButton padding={0} className={taskbarIconButton} onClick={() => program.openProgram('iexplore.exe')}>
							<img src={iexploreSmall} alt="" />
						</SmallButton>
					</div>
				</Tooltip>

				<ResizableSeparator />

				<div className={programs}>
					{windows.windows.map(win => (<TaskbarItem win={win}/>))}
				</div>

				<Separator/>

				<div className={`${win98.statusBarField} ${icons}`}>
					{time}
				</div>

			</div>
		</div>
	</>);
};
