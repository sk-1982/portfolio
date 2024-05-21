import { css } from '@linaria/core';
import { ContextMenu } from './context-menu.tsx';
import { useWindows } from './window.tsx';
import { useState } from 'preact/hooks';
import { selected } from '@/css';
import cn from 'clsx/lite';
import { usePrograms } from './program.tsx';

import shortcut from '@images/shortcut.webp';
import { DESKTOP_ICONS, IEXPLORE_HOME } from '../config.tsx';
import { VNode } from 'preact';

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
			position: relative;
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
			padding: 2px 3px;
			display: flex;
			flex-wrap: wrap;
			gap: 0 2px;
			text-align: center;
		}
		&.${selected} {
      > div:last-child {
        background: #000080;
	      box-sizing: border-box;
	      padding: 1px 2px;
	      border: 1px dotted #fff;
      }
			> div:first-child > div > div {
				background: #000080;
				opacity: 0.5;
			}
		}
	}
`;

const shortcutIcon = css`
	position: absolute;
	z-index: 1;
	left: 0;
	bottom: 0;
`;

const iconsContainer = css`
	pointer-events: none;
`

export type DesktopIcon = {
	name: string,
	content?: VNode<any>
	icon: string,
	launch?: string[],
	onOpen?: () => void,
	isShortcut?: boolean
};

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
			{DESKTOP_ICONS.map((icon, i) => (<ContextMenu items={[{
				name: 'Open',
				onClick: () => {
					setSelectedIcon(null);
					if (icon.launch)
						programs.openProgram(icon.launch[0], ...icon.launch.slice(1));
					icon.onOpen?.();
				}
			}]} key={i}>
				<div className={cn(selectedIcon === i && selected)}
				     onMouseDown={() => setSelectedIcon(i)} onDblClick={() => {
					setSelectedIcon(null);
					if (icon.launch)
						programs.openProgram(icon.launch[0], ...icon.launch.slice(1))
					icon.onOpen?.();
				}}>
					<div style={{'--m': `url(${icon.icon})`}}>
						{icon.isShortcut && <img src={shortcut} alt="" className={shortcutIcon} /> }
						<div>
							<img draggable={false} src={icon.icon} alt=""/>
							<div/>
						</div>
					</div>
					<div>
						{icon.content ?? icon.name}
					</div>
				</div>
			</ContextMenu>))}
		</div>

	</>);
};
