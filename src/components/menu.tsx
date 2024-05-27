import { VNode } from 'preact';
import win98 from '@98.css';
import { Separator } from './separator.tsx';
import { usePrograms } from './program.tsx';
import cn from 'clsx/lite';
import { ChevronRight } from './chevron-right.tsx';
import { useHoverTrigger } from '../hooks/use-hover-closer.ts';
import { selected } from '@/css';
import { SideMenu } from './side-menu.tsx';
import { css } from '@linaria/core';
import { MutableRef } from 'preact/hooks';

const menuItem = css`
	height: 17px;
	display: flex;
	align-items: center;
	padding: 0 12px 0 2px;
	color: #222;
	text-decoration: none;
	white-space: nowrap;

  &:hover, &.${selected} {
		background: #000080;
		color: #fff;
	}
		
	svg {
		fill: currentColor;
	}
`;

const menuItemDisabled = css`
	color: gray;
	&:hover, &.${selected} {
		color: gray;
	}
`;

const iconContainer = css`
	width: 16px;
	height: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 2px;
`;

const shortcut = css`margin-left: auto; padding-left: 8px`;

export type MenuItem = {
	icon?: string | VNode<any>,
	name: string,
	children?: MenuItem[],
	onClick?: () => void,
	launch?: string[],
	link?: string,
	disabled?: boolean,
	bold?: boolean,
	shortcut?: string
} | '|' | null | undefined | false;

export type MenuProps = {
	className?: string,
	onItemSelected?: () => void,
	iconContainerClass?: string,
	itemClass?: string,
	items: MenuItem[],
	containerRef?: MutableRef<HTMLDivElement | null>
};

export type MenuItemProps = {
	item: MenuItem & object,
	onItemSelected?: () => void
	iconContainerClass?: string,
	className?: string
};


const MenuItem = ({ item, onItemSelected, iconContainerClass, className }: MenuItemProps) => {
	const programs = usePrograms();

	const contents = (<>
		<div className={cn(iconContainer, iconContainerClass)}>
			{item.icon && (typeof item.icon === 'string' ? <img alt="" src={item.icon} /> : item.icon)}
		</div>
		{item.bold ? <b className={win98.bold}>{item.name}</b> : item.name}
		{!!item.children?.length && <ChevronRight />}
		{item.shortcut && <span className={shortcut}>{item.shortcut}</span>}
	</>);

	const triggers = useHoverTrigger();

	if (item.children?.length)
		return (<SideMenu items={item.children} className={menuItem} openClassName={selected} itemClass={className} iconContainerClass={iconContainerClass} onItemSelected={() => {
			onItemSelected?.();
		}}>
			{ contents }
		</SideMenu>);

	const props = {
		className: cn(menuItem, item.disabled && menuItemDisabled, className),
		onClick: (e: MouseEvent) => {
			if (item.disabled) return;
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

export const Menu = ({ className, onItemSelected, iconContainerClass, itemClass, items }: MenuProps) => {
	return (<div className={`${win98.window} ${className ?? ''}`}>
		{items.map((item, i) => {
			if (!item)
				return;

			if (item === '|')
				return (<Separator key={i} padding orientation="horizontal"/>)

			return (<MenuItem key={i} item={item} onItemSelected={onItemSelected}
			                      iconContainerClass={iconContainerClass} className={itemClass} />)
		})}
	</div>);
};
