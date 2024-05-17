import { VNode } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { css } from '@linaria/core';
import { taskbarZIndex } from '@/css';
import cn from 'clsx/lite';
import { useHoverCloser, useHoverTrigger } from '../hooks/use-hover-closer.ts';
import { Menu, MenuItem } from './menu.tsx';

const sideMenu = css`
	transition: 0s;
	transform: translateX(-100%);
`;

const sideMenuContainer = css`
	position: absolute;
	right: 2px;
	top: -3px;
	clip-path: inset(0);
  transform: translateX(100%);
	z-index: ${taskbarZIndex + 20};
	pointer-events: none;
`;

const sideMenuContainerOpen = css`
	pointer-events: auto;
	animation: clip .1s steps(2, end) 1 forwards;
		
	& > .${sideMenu} {
    transition: .1s;
    transform: translateX(0);
	}
`;

type SideMenuProps = {
	children: VNode<any>,
	items: MenuItem[],
	className?: string,
	openClassName?: string,
	onItemSelected?: () => void,
	iconContainerClass?: string,
	itemClass?: string
};

const triggerContainer = css`position: relative`;

export const SideMenu = ({ children, items, className, openClassName, onItemSelected, itemClass, iconContainerClass }: SideMenuProps) => {
	const [isOpen, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement | null>(null);

	useHoverCloser({
		continueIf: e => e === ref.current,
		onClose: () => setOpen(false)
	});

	return (<div className={cn(triggerContainer, className, isOpen && openClassName, itemClass)}
	             onClick={() => setOpen(true)}
	             {...useHoverTrigger(() => setOpen(true))}
	             ref={ref}>
		{children}
		<div className={cn(sideMenuContainer, isOpen && sideMenuContainerOpen)}>
			<Menu items={items} className={sideMenu}
			      onItemSelected={() => {
				      setOpen(false);
				      onItemSelected?.();
			      }}
			      iconContainerClass={iconContainerClass}
			      itemClass={itemClass}
			/>
		</div>
	</div>);
};
