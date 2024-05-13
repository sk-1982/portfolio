import win98 from '@98.css';
import { VNode } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { css } from '@linaria/core';
import { Separator } from './separator.tsx';
import { ChevronRight } from './chevron-right.tsx';
import { selected, taskbarZIndex } from '@/css';
import cn from 'clsx/lite';
import { useHoverCloser, useHoverTrigger } from '../hooks/use-hover-closer.ts';
import { usePrograms } from './program.tsx';

const sideMenu = css`
	transition: 0s;
	transform: translateX(-100%);
`;

const sideMenuContainer = css`
	position: absolute;
	right: 2px;
	top: -3px;
  transform: translateX(100%);
	clip-path: rect(-10000px 10000px 10000px 0px);
	z-index: ${taskbarZIndex + 20};
	pointer-events: none;
`;

const sideMenuContainerOpen = css`
	pointer-events: auto;
		
	& > .${sideMenu} {
    transition: .1s;
    transform: translateX(0);
	}
`;

const sideMenuItem = css`
	height: 20px;
	display: flex;
	align-items: center;
	padding: 0 6px 0 2px;
	color: #222;
	text-decoration: none;
  color: #222;

  &:hover, &.${selected} {
		background: #000080;
		color: #fff;
	}
`;

const iconContainer = css`
	width: 16px;
	height: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
`;

const triggerContainer = css`position: relative`;

export type SideMenuItem = {
	icon: string,
	name: string,
	children?: SideMenuItem[],
	onClick?: () => void,
	launch?: string[],
	link?: string,
} | '|';

type SideMenuProps = {
	children: VNode<any>,
	items: SideMenuItem[],
	className?: string,
	openClassName?: string,
	onItemSelected?: () => void
};

const SideMenuItem = ({ item, onItemSelected }: { item: SideMenuItem & object, onItemSelected?: () => void }) => {
	const programs = usePrograms();

	const contents = (<>
		<div className={iconContainer}>
			<img alt="" src={item.icon}/>
		</div>
		{item.name}
		{!!item.children?.length && <ChevronRight />}
	</>);

	const triggers = useHoverTrigger();

	if (item.children?.length)
		return (<SideMenu items={item.children} className={sideMenuItem} openClassName={selected} onItemSelected={() => {
			onItemSelected?.();
		}}>
			{ contents }
		</SideMenu>);

	const props = {
		className: sideMenuItem,
		onClick: (e: MouseEvent) => {
			item.onClick?.();
			onItemSelected?.();
			if (item.launch?.length)
				programs.openProgram(item.launch[0], ...item.launch.slice(1));
			e.stopPropagation();
		},
		...triggers
	};

	if (item.link)
		return (<a {...props} target="_blank" href={item.link} rel="noopener noreferrer">
			{ contents }
		</a>);

	return (<div {...props}>
		{ contents }
	</div>);
};

export const SideMenu = ({ children, items, className, openClassName, onItemSelected }: SideMenuProps) => {
	const [isOpen, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement | null>(null);

	useHoverCloser({
		continueIf: e => e === ref.current,
		onClose: () => setOpen(false)
	});

	return (<div className={cn(triggerContainer, className, isOpen && openClassName)}
	             onClick={() => setOpen(true)}
	             {...useHoverTrigger(() => setOpen(true))}
	             ref={ref}>
		{children}
		<div className={cn(sideMenuContainer, isOpen && sideMenuContainerOpen)}>
      <div className={`${win98.window} ${sideMenu}`}>
	      {items.map((item, i) => {
		      if (item === '|')
			      return (<Separator key={i} padding orientation="horizontal"/>);

					return (<SideMenuItem key={i} item={item} onItemSelected={() => {
						setOpen(false);
						onItemSelected?.();
					}} />)
	      })}
      </div>
		</div>
	</div>);
};
