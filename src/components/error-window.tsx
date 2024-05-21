import { Window, WindowProps } from './window.tsx';
import win98 from '@98.css';
import errorIcon from '@images/error.webp';
import { css } from '@linaria/core';

const errorModal = css`
	display: flex;
	flex-direction: column;
	align-items: center;
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

export const ErrorWindow = ({error, ...props}: Omit<WindowProps, 'isOpen' | 'x' | 'y' | 'children'> & { error: string }) => {
	return (<Window {...props} isOpen={!!error} x={-1} y={-1}>
		<div className={`${win98.windowBody} ${errorModal}`}>
			<div>
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
