import { css } from '@linaria/core';
import { cloneElement, createContext, VNode } from 'preact';
import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks';
import { taskbarZIndex } from '@/css';
import './tooltip.scss';
// @ts-ignore
import { createPortal } from '@/utils/createPortal';
import cn from 'clsx/lite';

const tooltipContainer = css`
  position: fixed;
  pointer-events: none;
  user-select: none;
  top: 0;
  left: 0;
  transform: translate(var(--x), calc(var(--y) - 100%));
	overflow: hidden;
	z-index: ${taskbarZIndex + 1000};
`;

const tooltipClass = css`
	padding: 3px;
	border: 1px solid black;
	background: #ffffe1;
	line-height: 1;
	animation: tooltip .1s linear 1;
`;

const tooltipContainerHidden = css`
	visibility: hidden;
	.${tooltipClass} {
		animation: none;
	}
`

type TooltipProps = {
	children: VNode<any>,
	content: string,
	overflowOnly?: boolean,
	disabled?: boolean
};

export const TooltipDisableContext = createContext(false);

const computeTooltipLocation = ({ x, y }: { x: number, y: number }, tooltipElem: HTMLDivElement | null) => {
	const width = tooltipElem?.clientWidth ?? 0;
	const height = tooltipElem?.clientHeight ?? 0;
	if (width + x > window.innerWidth)
		x = window.innerWidth - width;
	if (y - height < 0)
		y = height;
	return { '--x': `${x}px`, '--y': `${y}px` };
};

export const Tooltip = ({ children, content, overflowOnly, disabled }: TooltipProps) => {
	const [isShowing, setShowing] = useState(false);
	const lastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const ref = useRef<HTMLElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
	const contextDisabled = useContext(TooltipDisableContext);

	const refreshTimeout = useCallback((e: MouseEvent) => {
		if (lastTimeout.current)
			clearTimeout(lastTimeout.current);
		lastTimeout.current = setTimeout(() => {
			setShowing(true);
			lastTimeout.current = null;
			setLastMouse({
				x: e.clientX,
				y: e.clientY
			})
		}, 1000);
	}, []);

	const child = cloneElement(children, {
		onMouseEnter: (e: MouseEvent) => {
			if (!ref.current) return;
			if (overflowOnly) {
				const overflowing = ref.current.scrollWidth > ref.current.clientWidth ||
					[...ref.current.querySelectorAll(':scope > span')].some(e => e.scrollWidth > e.clientWidth);

				if (!overflowing) return;
			}

			refreshTimeout(e);
		},
		onMouseLeave: (e: MouseEvent) => {
			if (lastTimeout.current) {
				clearTimeout(lastTimeout.current);
				lastTimeout.current = null;
			}
			setShowing(false);
		},
		ref: (e: HTMLElement) => {
			ref.current = e;
			if (children.ref)
				(children.ref as any).current = e;
		}
	});

	useEffect(() => {
		const mouseMove = (e: MouseEvent) => {
			if (isShowing) {
				if (Math.abs(lastMouse.x - e.clientX) + Math.abs(lastMouse.y - e.clientY) > 8)
					setShowing(false);
			} else if (lastTimeout.current) {
				refreshTimeout(e);
			}
		};

		const mouseDown = () => setShowing(false);

		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mousedown', mouseDown);

		return () => {
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mousedown', mouseDown);
		};
	}, [isShowing]);

	return (<>
		{ child }
		{!disabled && !contextDisabled && createPortal(<div className={cn(tooltipContainer, !isShowing && tooltipContainerHidden)}
		                   ref={containerRef}
		                   style={computeTooltipLocation(lastMouse, containerRef.current)}>
			<div className={tooltipClass}>{content}</div>
		</div>, document.getElementById('app')!)}
	</>);
};
