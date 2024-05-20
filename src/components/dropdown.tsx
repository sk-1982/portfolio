import { ComponentChildren } from 'preact';
import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { css } from '@linaria/core';
import cn from 'clsx/lite';
import { taskbarZIndex } from '@/css';
import { Menu, MenuItem } from './menu.tsx';
import { SmallButton } from './small-button.tsx';
import { useHoverCloser } from '../hooks/use-hover-closer.ts';

const dropdownMenuContainer = css`
	position: relative;
  --x: 0px;
	--y: 1;
	--b: 0;
`;

const dropdownMenu = css`
	position: absolute;
	left: 0;
	bottom: var(--b);
	top: var(--t);
	visibility: hidden;
	z-index: ${taskbarZIndex + 1000};
	transform: translate(var(--x), calc(var(--y) * 100%));
`;

const dropdownMenuOpen = css`
  @keyframes dropdown {
    0% {
      transform: translateY(calc(-100% * var(--y)));
    }
    to {
      transform: translateY(0);
    }
  }

  visibility: visible;
  animation: clip .1s steps(2, end) 1 forwards;
	> div {
			animation: dropdown .1s linear 1;
	}
`;

export type DropdownMenuRef = MutableRef<{ setOpen: (o: boolean) => void } | null>;

type DropdownMenuProps = {
	children: ComponentChildren | ((open: boolean) => ComponentChildren),
	items: MenuItem[],
	disabled?: boolean,
	dropdownRef?: DropdownMenuRef,
	onOpen?: (open: boolean) => void,
	onMouseEnter?: (e: MouseEvent) => void,
	className?: string,
	iconContainerClass?: string,
	itemClass?: string
};

export const DropdownMenu = ({ children, items, disabled, dropdownRef, onOpen, onMouseEnter, className, iconContainerClass, itemClass }: DropdownMenuProps) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [dropdownMenuStyle, setDropdownMenuStyle] = useState<{ x: number, b: string, t: string, y: string } | null>(null);

	const setOpen = useCallback((open: boolean) => {
		onOpen?.(open);

		if (!open)
			return setDropdownMenuStyle(null);

		if (disabled) return;

		const bounding = ref.current?.getBoundingClientRect();
		const x = bounding?.x ?? 0;
		const y = bounding?.y ?? 0;
		const height = bounding?.height ?? 0;
		const width = bounding?.width ?? 0;
		const style = { x: 0, b: '0', t: 'none', y: '1' };

		if (x < 0)
			style.x = -x;
		else if (x + width > window.innerWidth)
			style.x = window.innerWidth - (x + width);

		if (y + height > window.innerHeight - 32) {
			style.y = '-1';
			style.t = '0';
			style.b = 'none';
		}

		setDropdownMenuStyle(style);
	}, [onOpen, disabled]);

	useEffect(() => {
		if (dropdownRef)
			dropdownRef.current = { setOpen };
	}, [setOpen, dropdownRef])

	useHoverCloser({
		continueIf: e => e === ref.current?.parentElement,
		onClose: () => setOpen(false),
		hoverTrigger: false
	});

	return (<div className={cn(dropdownMenuContainer, className)}
	             style={dropdownMenuStyle ? {
								 '--x': `${dropdownMenuStyle.x}px`,
		             '--b': dropdownMenuStyle.b,
		             '--t': dropdownMenuStyle.t,
		             '--y': dropdownMenuStyle.y,
	             } : undefined}
	             onMouseEnter={onMouseEnter}
	             onClick={e => {
								 let target = e.target as HTMLElement | null;
								 while (target) {
									 if (target === ref.current) return;
									 if (target === ref.current?.parentElement) break;
									 target = target.parentElement;
								 }
								 setOpen(dropdownMenuStyle === null);
	             }}>
		{ typeof children === 'function' ? children(dropdownMenuStyle !== null) : children }
		<div ref={ref}
		     className={cn(dropdownMenu, !disabled && dropdownMenuStyle !== null && dropdownMenuOpen)}>
			<Menu items={items} iconContainerClass={iconContainerClass} itemClass={itemClass}
			      onItemSelected={() => setOpen(false)} />
		</div>
	</div>);
};

type DropdownButtonProps = Pick<DropdownMenuProps, 'items' | 'children' | 'dropdownRef' | 'onOpen' | 'onMouseEnter' | 'itemClass' | 'iconContainerClass'> & {
	className?: string,
	disabled?: boolean,
	padding?: number,
	dropdownClass?: string
};

export const DropdownButton = ({ children, items, className, disabled, padding, dropdownRef, onOpen, onMouseEnter, dropdownClass, itemClass, iconContainerClass }: DropdownButtonProps) => {
	return (<DropdownMenu items={items} disabled={disabled} dropdownRef={dropdownRef} onOpen={onOpen} onMouseEnter={onMouseEnter} className={dropdownClass} itemClass={itemClass} iconContainerClass={iconContainerClass}>
		{o => <SmallButton active={o} disabled={disabled} padding={padding} className={className}>
			{ children }
		</SmallButton>}
	</DropdownMenu>);
};
