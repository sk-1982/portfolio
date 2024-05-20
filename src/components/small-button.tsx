import { ComponentChildren } from 'preact';
import { css } from '@linaria/core';
import cn from 'clsx/lite';
import { MutableRef } from 'preact/hooks';

type SmallButtonProps = {
	children?: ComponentChildren,
	className?: string,
	active?: boolean,
	padding?: number,
	disabled?: boolean,
	onClick?: () => void,
	containerClassName?: string
};

const smallButton = css`
	outline: none !important;
	box-shadow: none !important;
	height: 21px;
	min-height: 21px;
	text-shadow: none !important;
	color: #222;
	min-width: 0;
	padding: 0 var(--p);
	&:hover {
    box-shadow: inset -1px -1px gray, inset 1px 1px #fff !important;
	}
	&:active {
    box-shadow: inset -1px -1px #fff, inset 1px 1px gray !important;
		> div {
      transform: translate(1px, 1px);
    }
	}
	&:disabled {
		box-shadow: none !important;
    &:active > div {
      transform: none;
    }
		> div {
			filter: drop-shadow(1px 1px #fff);
			color: gray;
		}
		img {
			filter: contrast(0);
		}
	}
`;

const smallButtonActive = css`
	box-shadow: inset -1px -1px #fff, inset 1px 1px gray !important;
	&:hover {
    box-shadow: inset -1px -1px #fff, inset 1px 1px gray !important;
	}
	> div {
		transform: translate(1px, 1px);
	}
`;

const smallButtonGroup = css`
	display: flex;
	&:hover .${smallButton}:not(.${smallButtonActive}, :active, :disabled) {
    box-shadow: inset -1px -1px gray, inset 1px 1px #fff !important;
	}
`;

export const SmallButtonGroup = ({ children, className }: { children: ComponentChildren, className?: string }) => {
	return (<div className={`${smallButtonGroup} ${className ?? ''}`}>
		{ children }
	</div>)
};

export const SmallButton = ({ children, className, active, padding, disabled, onClick, containerClassName }: SmallButtonProps) => {
	return (<button className={cn(smallButton, className, active && smallButtonActive)} style={{ '--p': `${padding ?? 8}px` }} disabled={disabled} onClick={onClick}>
		<div className={containerClassName}>{ children }</div>
	</button>);
};
