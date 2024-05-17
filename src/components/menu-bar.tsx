import { cloneElement, VNode } from 'preact';
import { DropdownMenuRef } from './dropdown.tsx';
import { css } from '@linaria/core';
import { MutableRef, useRef } from 'preact/hooks';

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
