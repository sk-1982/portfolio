import { useCallback, useRef, useState } from 'preact/hooks';
import { TooltipDisableContext } from './tooltip.tsx';
import { cloneElement, VNode } from 'preact';
import { css } from '@linaria/core';
// @ts-ignore
import { createPortal } from '@/utils/createPortal';
import { taskbarZIndex } from '@/css';
import cn from 'clsx/lite';
import { useHoverCloser } from '../hooks/use-hover-closer.ts';
import { Menu, MenuItem } from './menu.tsx';

type ContextMenuProps = {
	children: VNode<any>,
	items: MenuItem[]
};

const contextMenu = css`
  @keyframes context-menu {
    0% {
      transform: translate(calc(var(--x2) * 100%), calc(var(--y2) * 100%));
      clip-path: rect(calc((var(--y2) - 1) / -2 * 100%) calc((var(--x2) - 1) / -2 * 100%) calc((var(--y2) - 1) / -2 * 100%) calc((var(--x2) - 1) / -2 * 100%));

      pointer-events: none;
    }
    to {
      transform: translate(0, 0);
      clip-path: rect(0 100% 100% 0);
      pointer-events: none;
    }
  };


  position: fixed;
	top: 0;
	left: 0;
	transform: translate(var(--x), var(--y));
	z-index: ${taskbarZIndex + 1000};
	> * {
      animation: context-menu .1s linear 1;
  }
`;

const contextMenuHidden = css`
	visibility: hidden;
	user-select: none;
	pointer-events: none;
	>* {animation: none;}
`;

export const ContextMenu = ({ children, items }: ContextMenuProps) => {
	const [menuLocation, setMenuLocation] = useState<{ x: number, y: number, x2: number, y2: number } | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useHoverCloser({
		continueIf: e => e === containerRef.current,
		onClose: () => setMenuLocation(null),
		hoverTrigger: false
	});

	const openMenu = useCallback((x: number, y: number) => {
		const location = { x, y, x2: -1, y2: -1 };
		const width = containerRef.current?.clientWidth ?? 0;
		const height = containerRef.current?.clientHeight ?? 0;

		if (location.x + width > window.innerWidth) {
			location.x -= width;
			location.x2 = 1;
		}

		if (location.y + height > window.innerHeight) {
			location.y -= height;
			location.y2 = 1;
		}

		setMenuLocation(location);
	}, []);

	const child = cloneElement(children, {
		onContextMenu: (e: MouseEvent) => {
			e.preventDefault();
			openMenu(e.clientX, e.clientY);
		}
	});

	return (<TooltipDisableContext.Provider value={menuLocation !== null}>
		{ child }
		{createPortal(<div className={cn(contextMenu, menuLocation === null && contextMenuHidden)}
		                   ref={containerRef}
		                   style={{ '--x': `${menuLocation?.x ?? 0}px`,
			                   '--y': `${menuLocation?.y ?? 0}px`,
			                   '--x2': `${menuLocation?.x2 ?? 0}`,
			                   '--y2': `${menuLocation?.y2 ?? 0}` }}>
			<Menu items={items} onItemSelected={() => setMenuLocation(null)} />
		</div>, document.getElementById('app')!)}
	</TooltipDisableContext.Provider>);
};
