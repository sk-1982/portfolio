import { cloneElement, ComponentChildren, VNode } from 'preact';
import { DropdownButton, DropdownMenuRef } from './dropdown.tsx';
import { css } from '@linaria/core';
import { useRef } from 'preact/hooks';
import cn from 'clsx/lite';

const menuBar = css`
	margin: 0 1px 1px 1px;
	display: flex;
`;

type MenuBarProps = {
	children: VNode<any> | VNode<{ dropdownRef: DropdownMenuRef, onOpen: (open: boolean) => void }>[],
	className?: string
};

export const MenuBar = ({ children, className }: MenuBarProps) => {
	const open = useRef<boolean[]>([]);
	const refs = useRef<DropdownMenuRef[]>([]);

	const child = Array.isArray(children) ?
		children.map(((child, i) => {
			if (child.type !== DropdownButton) return child;

			if (open.current[i] === undefined)
				open.current[i] = false;
			if (refs.current[i] === undefined)
				refs.current[i] = { current: null };

			return cloneElement(child, {
				onOpen: (o: boolean) => open.current[i] = o,
				onMouseEnter: (e: MouseEvent) => {
					if (open.current.every(o => !o)) return;
					refs.current.forEach((r, j) => r.current?.setOpen(j === i))
				},
				dropdownRef: refs.current[i]
			});
		})) :
		children;

	return (<div className={`${menuBar} ${className ?? ''}`}>
		{ child }
	</div>);
};

const menuBarGroup = css`
	display: flex;
	flex-direction: column;
	padding: 2px;
	box-shadow: inset -1px -1px #fff, inset -2px -2px gray, inset 1px 1px gray, inset 2px 2px #fff;
`;

type MenuBarGroupProps = {
	className?: string,
	children: ComponentChildren
};

export const MenuBarGroup = ({ children, className }: MenuBarGroupProps) => {
	return (<div className={cn(className, menuBarGroup)}>
		{ children }
	</div>)
};
