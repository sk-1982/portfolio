import win98 from '@98.css';
import windows98StartText from '@images/start-windows98.webp';
import programs from '@images/programs.webp';
import settings from '@images/settings.webp';
import favorites from '@images/favorites.webp';
import documents from '@images/documents.webp';
import programsSmall from '@images/programs-small.webp';
import iexploreSmall from '@images/iexplore-small.webp';
import github from '@images/github.webp';
import { Separator } from './separator.tsx';
import { ChevronRight } from './chevron-right.tsx';
import { SideMenu, SideMenuItem } from './side-menu.tsx';
import { css } from '@linaria/core';
import { selected } from '@/css';
import { useHoverTrigger } from '../hooks/use-hover-closer.ts';

const startMenu = css`
  min-width: 175px;
  display: flex;
`;

const sideBar = css`
  display: flex;
  width: 21px;
  background: #000080;
  justify-content: end;
  color: white;
  writing-mode: tb;
`;

const menu = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const menuItem = css`
  display: flex;
  align-items: center;
  height: 24px;
  padding: 4px 4px 4px 0;
  position: relative;

  &:hover, &.${selected} {
    background: #000080;
    color: #fff;
  }
`;

const menuItemIcon = css`
  width: 32px;
  display: flex;
  justify-content: end;
  margin-right: 14px;
`;

const menuName = css`padding-right: 16px`;

type MenuItem = '|' | ({
	name: string,
	icon: string,
	children?: SideMenuItem[]
});

const MENU: MenuItem[] = [{
	name: 'View Source on Github',
	icon: github
}, '|', {
	name: 'Programs',
	icon: programs,
	children: [{
		name: 'Accessories',
		icon: programsSmall,
		children: [{
			name: 'Games',
			icon: programsSmall
		}]
	}, {
		name: 'Internet Explorer',
		icon: iexploreSmall
	}]
}, {
	name: 'Favorites',
	icon: favorites,
	// children: [{
	// 	name: 'Test',
	// 	icon: programsSmall
	// }]
}, {
	name: 'Documents',
	icon: documents
}, {
	name: 'Settings',
	icon: settings
}];

type StartMenuProps = {
	className?: string,
	onClose: () => void,
};

const StartMenuItem = ({ item, onClick }: { item: MenuItem & object, onClick?: () => void }) => {
	const menu = (<>
		<div className={menuItemIcon}>
			<img src={item.icon} alt="" draggable={false}/>
		</div>
		<span className={menuName}>{item.name}</span>
		{!!item.children?.length && <ChevronRight/>}
	</>);

	const triggers = useHoverTrigger();

	if (item.children?.length)
		return (<SideMenu items={item.children} openClassName={selected} className={menuItem} onItemSelected={onClick}>
			{ menu }
		</SideMenu>)

	return (<div className={menuItem} onClick={onClick} {...triggers}>
		{ menu }
	</div>);
}

export const StartMenu = ({ className, onClose }: StartMenuProps) => {
	return (<div className={`${win98.window} ${startMenu} ${className ?? ''}`}>
		<div className={sideBar}>
			<img src={windows98StartText} alt="Windows98" draggable={false}/>
		</div>
		<div className={menu}>
			{MENU.map((item, i) => {
				if (item === '|')
					return (<Separator key={i} padding orientation="horizontal"/>)

				return (<StartMenuItem item={item} onClick={() => onClose()} />);
			})}
		</div>
	</div>)
};
