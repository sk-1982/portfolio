import { ComponentChildren } from 'preact';
import { css } from '@linaria/core';
import cn from 'clsx/lite';

type SmallButtonProps = {
	children?: ComponentChildren,
	className?: string,
	active?: boolean,
	padding?: number,
	disabled?: boolean
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

export const SmallButtonGroup = ({ children }: { children: ComponentChildren }) => {
	return (<div className={smallButtonGroup}>
		{ children }
	</div>)
};

export const SmallButton = ({ children, className, active, padding, disabled }: SmallButtonProps) => {
	return (<button className={cn(smallButton, className, active && smallButtonActive)} style={{ '--p': `${padding ?? 8}px` }} disabled={disabled}>
		<div>{ children }</div>
	</button>);
};
