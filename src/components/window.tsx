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
import { taskbarZIndex } from '@/css';
import cursor from '@/cursor.module.scss';
import resizeHandle from '@images/resize-handle.webp';
import { Tooltip } from './tooltip.tsx';
import { ContextMenu } from './context-menu.tsx';
import maximizeDisabledImage from '@images/maximize-disabled.webp';
import { Restore } from './restore.tsx';
import { Maximize } from './maximize.tsx';
import { Minimize } from './minimize.tsx';
import { Close } from './close.tsx';
import { DropdownMenu } from './dropdown.tsx';
import { MenuItem } from './menu.tsx';

const controls = css``;

const windowClass = css`
  @keyframes minimize {
    0% {
      clip-path: rect(3px calc(100% - 3px) 23px 3px);
      transform: translate(var(--x), var(--y));
      z-index: 1000000;
	    top: 0;
	    left: 0;
    }
    99.99% {
      clip-path: rect(3px var(--w2) 23px 3px);
      transform: translate(calc(var(--x2) - 3px), calc(100vh - 26px));
      z-index: 1000000;
      top: 0;
      left: 0;
    }
    100% {
      clip-path: rect(0 0 0 0);
      top: 0;
      left: 0;
    }
  }
  @keyframes restore {
    0% {
      clip-path: rect(3px var(--w2) 23px 3px);
      transform: translate(calc(var(--x2) - 3px), calc(100vh - 26px));
      z-index: 1000000;
      top: 0;
      left: 0;
    }
    100% {
      clip-path: rect(3px calc(100% - 3px) 23px 3px);
      transform: translate(var(--x), var(--y));
      z-index: 1000000;
      top: 0;
      left: 0;
    }
  }

  @each $name in ('maximize', 'unmaximize') {
    @keyframes #{$name} {
      to {
        clip-path: rect(3px calc(100% - 3px) 23px 3px);
        top: 0;
        left: 0;
      }
    }
  }

  @for $i from 1 through 4 {
    @keyframes hide-#{$i} {
      to {
        width: 0;
        clip-path: rect(0 0 0 0);
      }
    }
  }
		
  --minimize: none;
	--maximize: none;
	--restore: none;
	--unmaximize: none;
	--hide-1: none;
	--hide-2: none;
	--hide-3: none;
		
	outline: none;
	position: fixed;
  top: var(--y);
  left: var(--x);
	animation: var(--minimize), var(--maximize), var(--restore), var(--unmaximize);
  transition-property: top, right, left, bottom, width, transform;
  transition-duration: .25s;
	transition-timing-function: steps(10);
	display: flex;
	flex-direction: column;
	
	.${controls} {
		animation-name: var(--hide-1), var(--hide-2), var(--hide-3);
		animation-duration: .25s;
		animation-iteration-count: 1;
		animation-timing-function: steps(2, start);
	}
`;

const windowTransform = css`
  transform: translate(var(--x), var(--y));
	left: 0;
	top: 0;
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
	bottom: 22px;
	height: auto !important;
	width: 100% !important;
  --maximize: maximize .25s 1 steps(2, start);
	--unmaximize: none;
	--hide-3: hide-4;
`;

const windowHidden = css`
	display: none;
`;

const windowPlaceholder = css`
  background: repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%) 0 / 2px 2px;
	position: fixed;
	z-index: ${taskbarZIndex - 1};
	mix-blend-mode: difference;
	left: 0;
	top: 0;
	pointer-events: none;
	clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 4px 4px, 4px calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 4px 4px);
`;

const windowMeasuring = css`visibility: hidden`;

const windowNoTransition = css`
	transition-duration: 0s !important;
`;

const titleIcon = css`
	margin-left: 18px;
`;

const titleBar = css`
	position: relative;
	margin-bottom: 1px;
`;

const titleBarIcon = css`
	position: absolute;
	left: 2px;
	top: 0;
	height: 100%;
	display: grid;
	align-items: center;
	width: 16px;
	user-select: none;
`;

const titleBarText = css`
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	flex-grow: 1;
`;

const handle = css`
	position: absolute;
	z-index: 1000000;
`;

const handleTopBottom = css`
	height: 4px;
	left: 19px;
	right: 19px;
`;

const handleLeftRight = css`
	width: 4px;
	top: 19px;
	bottom: 19px;
`;

const handleCorner = css`
	width: 20px;
	height: 20px;
`;

const handleN = css`
	top: -1px;
`;

const handleS = css`
	bottom: -1px;
`;

const handleW = css`
	left: -1px;
`;

const handleE = css`
	right: -1px;
`;

const handleNW = css`
	top: -1px;
	left: -1px;
	clip-path: polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px 100%, 0 100%);
`;

const handleNE = css`
	top: -1px;
	right: -1px;
	clip-path: polygon(0 0, 100% 0, 100% 100%, 16px 100%, 16px 4px, 0 4px);
`;

const handleSW = css`
	bottom: -1px;
	left: -1px;
	clip-path: polygon(0 0, 4px 0, 4px 16px, 100% 16px, 100% 100%, 0 100%);
`;

const handleSE = css`
	bottom: -1px;
	right: -1px;
	clip-path: polygon(16px 0, 100% 0, 100% 100%, 0 100%, 0 16px, 16px 16px);
`;

const handleStripes = css`
	bottom: 3px;
	right: 3px;
	width: 13px;
	height: 13px;
	background: url(${resizeHandle});
`;

const closeButton = css`margin-left: 2px`;

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

export type ContextWindow = Pick<Window, 'title' | 'icon' | 'width' | 'height' | 'x' | 'y' | 'id' | 'maximized' | 'minimized' | 'resizable'> & {
	setMaximized: (val: boolean) => void,
	setMinimized: (val: boolean) => void,
	setTaskbarX: (x: number) => void,
	setTaskbarWidth: (width: number) => void,
	ref: MutableRef<HTMLElement | null>,
	onClose?: () => void
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

const updatePreview = (ref: MutableRef<HTMLElement | null>, pos: { x: number, y: number, width: number, height: number }) => {
	const elem = ref.current;
	if (!elem) return;

	elem.style.width = `${pos.width + 6}px`;
	elem.style.height = `${pos.height + 6}px`;
	elem.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
}

export const WindowContextProvider = ({ children }: { children: ComponentChildren }) => {
	const [windows, setWindows] = useState<ContextWindow[]>([]);
	const [activationOrder, setActivationOrder] = useState<(string | null)[]>([]);

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
		setActivationOrder(o => {
			if (o[0] === id) return o;
			return [id, ...o.filter(o => o && o !== id)]
		})
	}, [setActivationOrder]);

	const [openWindowActivationOrder, activationOrderMap] = useMemo(() => {
		const windowMap = windows.reduce((map, win) => {
			map[win.id] = win;
			return map;
		}, {} as Record<string, ContextWindow>);

		return [
			activationOrder.filter(order => order ? !windowMap[order]?.minimized : true),
			activationOrder.reduce((order, id, i) => {
				if (!id) return order;
				order[id] = activationOrder.length - i;
				return order;
			}, {} as Record<string, number>)
		];
	}, [activationOrder, windows]);

	return (<WindowContext.Provider value={{ windows, createWindow, updateWindow, removeWindow, activeWindow: openWindowActivationOrder[0] ?? null, setActiveWindow, activationOrder: activationOrderMap }}>
		{ children }
	</WindowContext.Provider>)
};

export type WindowState = { resizing: boolean, focused: boolean };

export type WindowProps = Omit<Window, 'x' | 'y' | 'width' | 'height' | 'maximized' | 'minimized'> & {
	x?: number,
	y?: number,
	width?: number,
	height?: number,
	maximized?: boolean,
	minimized?: boolean,
	children: ComponentChildren | ((status: WindowState) => ComponentChildren),
	isOpen: boolean,
	windowingStrategy?: 'dom' | 'display',
	onClose: () => void,
	className?: string,
	cornerHandle?: boolean,
	contextRef?: MutableRef<ContextWindow | null>,
	onKeyDown?: (e: KeyboardEvent) => void,
	onKeyUp?: (e: KeyboardEvent) => void,
	onKeyPress?: (e: KeyboardEvent) => void,
	focusRef?: MutableRef<HTMLElement | null>,
	positionStrategy?: 'transform' | 'position',
	cornerClass?: string,
	stopKeys?: boolean
};

type Direction = 'n' | 'e' | 's' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

const RESIZE_CLASSES: Record<Direction, string> = {
	n: `${handleN} ${handleTopBottom} ${cursor.nsResize}`,
	s: `${handleS} ${handleTopBottom} ${cursor.nsResize}`,
	e: `${handleE} ${handleLeftRight} ${cursor.ewResize}`,
	w: `${handleW} ${handleLeftRight} ${cursor.ewResize}`,
	nw: `${handleNW} ${handleCorner} ${cursor.nwseResize}`,
	ne: `${handleNE} ${handleCorner} ${cursor.neswResize}`,
	sw: `${handleSW} ${handleCorner} ${cursor.neswResize}`,
	se: `${handleSE} ${handleCorner} ${cursor.nwseResize}`
};

const RESIZE_DIRECTION: Record<Direction, [number, number]> = {
	n: [0, -1],
	s: [0, 1],
	e: [1, 0],
	w: [-1, 0],
	nw: [-1, -1],
	ne: [1, -1],
	sw: [-1, 1],
	se: [1, 1]
};

export const Window = ({
	                       contextRef, className, cornerHandle, children, title, icon,
	                       width: initialWidth = -1, height: initialHeight = -1, resizable, minWidth, minHeight,
	                       x: initialX = 0, y: initialY = 0, id, maximized: initialMaximized,
	                       minimized: initialMinimized, isOpen = false, windowingStrategy = 'dom', onClose,
	                       onKeyUp, onKeyPress, onKeyDown, focusRef, positionStrategy, cornerClass, stopKeys
                       }: WindowProps) => {
	const context = useWindows();
	const lastOpen = useRef<boolean | null>(null);
	const shouldMeasureForCenter = (initialX === -1 || initialY === -1) && (initialHeight === -1 || initialWidth === -1);
	initialX = initialX < 0 ? window.innerWidth / 2 - initialWidth / 2 : initialX;
	initialY = initialY < 0 ? window.innerHeight / 2 - initialHeight / 2 - 20 : initialY;
	const [measuring, setMeasuring] = useState(false);
	const [initialMeasure, setInitialMeasure] = useState(shouldMeasureForCenter);
	const [x, setX] = useState(initialX);
	const [y, setY] = useState(initialY);
	const [width, setWidth] = useState(initialWidth);
	const [height, setHeight] = useState(initialHeight);
	const [shouldAnimateUnmaximize, setShouldAnimateUnmaximize] = useState(false);
	const [maximized, _setMaximized] = useState(!!initialMaximized);
	const [isMoving, setMoving] = useState(false);
	const [shouldMove, setShouldMove] = useState(false);
	const [disableAnimations, setDisableAnimations] = useState(false);
	const [resizingDirection, setResizingDirection] = useState<null | Direction>(null);
	const titleBarRef = useRef<HTMLDivElement | null>(null);

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
	const dragStart = useRef({ x: 0, y: 0 });
	const prevWindow = useRef({ x: 0, y: 0, width: 0, height: 0 });
	const previewRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!measuring) return;

		const elem = ref.current;

		if (!elem) return;

		const size = elem.getBoundingClientRect();

		setMeasuring(false);
		setX(window.innerWidth / 2 - size.width / 2);
		setY(window.innerHeight / 2 - size.height / 2 - 20);
		setTimeout(() => {
			setDisableAnimations(false);
			setInitialMeasure(false);
		}, 0);
	}, [measuring]);

	useEffect(() => {
		if (lastOpen.current === isOpen) return;
		lastOpen.current = isOpen;
		if (!isOpen) {
			setMinimizedRestoreState({ restoreState: null, minimized: false });
			_setMaximized(!!initialMaximized);
			setWidth(initialWidth);
			setHeight(initialHeight);
			setShouldAnimateUnmaximize(false);
			setX(initialX);
			setY(initialY);
			setShouldMove(false);
			setMoving(false);
			setResizingDirection(null);
			setMeasuring(false);
			setInitialMeasure(shouldMeasureForCenter);
			return context.removeWindow(id);
		}
		const w = {
			title, icon, width, height, x, y, id, maximized, minimized, setMaximized, setMinimized, ref, setTaskbarWidth,
			setTaskbarX, resizable, onClose
		};

		setMinimizedRestoreState({ restoreState: null });
		context.createWindow(w);
		if (contextRef)
			contextRef.current = w;
		context.setActiveWindow(id);

		if (shouldMeasureForCenter) {
			setMeasuring(true);
			setDisableAnimations(true);
		}
	}, [ref, lastOpen, isOpen, context.createWindow, context.removeWindow, title, icon, width, height, x, y, id, maximized, minimized,
		initialX, initialY, setMaximized, setMinimized, setTaskbarX, setTaskbarWidth, setMinimizedRestoreState, initialWidth, initialHeight,
		setShouldAnimateUnmaximize, resizable]);

	useEffect(() => {
		return () => {
			if (contextRef)
				contextRef.current = null;
			context.removeWindow(id);
		}
	}, []);

	useEffect(() => {
		if (isOpen) {
			const w = { title, icon, width, height, x, y, id, maximized, minimized, setMaximized, setMinimized, ref,
				setTaskbarWidth, setTaskbarX, resizable, onClose };
			if (contextRef)
				contextRef.current = w;
			context.updateWindow(w);
			setTimeout(() => (focusRef?.current ?? ref.current)?.focus(), 0);
		}
	}, [isOpen, context.updateWindow, title, icon, width, height, x, y, id, maximized, minimized, setMaximized, setMinimized,
		setMinimizedRestoreState, ref, setTaskbarX, setTaskbarWidth, resizable]);

	useEffect(() => {
		const resizeListener = () => {
			setDisableAnimations(true);
			setX(Math.max(Math.min(x, window.innerWidth - 20), -width + 72));
			setY(Math.max(Math.min(y, window.innerHeight - 42), 0));
			setTimeout(() => setDisableAnimations(false), 0);
		};

		window.addEventListener('resize', resizeListener);

		return () => window.removeEventListener('resize', resizeListener);
	}, [x, y, width, height]);

	useEffect(() => {
		if (!isMoving && !resizingDirection && !shouldMove) return;

		const clampSize = <T extends Partial<{ x: number, y: number }>>(sizes: T): { [K in keyof T]-?: T[K] & number } => {
			if (sizes.x !== undefined)
				sizes.x = Math.max(Math.min(sizes.x, window.innerWidth - 20), -prevWindow.current.width + 72);
			if (sizes.y !== undefined)
				sizes.y = Math.max(Math.min(sizes.y, window.innerHeight - 42), 0);

			return sizes as any;
		};

		const moveSize = (event: MouseEvent) => clampSize({ x: event.clientX - dragStart.current.x + prevWindow.current.x,
			y: event.clientY - dragStart.current.y + prevWindow.current.y });

		const resizeSize = (event: MouseEvent) => {
			const [xDirection, yDirection] = RESIZE_DIRECTION[resizingDirection!];
			let xOffset = Math.max(Math.min(event.clientX, window.innerWidth), 0) - dragStart.current.x;
			let yOffset = Math.max(Math.min(event.clientY, window.innerHeight), 0) - dragStart.current.y;

			const sizes = {
				x: prevWindow.current.x,
				y: prevWindow.current.y,
				x2: prevWindow.current.x + prevWindow.current.width,
				y2: prevWindow.current.y + prevWindow.current.height
			};

			if (xDirection === 1)
				sizes.x2 = Math.max(sizes.x2 + xOffset, sizes.x + Math.max(110, minWidth ?? 0));
			else if (xDirection === -1)
				sizes.x = Math.min(sizes.x + xOffset, sizes.x2 - Math.max(110, minWidth ?? 0));

			if (yDirection === 1)
				sizes.y2 = Math.max(sizes.y2 + yOffset, sizes.y + (minHeight! >= 0 ? minHeight! : 32));
			else if (yDirection === -1)
				sizes.y = Math.min(sizes.y + yOffset, sizes.y2 - (minHeight! >= 0 ? minHeight! : 32));

			return { x: sizes.x, y: sizes.y, width: sizes.x2 - sizes.x, height: sizes.y2 - sizes.y };
		};

		const mouseMoveMoving = (event: MouseEvent) => {
			updatePreview(previewRef, {
				...moveSize(event),
				width: prevWindow.current.width,
				height: prevWindow.current.height
			});
		};

		const mouseUpMoving = (event: MouseEvent) => {
			const { x, y } = moveSize(event);
			setX(x);
			setY(y);
			setMoving(false);
		};

		const mouseMoveResizing = (event: MouseEvent) => {
			if (!resizingDirection) return
			updatePreview(previewRef, resizeSize(event));
		};

		const mouseUpResizing = (event: MouseEvent) => {
			if (!resizingDirection) return
			const { x, y, width, height } = resizeSize(event);
			setX(x);
			setY(y);
			setWidth(width);
			setHeight(height);
			setResizingDirection(null);
			delete document.body.dataset.direction;
		};

		const mouseMove = (event: MouseEvent) => {
			if (shouldMove) {
				if (Math.abs(dragStart.current.x - event.clientX) + Math.abs(dragStart.current.y - event.clientY) > 4) {
					setMoving(true);
					setShouldMove(false);
					updatePreview(previewRef, prevWindow.current);
				}
			} else if (isMoving) {
				mouseMoveMoving(event);
			} else {
				mouseMoveResizing(event);
			}
		};

		const mouseUp = (event: MouseEvent) => {
			setShouldMove(false);
			if (!isMoving && !resizingDirection) return;
			setDisableAnimations(true);

			if (isMoving)
				mouseUpMoving(event);
			else
				mouseUpResizing(event);

			setTimeout(() => setDisableAnimations(false), 0);
		};

		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);

		return () => {
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
		}
	}, [isMoving, resizingDirection, minWidth, minHeight, shouldMove]);

	const updatePrevWindowLayout = useCallback((e: MouseEvent) => {
		dragStart.current.x = e.clientX;
		dragStart.current.y = e.clientY;
		prevWindow.current.x = x;
		prevWindow.current.y = y;
		if (ref.current) {
			prevWindow.current.width = ref.current.clientWidth - 6;
			prevWindow.current.height = ref.current.clientHeight - 6;
		}
	}, [x, y]);

	const resizeHandles = useMemo(() => {
		if (!resizable || maximized) return null;

		const resize = (direction: Direction) => ({ onMouseDown: (e: MouseEvent) => {
			if (resizingDirection) return;
			context.setActiveWindow(id);
			if (e.button !== 0 || !e.target) return;
			updatePrevWindowLayout(e);
			setResizingDirection(direction);
			document.body.dataset.direction = direction;
		}});

		return (<>
			{(Object.entries(RESIZE_CLASSES) as [Direction, string][])
				.map(([direction, c]) => (<div key={direction} {...resize(direction)} className={`${handle} ${c}`} />))}

			{cornerHandle && <div className={cn(handle, handleStripes, cursor.nwseResize, cornerClass)} {...resize('se')} />}
		</>);
	}, [resizable, maximized, cornerHandle, resizingDirection, context, id, updatePrevWindowLayout, cornerClass]);

	const windowElement = useMemo(() => {
		if (!isOpen && windowingStrategy === 'dom')
			return null;

		const isMaximized = maximized && resizable;

		const menuItems: MenuItem[] = [{
			name: 'Restore',
			icon: (<Restore />),
			onClick: () => setMaximized(false),
			disabled: !resizable || !isMaximized
		}, {
			name: 'Minimize',
			icon: (<Minimize />),
			onClick: () => setMinimized(true)
		}, {
			name: 'Maximize',
			icon: (<Maximize />),
			onClick: () => setMaximized(true),
			disabled: !resizable || isMaximized
		}, '|', {
			name: 'Close',
			bold: true,
			icon: (<Close />),
			onClick: onClose
		}];

		const style: Record<string, string> = {
			'--x': `${isMaximized ? -3 : Math.round(x)}px`,
			'--y': `${isMaximized ? -3 : Math.round(y)}px`,
			'--x2': `${taskbarX}px`,
			'--w2': `${taskbarWidth}px`,
			zIndex: `${(context.activationOrder[id]! + 1) * 10}`
		};

		if (width >= 0)
			style.width = `${width}px`;
		if (height >= 0)
			style.height = `${height}px`;

		return (<div className={cn(windowClass,
			win98.window,
			restoreState,
			!isOpen && windowHidden,
			isMaximized && windowMaximize,
			shouldAnimateUnmaximize && windowUnmaximize,
			(isMoving || disableAnimations) && windowNoTransition,
			(measuring || (initialMeasure && shouldMeasureForCenter)) && windowMeasuring,
			positionStrategy !== 'position' && windowTransform
		)}
		             style={style}
		             ref={ref}
		             tabIndex={-1}
		             onMouseDown={() => context.setActiveWindow(id)}
		             onKeyDown={e => {
									 stopKeys !== false && e.stopPropagation();
									 onKeyDown?.(e)
								 }}
		             onKeyUp={e => {
									 stopKeys !== false && e.stopPropagation();
									 onKeyUp?.(e)
								 }}
		             onKeyPress={e => {
									 stopKeys !== false && e.stopPropagation();
									 onKeyPress?.(e) }}>
			{ resizeHandles }
			<ContextMenu items={menuItems}>
				<div
					className={cn(win98.titleBar, titleBar, context.activeWindow !== id && restoreState !== windowMinimize && win98.inactive)}
					ref={titleBarRef}
					onDblClick={() => {
						if (!resizable) return;
						setShouldMove(false);
						setTimeout(() => setMaximized(m => !m), 0);
					}}
					onMouseDown={e => {
						if (isMoving || shouldMove) return;
						context.setActiveWindow(id);
						if (isMaximized || e.button !== 0 || !e.target) return;
						const target = e.target as HTMLElement;
						if (target.parentElement?.tagName === 'BUTTON' || target.tagName === 'BUTTON' ||
							target.classList.contains(win98.titleBarControls)) return;
						setShouldMove(true);
						updatePrevWindowLayout(e);
					}}>
					{icon && <DropdownMenu items={menuItems} className={titleBarIcon}>
            <img src={icon} alt=""/>
          </DropdownMenu>}

					<Tooltip content={title} overflowOnly>
						<div className={cn(win98.bold, win98.titleBarText, titleBarText, icon && titleIcon)}>
							{title}
						</div>
					</Tooltip>

					<div className={`${win98.titleBarControls} ${controls}`}>
						<Tooltip content="Minimize">
							<button onClick={() => setMinimized(true)}>
								<Minimize />
							</button>
						</Tooltip>
						<Tooltip content={isMaximized ? "Restore" : "Maximize"} disabled={!resizable}>
							<button disabled={!resizable} onClick={() => setMaximized(m => !m)}>
								{isMaximized ? <Restore /> : (resizable ? <Maximize /> : <img src={maximizeDisabledImage} alt="" />)}
							</button>
						</Tooltip>
						<Tooltip content="Close">
							<button onClick={onClose} className={closeButton}>
								<Close />
							</button>
						</Tooltip>
					</div>
				</div>
			</ContextMenu>
			{ typeof children === 'function' ? children({
				resizing: isMoving || resizingDirection !== null,
				focused: context.activeWindow === id
			}) : children }
		</div>);
	}, [resizable, maximized, restoreState, isOpen, shouldAnimateUnmaximize, ref, icon, setMinimized, setMaximized,
		children, id, context, title, x, y, taskbarX, taskbarWidth, width, height, isMoving, disableAnimations, positionStrategy,
		resizeHandles, shouldMove, updatePrevWindowLayout, windowingStrategy, resizingDirection, onKeyDown, onKeyUp, onKeyPress, stopKeys]);

	useEffect(() => {
		if (context.activeWindow === id)
			(focusRef?.current ?? ref.current)?.focus();
		else
			(focusRef?.current ?? ref.current)?.blur();
	}, [focusRef, context.activeWindow, id]);

	const preview = useMemo(() => {
		if (!isMoving && !resizingDirection) return null;

		return (<div className={windowPlaceholder} ref={e => {
			previewRef.current = e;
			updatePreview(previewRef, prevWindow.current);
		}}/>);
	}, [isMoving, resizingDirection]);

	return (<>
		{preview}
		{windowElement}
	</>);
};
