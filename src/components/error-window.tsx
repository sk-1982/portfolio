import { Window, WindowProps } from './window.tsx';
import win98 from '@98.css';
import errorIcon from '@images/error.webp';
import { css } from '@linaria/core';
import { useEffect, useRef, useState } from 'preact/hooks';
import cn from 'clsx/lite';

const errorModal = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	--p: 0;
	padding-left: var(--p);
	> div {
		display: flex;
		align-items: center;
		padding: 4px;
	}
	img {
		margin-right: 18px;
	}
	button {
		margin: 16px 0 6px 0;
		span {
			padding-left: .85px;
		}
	}
`;

const errorHidden = css`visibility: hidden`;

export const ErrorWindow = ({error, ...props}: Omit<WindowProps, 'isOpen' | 'x' | 'y' | 'children'> & { error: string }) => {
	const [measured, setMeasured] = useState<null | number>(null);
	const lastError = useRef(!!error);
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const e = !!error;
		if (e === lastError.current) return;
		lastError.current = e;
		setTimeout(() => {
			if (e) {
				const rect = ref.current?.getClientRects()?.[0];
				if (!rect)
					return setMeasured(0);
				setMeasured(1 - (rect.left - Math.floor(rect.left)));
			} else {
				setMeasured(null);
			}
		}, 0)
	}, [error]);

	return (<Window {...props} isOpen={!!error} x={-1} y={-1}>
		<div className={cn(win98.windowBody, errorModal, measured === null && errorHidden)} style={measured ? { '--p': `${measured}px` } : undefined}>
			<div ref={ref}>
				<img src={errorIcon} alt="Error"/>
				{error}
			</div>
			<button onClick={props.onClose}>
					<span>
						OK
					</span>
			</button>
		</div>
	</Window>);
};
