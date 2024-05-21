import programs from '@images/programs.webp';
import settings from '@images/settings.webp';
import favorites from '@images/favorites.webp';
import documents from '@images/documents.webp';
import programsSmall from '@images/programs-small.webp';
import iexploreSmall from '@images/iexplore-small.webp';
import github from '@images/github.webp';
import lainSmall from '@images/lain-small.webp';
import calc from '@images/calc.webp';
import iexploreDocumentXs from '@images/iexplore-document-xs.webp';
import iexplore from '@images/iexplore.webp';
import iexploreDocument from '@images/iexplore-document.webp';

import { MenuItem } from './components/start-menu.tsx';
import { IEFavorite, IExploreContext } from './programs/internet-explorer.tsx';
import { VNode } from 'preact';
import { DesktopIcon } from './components/desktop.tsx';

import { Profile } from './pages/profile.tsx';

export const START_MENU: MenuItem[] = [{
	name: 'View Source on Github',
	icon: github,
	link: 'https://github.com/sk-1982'
}, '|', {
	name: 'Programs',
	icon: programs,
	children: [{
		name: 'Accessories',
		icon: programsSmall,
		children: [{
			name: 'Games',
			icon: programsSmall,
			children: [{
				name: 'Lain Bootleg',
				icon: lainSmall,
				launch: ['lain_win.exe']
			}]
		}, {
			name: 'Calculator',
			icon: calc,
			launch: ['calc.exe']
		}, {
			name: 'Notepad',
			icon: calc,
			launch: ['notepad.exe']
		}]
	}, {
		name: 'Internet Explorer',
		icon: iexploreSmall,
		launch: ['iexplore.exe']
	}]
}, {
	name: 'Favorites',
	icon: favorites,
}, {
	name: 'Documents',
	icon: documents
}, {
	name: 'Settings',
	icon: settings
}];

export const IEXPLORE_HOME = 'C:\\WINDOWS\\Desktop\\My Profile.html';

export const DESKTOP_ICONS: DesktopIcon[] = [{
	name: (<>Internet<br />Explorer</>),
	icon: iexplore,
	launch: ['iexplore.exe']
}, {
	name: IEXPLORE_HOME.split(/[\\\/]/g).at(-1)!,
	icon: iexploreDocument,
	launch: ['iexplore.exe', IEXPLORE_HOME]
}, {
	name: 'test.txt',
	icon: iexploreDocument,
	launch: ['notepad.exe', 'C:\\WINDOWS\\Desktop\\test.txt']
}];

export const IE_LOCAL_PAGES = new Map<string, (explorer: IExploreContext) => VNode<any>>([
	[IEXPLORE_HOME.toLowerCase(), Profile]
]);

export const IE_FAVORITES: IEFavorite[] = [{
	name: 'My Profile',
	url: IEXPLORE_HOME,
	icon: iexploreDocumentXs
}, {
	name: 'Virtual 98',
	url: 'https://copy.sh/v86/?profile=windows98'
}];

export const IE_DOMAIN_OVERRIDES = new Map<string, {
	// if set to native, will be not be loaded using theoldnet
	type?: 'native',
	// override year for theoldnet (default 2001)
	year?: number,
	// override scripts for theoldnet (default enabled)
	scripts?: boolean
}>([
	['copy.sh', { type: 'native' }]
]);

export const NOTEPAD_FILES = new Map<string, string>([
	['C:\\WINDOWS\\Desktop\\test.txt'.toLowerCase(), 'test']
]);
