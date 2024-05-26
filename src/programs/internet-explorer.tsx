import { css } from '@linaria/core';
import { VNode } from 'preact';
import cn from 'clsx/lite';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';

import { Program } from '../components/program.tsx';
import { useWindows, Window, WindowState } from '../components/window.tsx';
import { MenuBar, MenuBarGroup } from '../components/menu-bar.tsx';
import { DropdownButton } from '../components/dropdown.tsx';
import { ResizableSeparator, ResizeHandle } from '../components/resizable-separator.tsx';
import { Separator } from '../components/separator.tsx';
import { SmallButton, SmallButtonGroup } from '../components/small-button.tsx';
import { ChevronDown } from '../components/chevron-down.tsx';
import { Close } from '../components/close.tsx';
import { Check } from '../components/check.tsx';

import win98 from '@98.css';
import cursors from '@/cursor.module.scss';

import iexploreFlag from '@images/iexplore-flag.webp';
import iexploreHome from '@images/iexplore-home.webp';
import iexploreHomeDisabled from '@images/iexplore-home-disabled.webp';
import iexploreArrowLeft from '@images/iexplore-arrow-left.webp';
import iexploreArrowLeftDisabled from '@images/iexplore-arrow-left-disabled.webp';
import iexploreArrowRight from '@images/iexplore-arrow-right.webp';
import iexploreArrowRightDisabled from '@images/iexplore-arrow-right-disabled.webp';
import iexploreFavorites from '@images/iexplore-favorites.webp';
import iexploreFavoritesDisabled from '@images/iexplore-favorites-disabled.webp';
import chevronRightLine from '@images/chevron-right-line.webp';
import iexploreGo from '@images/iexplore-go.webp';
import iexploreGoDisabled from '@images/iexplore-go-disabled.webp';
import iexploreDocumentSmall from '@images/iexplore-document-small.webp';
import iexploreSiteSmall from '@images/iexplore-site-small.webp';
import iexploreRefreshDisabled from '@images/iexplore-refresh-disabled.webp';
import iexploreRefresh from '@images/iexplore-refresh.webp';
import globeSmall from '@images/globe-small.webp';
import computerSmall from '@images/computer-small.webp';
import { IE_DOMAIN_OVERRIDES, IE_FAVORITES, IE_LOCAL_PAGES, IEXPLORE_HOME } from '../config.tsx';
import { ErrorWindow } from '../components/error-window.tsx';

const menuBar = css`
	display: flex;
	height: 22px;
`;

const menuBarResizeHandle = css`
	margin-right: 4px;
`;

const flagContainer = css`
	width: 38px;
	display: grid;
	justify-items: center;
	align-items: center;
	background: #000;
	user-select: none;
	pointer-events: none;
`;

const iframe = css`
	border: none;
	height: 100%;
	width: 100%;
`;

const iframeUnfocus = css`pointer-events: none`;

const addressBar = css`
  display: flex;
  height: 22px;
	align-items: center;
`

const resizeHandle = css`
	margin: 0 4px 0 2px;
`;

const omnibar = css`
	padding: 1px 0;
	height: 100%;
	margin: 0 2px 0 4px;
	flex-grow: 1;
	img {
		margin: -1px 0 0 1px;
	}
	input {
		box-shadow: none !important;
		height: 100%;
    padding: 1px 0 0 4px;
    flex-grow: 1;
	}
	> div {
		height: 100%;
		display: flex;
		align-items: center;
	}
`;

const statusBar = css`
	height: 21px;
	margin-top: 2px;
`;

const loadingStatus = css`
	display: flex;
	position: relative;
	padding-left: 24px;
  padding-top: 3px;
  line-height: 1;
	align-items: center;
	div {
    position: absolute;
    left: 2px;
    top: 0;
    bottom: 0;
		display: flex;
		align-items: center;
		pointer-events: none;
	}
`;

const menuBarGroup = css`margin-bottom: 3px`;

const menuBarSeparator = css`margin: 0 0 0 auto`;

const horizontalSeparator = css`margin: 0`;

const blankStatusBarField = css`
	width: 16px;
	flex-grow: 0;
`

const statusBarField = css`
	width: 120px;
	flex-grow: 0;
`;

const controlsBar = css`
	height: 40px;
	display: flex;
	button {
		height: 100%;
		> div {
			display: flex;
		}
	}
`;

const labelPadding = css`padding-left: .85px;`;

const menuItemIconHover = css`display: none`;

const menuIconContainer = css`
	height: 20px; 
	display: flex;
	align-items: center;
	margin: 0 auto 2px auto;
`;

const controlsButton = css`
	> div {
    display: flex;
    flex-direction: column;
    width: 50px;
  }
`;

const hoverContainer = css`
  &:hover .${menuIconContainer} * {
      display: none;
  }
  &:hover .${menuItemIconHover} {
      display: block;
  }
`;

const linksButton = css`
	height: 100%;
	margin-left: 3px;
	button, button > div {
		height: 100%;
		white-space: nowrap;
	}
`;

const goButton = css`
	height: 100%;
	> div {
		display: flex;
		align-items: center;
	}
	img {
		margin: 0 3px 0 0;
	}
`

const windowContent = css`
	display: flex;
	height: 100%;
`;

const pageContainer = css`
	flex-grow: 1;
	background: #fff;
  box-shadow: inset 1px 1px gray, inset -1px -1px #fff, inset -2px -2px #dfdfdf, inset 2px 2px #000;
  padding: 2px;
	* {
		font-family: serif;
	}
`;

const pageContent = css`
	* {
    user-select: text;
    filter: url(#no-antialiasing);
    @supports selector(::-webkit-scrollbar) {
      filter: url(#no-antialiasing-webkit);
    }
	}
`;

const favoritesPanel = css`
	width: 200px;
	flex-shrink: 0;
	margin-right: 3px;
`;

const favoritesHeader = css`
	height: 20px;
	padding-left: 5px;
	margin-bottom: -2px;
	display: flex;
	align-items: center;
	button {
		margin-left: auto;
		padding: 4px 5px 2px 5px;
		min-height: 0;
		height: auto;
	}
`;

const favoritesContent = css`
	background: #fff;
	height: 100%;
	margin-top: -2px;
	padding: 0 2px 0 3px;
	> div {
		display: flex;
		align-items: center;
		height: 20px;
		line-height: 1;
		img {
			margin: 0 4px 1px 0;
		}
		&:hover {
			text-decoration: underline;
			color: #000080;
		}
    &:active {
      color: #fff;
      background: #000080;
    }
	}
`;

const favoritesButtonActive = css`
	&:not(:hover) {
    background: repeating-conic-gradient(silver 0% 25%, #fff 0% 50%) 0 / 2px 2px;
	}
`;

const favoritesMenuItem = css`
	height: 20px !important;
`;

const favoritesIconContainer = css`
	margin: 0 10px 1px -1px;
`;

export const comicSans = css`
  font-family: "Comic Sans MS", "Comic Sans", cursive !important;
	filter: url(#black-white) !important;
	&:is(a, p, b, span) {
    @supports selector(::-webkit-scrollbar) {
      filter: url(#black-white-webkit) !important;
    }
	}
`;

export type IExploreContext = {
	open: (url: string) => void
};

export type IEFavorite = {
	name: string,
	url: string,
	icon?: string
};

export const InternetExplorer = () => {
	const [isOpen, setOpen] = useState(false);
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const [favoritesOpen, setFavoritesOpen] = useState(false);
	const [error, setError] = useReducer((state, action: string) => {
		return action;
	}, '');
	const inputRef = useRef<HTMLInputElement | null>(null);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const lastHistoryIndex = useRef(historyIndex);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		if (inputRef.current)
			inputRef.current.value = history[historyIndex];
	}, [inputRef, history, historyIndex]);

	const pushHistory = useCallback((url: string) => {
		const newHistory = [...history.slice(0, historyIndex + 1), url];
		setHistory(newHistory);
		setHistoryIndex(newHistory.length - 1);
	}, [history, historyIndex]);

	const prevHistory = useCallback(() => {
		setHistoryIndex(Math.max(historyIndex - 1, 0));
	}, [historyIndex]);

	const nextHistory = useCallback(() => {
		setHistoryIndex(Math.min(historyIndex + 1, history.length - 1));
	}, [history.length, setHistoryIndex, historyIndex]);

	const windows = useWindows();

	const iexplore = useMemo(() => {
		return { open: pushHistory };
	}, [pushHistory]);

	const getUrl = useCallback((val: string, ignoreHistory: boolean = false) => {
		val = val.trim();

		if (/^[A-Z]:/i.test(val)) {
			if (IE_LOCAL_PAGES.has(val.toLowerCase())) {
				if (val !== history[historyIndex] || ignoreHistory)
					return val;
			} else {
				setError(`Cannot find the file or item '${val}'. Make sure the path and file name are correct. Type 'go <SearchText>' to use AutoSearch.`)
			}

			return null;
		}

		let url: string;

		if (/^https?:/i.test(val) ||
			/^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/i.test(val.split('/')[0])) {
			url = 'https://' + val.replace(/^https?:\/{0,2}/i, '');
		} else {
			url = `https://wiby.me?q=${encodeURIComponent(val.replace(/^go\s+/i, ''))}`
		}

		return url;
	}, [history]);

	const content = useCallback((status: WindowState): [boolean, string, VNode<any> | null] => {
		const last = lastHistoryIndex.current;
		lastHistoryIndex.current = historyIndex;

		const url = history[historyIndex];
		if (!url) {
			setLoading(false);
			return [false, '', null];
		}

		const localPage = IE_LOCAL_PAGES.get(url.toLowerCase());
		if (localPage){
			setLoading(false);
			return [true, iexploreDocumentSmall, localPage(iexplore)];
		}

		let u: URL;

		try {
			u = new URL(url);
		} catch (e) {
			setLoading(false);
			return [false, '', null];
		}
		const overrides = IE_DOMAIN_OVERRIDES.get(u.host) ?? IE_DOMAIN_OVERRIDES.get(u.host.replace(/^www\./, ''));

		let iframeSrc = overrides?.type === 'native' ? u.toString() : `https://theoldnet.com/get?${new URLSearchParams({
			url: u.href.slice(u.protocol.length + 2),
			year: overrides?.year?.toString() ?? '2001',
			scripts: overrides?.scripts?.toString() ?? 'true',
			decode: 'true'
		})}`;

		if (iframeRef.current && iframeSrc === iframeRef.current.src && last !== historyIndex) {
			iframeRef.current.src = 'data:text/html,';
			iframeRef.current.src = iframeSrc;
		}

		return [false, iexploreSiteSmall, (<iframe ref={iframeRef} src={iframeSrc}
          onLoad={() => setLoading(false)}
          referrerpolicy="no-referrer"
          className={cn(iframe, (status.resizing || !status.focused) && iframeUnfocus)} />)];
	}, [history, historyIndex, iexplore, iframeRef]);

	const renderWindow = useCallback((status: WindowState) => {
		if (!isOpen) return null;

		const [isLocal, icon, page] = content(status);

		const submit = () => {
			const input = inputRef.current;
			if (!input) return;

			input.blur();
			const url = getUrl(input.value);

			if (url)
				pushHistory(url);
		};

		const refresh = () => {
			if (iframeRef.current) {
				const src = iframeRef.current.src;
				iframeRef.current.src = 'data:text/html,';
				iframeRef.current.src = src;
			}
		};

		const favorites = IE_FAVORITES.map(({ name, url, icon }) => ({
			name,
			onClick: () => pushHistory(url),
			icon: icon ?? iexploreSiteSmall
		}));

		return (<>
			<MenuBarGroup className={menuBarGroup}>
				<div className={menuBar}>
					<MenuBar>
						<ResizeHandle className={menuBarResizeHandle}/>
						<DropdownButton items={[{
							name: 'Close',
							onClick: () => setOpen(false)
						}]}>File</DropdownButton>
						<DropdownButton items={[{
							name: 'Go To',
							children: [{
								name: 'Back',
								onClick: prevHistory,
								disabled: historyIndex === 0
							}, {
								name: 'Forward',
								onClick: nextHistory,
								disabled: historyIndex >= history.length - 1
							}, '|', {
								name: 'Home Page',
								onClick: () => history[historyIndex] !== IEXPLORE_HOME && pushHistory(IEXPLORE_HOME)
							}, '|', ...history.map((url, i) => ({
								name: url,
								onClick: () => setHistoryIndex(i),
								icon: historyIndex === i ? (<Check/>) : undefined
							}))]
						}, {
							name: 'Refresh',
							onClick: refresh
						}]}>View</DropdownButton>
						<DropdownButton itemClass={favoritesMenuItem} iconContainerClass={favoritesIconContainer} items={favorites}>Favorites</DropdownButton>
					</MenuBar>

					<Separator className={menuBarSeparator} />

					<div className={flagContainer}>
						<img src={iexploreFlag} alt="" />
					</div>
				</div>

				<Separator orientation="horizontal" className={horizontalSeparator} />

				<div className={controlsBar}>
					<ResizeHandle className={resizeHandle} />
					<SmallButtonGroup className={hoverContainer}>
						<SmallButton padding={0} className={controlsButton} disabled={historyIndex === 0} onClick={prevHistory}>
							<div className={menuIconContainer}>
								<img src={iexploreArrowLeftDisabled} alt=""/>
								<img src={iexploreArrowLeft} className={menuItemIconHover} alt=""/>
							</div>
							<span>Back</span>
						</SmallButton>
						<DropdownButton items={history.slice(0, historyIndex).map(((u, i) => ({
							name: u,
							onClick: () => setHistoryIndex(i)
						}))).reverse()} padding={4} disabled={historyIndex === 0}>
							<ChevronDown/>
						</DropdownButton>
					</SmallButtonGroup>

					<SmallButtonGroup className={hoverContainer}>
						<SmallButton padding={0} className={controlsButton} disabled={historyIndex >= history.length - 1} onClick={nextHistory}>
							<div className={menuIconContainer}>
								<img src={iexploreArrowRightDisabled} alt=""/>
								<img src={iexploreArrowRight} className={menuItemIconHover} alt=""/>
							</div>
							<span>Forward</span>
						</SmallButton>
						<DropdownButton items={history.slice(historyIndex + 1).map(((u, i) => ({
							name: u,
							onClick: () => setHistoryIndex(i + historyIndex + 1)
						})))} padding={4} disabled={historyIndex >= history.length - 1}>
							<ChevronDown/>
						</DropdownButton>
					</SmallButtonGroup>

					<SmallButton padding={0} className={`${controlsButton} ${hoverContainer}`}
					             onClick={() => history[historyIndex] !== IEXPLORE_HOME && pushHistory(IEXPLORE_HOME)}>
						<div className={menuIconContainer}>
							<img src={iexploreHomeDisabled} alt=""/>
							<img src={iexploreHome} className={menuItemIconHover} alt=""/>
						</div>
						<span className={labelPadding}>Home</span>
					</SmallButton>

					<SmallButton padding={0} className={`${controlsButton} ${hoverContainer}`}
					             onClick={refresh}>
						<div className={menuIconContainer}>
							<img src={iexploreRefreshDisabled} alt=""/>
							<img src={iexploreRefresh} className={menuItemIconHover} alt=""/>
						</div>
						<span>Refresh</span>
					</SmallButton>

					<Separator />

					<SmallButton padding={0} className={`${controlsButton} ${favoritesOpen ? favoritesButtonActive : hoverContainer}`}
					             active={favoritesOpen}
					             onClick={() => setFavoritesOpen(f => !f)}>
						<div className={menuIconContainer}>
							{favoritesOpen ? <img src={iexploreFavorites} alt="" />: <><img src={iexploreFavoritesDisabled} alt=""/>
							<img src={iexploreFavorites} className={menuItemIconHover} alt=""/></>}
						</div>
						<span className={labelPadding}>Favorites</span>
					</SmallButton>
				</div>

				<Separator orientation="horizontal" className={horizontalSeparator}/>

				<div className={addressBar}>
					<ResizeHandle className={resizeHandle}/>
					Address
					<div className={omnibar}>
						<div className={win98.sunkenPanel}>
							<img src={icon} alt=""/>
							<input type="text" ref={inputRef} onKeyDown={e => {
								if (!e.target) return;
								const input = e.target as HTMLInputElement;
								if (e.key === 'Escape') {
									input.blur();
									input.value = history[historyIndex];
								} else if (e.key === 'Enter') {
									submit();
								}
							}} />
						</div>
					</div>
					<SmallButton className={`${goButton} ${hoverContainer}`} padding={9} onClick={submit}>
						<div className={menuIconContainer}>
							<img src={iexploreGoDisabled} alt=""/>
							<img src={iexploreGo} className={menuItemIconHover} alt=""/>
						</div>
						Go
					</SmallButton>
					<ResizableSeparator/>
					Links
					<DropdownButton padding={2} dropdownClass={linksButton} items={favorites} itemClass={favoritesMenuItem} iconContainerClass={favoritesIconContainer}>
						<img src={chevronRightLine} alt=""/>
						<img src={chevronRightLine} alt=""/>
					</DropdownButton>
				</div>
			</MenuBarGroup>
			<div className={windowContent}>
				{favoritesOpen && <MenuBarGroup className={favoritesPanel}>
					<div className={favoritesHeader}>
						Favorites
						<SmallButton onClick={() => setFavoritesOpen(false)}>
							<Close />
						</SmallButton>
					</div>
					<Separator orientation="horizontal" />
					<div className={favoritesContent}>
						{IE_FAVORITES.map((item, index) => (<div key={index} className={cursors.pointer} onClick={() => pushHistory(item.url)}>
							<img src={item.icon ?? iexploreSiteSmall} alt="" />
							<span>{ item.name }</span>
						</div>))}
					</div>
				</MenuBarGroup>}
				<div className={pageContainer}>
					<svg width="100%" height="100%">
						{([['no-antialiasing', '0 0.35 0.65 1'],
							['no-antialiasing-webkit', '0 0.35 0.5 0.6 0.8 1'],
							['black-white', '0 1'],
							['black-white-webkit', '0 0.5 1']
						] as const).map(([id, table]) => (<filter id={id} key={id}>
							<feComponentTransfer>
								<feFuncA type="discrete" tableValues={table} />
							</feComponentTransfer>
						</filter>))}
						<foreignObject width="100%" height="100%" className={`${pageContent} ${cursors.pageContainer}`}>
							{page}
						</foreignObject>
					</svg>
				</div>
			</div>
			<div className={`${win98.statusBar} ${statusBar}`}>
				<div className={`${win98.statusBarField} ${loadingStatus}`}>
					<div><img src={iexploreSiteSmall} alt="" /></div>
					{ loading ? 'Loading...' : 'Done' }
				</div>
				<div className={`${win98.statusBarField} ${blankStatusBarField}`} />
				<div className={`${win98.statusBarField} ${blankStatusBarField}`} />
				<div className={`${win98.statusBarField} ${statusBarField} ${loadingStatus}`}>
					<div><img src={isLocal ? computerSmall : globeSmall} alt=""/></div>
					{isLocal ? 'My Computer' : 'Internet'}
				</div>
			</div>
		</>);
	}, [isOpen, pushHistory, prevHistory, history, nextHistory, historyIndex, content, favoritesOpen, inputRef, loading, getUrl]);

	return (<Program name="iexplore.exe" onOpen={useCallback((location: string) => {
		windows.setActiveWindow("iexplore.exe");

		if (isOpen) {
			if (!location) return;
			const u = getUrl(location)
			if (u)
				return pushHistory(u);
		}

		const u = getUrl(location || IEXPLORE_HOME, true);
		if (!u) return;
		setHistoryIndex(0);
		setHistory([u]);
		setOpen(true);
		setTimeout(() => {
			if (inputRef.current)
				inputRef.current.value = u;
		}, 0);
	}, [windows, isOpen, pushHistory, getUrl])}>
		<ErrorWindow title="Address Bar" id="iexplore-address" error={error}
		             onClose={() => setError('')} />

		<Window title={`${history[historyIndex]} - Microsoft Internet Explorer`}
		        id="iexplore.exe"
		        minWidth={300}
		        minHeight={300}
		        x={-1}
		        y={-1}
		        cornerHandle
		        icon={iexploreDocumentSmall}
		        width={window.innerWidth - 100}
		        height={window.innerHeight - 100}
		        maximized={window.innerWidth < 680}
		        isOpen={isOpen} onClose={() => setOpen(false)} resizable>
			{ renderWindow }
		</Window>
	</Program>)
};
