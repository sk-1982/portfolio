import { css } from '@linaria/core';
import { taskbarZIndex } from '@/css';
import { MutableRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Program } from './program.tsx';
import { cloneElement, ComponentChildren, createContext, VNode } from 'preact';
import { useChange } from '../hooks/use-change.ts';

const screensaver = css`
		position: fixed;
		inset: 0;
		z-index: ${taskbarZIndex * 2};
		width: 100%;
		height: 100%;
		background: #000;
		&, & * {
        cursor: none !important;
    }
`;

export type ScreensaverProps = {
	name: string,
	children: VNode<any>,
	onOpen?: () => void,
	onClose?: () => void,
};

type ScreensaverContextValue = {
	registerOnClose: (onClose: () => void) => void,
	onOpen: () => void,
	setOnIdle: (onIdle: () => void) => void,
	lastOpen: MutableRef<number>,
};

export const ScreensaverContext = createContext<ScreensaverContextValue>({
	registerOnClose: () => {},
	onOpen: () => {},
	setOnIdle: () => {},
	lastOpen: { current: 0 }
});

export const ScreensaverContextProvider = ({ children }: { children: ComponentChildren }) => {
	const onClose = useRef<(() => void)[]>([]);
	const screensaverOpen = useRef(false);
	const onIdle = useRef(() => {});
	const lastOpen = useRef(0);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | null = null;

		const events = [
			'mousedown',
			'mousemove',
			'mouseover',
			'dblclick',
			'contextmenu',
			'wheel',
			'touchstart',
			'keydown',
			'keypress',
		] as const;

		const refreshTimeout = () => {
			if (timeout !== null)
				clearTimeout(timeout);
			timeout = setTimeout(() => {
				timeout = null;
				onIdle.current();
			}, 60 * 1000 * 10);
		};

		const listener = () => {
			refreshTimeout();
			if (!screensaverOpen.current || Date.now() - lastOpen.current < 1000) return;
			onClose.current.forEach(c => c());
			screensaverOpen.current = false;
		};

		const options = { capture: true, passive: true };
		events.forEach(e => document.addEventListener(e, listener, options));

		refreshTimeout();

		return () => {
			events.forEach(e => document.removeEventListener(e, listener, options));
			if (timeout !== null)
				clearTimeout(timeout);
		}
	}, []);

	const value = useMemo(() => {
		return {
			registerOnClose: listener => onClose.current.push(listener),
			onOpen: () => screensaverOpen.current = true,
			setOnIdle: l => onIdle.current = l,
			lastOpen
		} as ScreensaverContextValue;
	}, [])

	return (<ScreensaverContext.Provider value={value}>
		{children}
	</ScreensaverContext.Provider>)
};

export const Screensaver = ({ name, children, onOpen, onClose }: ScreensaverProps) => {
	const [isOpen, setOpen] = useState(false);
	const context = useContext(ScreensaverContext);

	useEffect(() => {
		context.registerOnClose(() => setOpen(false));
	}, []);

	useChange(isOpen, () => {
		if (isOpen) {
			onOpen?.();
			context.onOpen();
			context.lastOpen.current = Date.now();
		} else {
			onClose?.();
		}
	}, []);

	return (<Program name={name} onOpen={useCallback(() => setOpen(true), [])}>
		{isOpen && cloneElement(children, {
			className: `${screensaver} ${children.props.className ?? ''}`
		})}
	</Program>);
};
