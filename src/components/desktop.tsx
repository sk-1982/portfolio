
import { css } from '@linaria/core';
import { ContextMenu } from './context-menu.tsx';

const desktop = css`
	width: 100%;
	height: 100%;
`;

export const Desktop = () => {
	return (<ContextMenu items={[{ name: 'Artwork by Brad Barrish', link: 'https://bradbarrish.com' }, '|', { name: 'Settings' }]}>
		<div className={desktop}>

		</div>
	</ContextMenu>);
};
