import { ComponentChildren, createContext } from 'preact';
import {
	MutableRef, StateUpdater,
	useCallback,
	useContext,
	useEffect,
	useMemo, useReducer,
	useRef,
	useState
} from 'preact/hooks';
import { css } from '@linaria/core';
import cn from 'clsx/lite';
import win98 from '@98.css';
import './window.scss';

const controls = css``;

const windowClass = css`
	--minimize: none;
	--maximize: none;
	--restore: none;
	--unmaximize: none;
	--hide-1: none;
	--hide-2: none;
	--hide-3: none;
		
	transform: translate(var(--x), var(--y));
	position: fixed;
	top: 0;
	left: 0;
	animation: var(--minimize), var(--maximize), var(--restore), var(--unmaximize);
  transition-property: top, right, left, bottom, width;
  transition: .25s steps(10);
	
	.${controls} {
		animation-name: var(--hide-1), var(--hide-2), var(--hide-3);
		animation-duration: .25s;
		animation-iteration-count: 1;
		animation-timing-function: steps(2, start);
	}
`;

const windowMinimize = css`
	--minimize: minimize .25s 1 both steps(10);
	--hide-1: hide-1;
`;

const windowRestore = css`
	--restore: restore .25s 1 steps(10);
  --hide-2: hide-2;
`;

const windowUnmaximize = css`
  --unmaximize: unmaximize .25s 1 steps(2, start);
  --hide-3: hide-3;
`;

const windowMaximize = css`
	bottom: -3px;
	height: auto !important;
	width: 100% !important;
	transition-property: top, right, left, bottom, width;
	transition: .25s steps(10);
  --maximize: maximize .25s 1 steps(2, start);
	--unmaximize: none;
	--hide-3: hide-4;
`;

const windowHidden = css`
	display: none;
`;

const titleIcon = css`
	margin-left: 18px;
`;

const titleBar = css`
	position: relative;
`;

const titleBarIcon = css`
	position: absolute;
	left: 2px;
	top: 0;
	height: 100%;
	display: grid;
	align-items: center;
	width: 16px;
`;

const titleBarText = css`
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

type Window = {
	title: string,
	icon?: string,
	width: number,
	height: number,
	resizable?: boolean,
	minWidth?: number,
	minHeight?: number,
	x: number,
	y: number,
	id: string,
	maximized: boolean,
	minimized: boolean
};

type MinimizedRestoreState = { minimized: boolean, restoreState: string | null };

export type ContextWindow = Pick<Window, 'title' | 'icon' | 'width' | 'height' | 'x' | 'y' | 'id' | 'maximized' | 'minimized'> & {
	setMaximized: (val: boolean) => void,
	setMinimized: (val: boolean) => void,
	setTaskbarX: (x: number) => void,
	setTaskbarWidth: (width: number) => void,
	ref: MutableRef<HTMLElement | null>
};

const WindowContext = createContext<{
	createWindow: (window: ContextWindow) => void,
	updateWindow: (window: Partial<ContextWindow> & { id: string }) => void,
	removeWindow: (id: string) => void,
	windows: ContextWindow[],
	activeWindow: string | null,
	setActiveWindow: (id: string | null) => void,
	activationOrder: Record<string, number>
}>({ createWindow: () => {}, removeWindow: () => {}, updateWindow: () => {}, windows: [], activeWindow: null, setActiveWindow: () => {}, activationOrder: {} });

export const useWindows = () => useContext(WindowContext);

export const WindowContextProvider = ({ children }: { children: ComponentChildren }) => {
	const [windows, setWindows] = useState<ContextWindow[]>([]);
	const [activationOrder, setActivationOrder] = useState<string[]>([]);

	const createWindow = useCallback((window: ContextWindow) => {
		setWindows(w => [...w, window]);
	}, [setWindows]);

	const updateWindow = useCallback((window: Partial<ContextWindow> & { id: string }) => {
		setWindows(w => w.map(w => w.id === window.id ? { ...w, ... window } : w));
	}, [setWindows]);

	const removeWindow = useCallback((id: string) => {
		setWindows(w => w.filter(w => w.id !== id));
		setActivationOrder(o => o.filter(o => o !== id));
	}, [setWindows, setActivationOrder]);

	const setActiveWindow = useCallback((id: string | null) => {
		if (id !== null)
			setActivationOrder(o => [id, ...o.filter(o => o !== id)])
	}, [setActivationOrder]);

	const [openWindowActivationOrder, activationOrderMap] = useMemo(() => {
		const windowMap = windows.reduce((map, win) => {
			map[win.id] = win;
			return map;
		}, {} as Record<string, ContextWindow>);

		return [
			activationOrder.filter(order => !windowMap[order]?.minimized),
			activationOrder.reduce((order, id, i) => {
				order[id] = i;
				return order;
			}, {} as Record<string, number>)
		];
	}, [activationOrder, windows]);

	return (<WindowContext.Provider value={{ windows, createWindow, updateWindow, removeWindow, activeWindow: openWindowActivationOrder[0] ?? null, setActiveWindow, activationOrder: activationOrderMap }}>
		{ children }
	</WindowContext.Provider>)
};

type WindowProps = Omit<Window, 'x' | 'y' | 'width' | 'height' | 'maximized' | 'minimized'> & {
	x?: number,
	y?: number,
	width?: number,
	height?: number,
	maximized?: boolean,
	minimized?: boolean,
	children: ComponentChildren,
	isOpen: boolean,
	windowingStrategy?: 'dom' | 'display',
	onClose: () => void
};

export const Window = ({ children, title, icon, width: initialWidth = -1, height: initialHeight = -1, resizable, minWidth, minHeight, x: initialX = 0, y: initialY = 0, id, maximized: initialMaximized, minimized: initialMinimized, isOpen, windowingStrategy = 'dom', onClose }: WindowProps) => {
	const context = useWindows();
	const lastOpen = useRef<boolean | null>(null);
	const [x, setX] = useState(initialX);
	const [y, setY] = useState(initialY);
	const [width, setWidth] = useState(initialWidth);
	const [height, setHeight] = useState(initialHeight);
	const [shouldAnimateUnmaximize, setShouldAnimateUnmaximize] = useState(false);
	const [maximized, _setMaximized] = useState(!!initialMaximized);
	const setMaximized = useCallback((val: StateUpdater<boolean>) => {
		setShouldAnimateUnmaximize(true);
		return _setMaximized(val);
	}, [_setMaximized, setShouldAnimateUnmaximize]);
	const [{ minimized, restoreState }, setMinimizedRestoreState] = useReducer<MinimizedRestoreState, Partial<MinimizedRestoreState>>((state, action) => {
		if (state.minimized === action.minimized && state.restoreState === action.restoreState)
			return state;

		state = { ...state };

		if (action.restoreState !== undefined) {
			state.restoreState = action.restoreState ?? null;
			if (action.minimized !== undefined)
				state.minimized = action.minimized ?? state.minimized;

			return state;
		}

		if (!state.minimized && action.minimized) {
			state.restoreState = windowMinimize;
		} else {
			state.restoreState = windowRestore;
		}

		return { ...state, minimized: action.minimized! };
	}, { minimized: !!initialMinimized, restoreState: null });
	const setMinimized = useCallback((minimized: boolean) => setMinimizedRestoreState({ minimized }), [setMinimizedRestoreState]);
	const [taskbarX, setTaskbarX] = useState<number>(-1);
	const [taskbarWidth, setTaskbarWidth] = useState<number>(-1);
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (lastOpen.current === isOpen) return;
		lastOpen.current = isOpen;
		if (!isOpen) {
			setMinimizedRestoreState({ restoreState: null, minimized: false });
			setMaximized(false);
			setWidth(initialWidth);
			setHeight(initialHeight);
			setShouldAnimateUnmaximize(false);
			return context.removeWindow(id);
		}
		context.createWindow({
			title, icon, width, height, x, y, id, maximized, minimized, setMaximized, setMinimized, ref, setTaskbarWidth, setTaskbarX
		});
		context.setActiveWindow(id);
	}, [ref, lastOpen, isOpen, context.createWindow, context.removeWindow, title, icon, width, height, x, y, id, maximized, minimized, setMaximized, setMinimized, setTaskbarX, setTaskbarWidth, setMinimizedRestoreState, initialWidth, initialHeight, setShouldAnimateUnmaximize]);

	useEffect(() => {
		return () => context.removeWindow(id);
	}, []);

	useEffect(() => {
		if (isOpen)
			context.updateWindow({ title, icon, width, height, x, y, id, maximized, minimized, setMinimized, setMaximized, ref });
	}, [isOpen, context.updateWindow, title, icon, width, height, x, y, id, maximized, minimized, setMaximized, setMinimized, setMinimizedRestoreState, ref]);

	if (!isOpen && windowingStrategy === 'dom')
		return null;

	const isMaximized = maximized && resizable;

	const style: Record<string, string> = {
		'--x': `${isMaximized ? -3 : x}px`,
		'--y': `${isMaximized ? -3 : y}px`,
		'--x2': `${taskbarX}px`,
		'--w2': `${taskbarWidth}px`
	};

	if (width >= 0)
		style.width = `${width}px`;
	if (height >= 0)
		style.height = `${height}px`;

	return (<div className={cn(windowClass, win98.window, restoreState, !isOpen && windowHidden, isMaximized && windowMaximize, shouldAnimateUnmaximize && windowUnmaximize)}
	             style={style} ref={ref}>
		<div class={cn(win98.titleBar, titleBar, context.activeWindow !== id && restoreState !== windowMinimize && win98.inactive)} onMouseDown={() => context.setActiveWindow(id)}>
			{icon && <div className={titleBarIcon}>
					<img src={icon} alt="" />
			</div>}

			<div class={cn(win98.titleBarText, titleBarText, icon && titleIcon)}>
				{ title }
			</div>

			<div class={`${win98.titleBarControls} ${controls}`}>
				<button aria-label="Minimize" onClick={() => setMinimized(true)} />
				{isMaximized ? <button aria-label="Restore" onClick={() => setMaximized(false)} /> :
					<button aria-label="Maximize" disabled={!resizable} onClick={() => setMaximized(true)} />}
				<button aria-label="Close" onClick={onClose} />
			</div>
		</div>
		{ children }
	</div>);
};
