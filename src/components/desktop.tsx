import { css } from '@linaria/core';
import { ContextMenu } from './context-menu.tsx';
import { useWindows } from './window.tsx';
import { useState } from 'preact/hooks';
import { selected } from '@/css';
import cn from 'clsx/lite';
import { usePrograms } from './program.tsx';

import iexplore from '@images/iexplore.webp';
import iexploreDocument from '@images/iexplore-document.webp';
import { IEXPLORE_HOME } from '../programs/internet-explorer.tsx';

const desktop = css`
	width: 100%;
	height: 100%;
  position: absolute;
	display: grid;
	grid-auto-columns: 75px;
	grid-auto-flow: column;
	grid-template-rows: repeat(auto-fill, 75px);
	grid-template-columns: 75px;
	> div {
		pointer-events: all;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		> div:first-child {
			width: 32px;
			height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 4px;
			img {
				display: block;
			}
			> div {
        position: relative;
			}
			> div > div {
				inset: 0;
				position: absolute;
				mask-image: var(--m);
			}
		}
		> div:last-child {
			background: #008080;
			color: #fff;
			padding: 2px;
			display: flex;
			flex-wrap: wrap;
			gap: 0 2px;
		}
		&.${selected} {
      > div:last-child {
          background: #000080;
      }
			> div:first-child > div > div {
				background: #000080;
				opacity: 0.5;
			}
		}
	}
`;

const iconsContainer = css`
	pointer-events: none;
`

const ICONS = [{
	name: (<>Internet<br />Explorer</>),
	icon: iexplore,
	launch: ['iexplore.exe']
}, {
	name: IEXPLORE_HOME.split(/[\\\/]/g).at(-1),
	icon: iexploreDocument,
	launch: ['iexplore.exe', IEXPLORE_HOME]
}];

export const Desktop = () => {
	const windows = useWindows();
	const programs = usePrograms();
	const [selectedIcon, setSelectedIcon] = useState<number | null>(null);

	return (<>
		<ContextMenu
			items={[{name: 'Artwork by Brad Barrish', link: 'https://bradbarrish.com'}, '|', {name: 'Settings'}]}>
			<div className={desktop} onClick={() => {
				setSelectedIcon(null);
				windows.setActiveWindow(null);
			}}/>
		</ContextMenu>

		<div className={`${desktop} ${iconsContainer}`} onClick={() => windows.setActiveWindow(null)}>
			{ICONS.map((icon, i) => (<ContextMenu items={[{
				name: 'Open',
				onClick: () => {
					setSelectedIcon(null);
					programs.openProgram(icon.launch[0], ...icon.launch.slice(1))
				}
			}]} key={i}>
				<div className={cn(selectedIcon === i && selected)}
				     onMouseDown={() => setSelectedIcon(i)} onDblClick={() => {
					setSelectedIcon(null);
					programs.openProgram(icon.launch[0], ...icon.launch.slice(1))
				}}>
					<div style={{'--m': `url(${icon.icon})`}}>
						<div>
							<img draggable={false} src={icon.icon} alt=""/>
							<div/>
						</div>
					</div>
					<div>
						{icon.name}
					</div>
				</div>
			</ContextMenu>))}
		</div>

	</>);
};
