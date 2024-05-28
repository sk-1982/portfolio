import { ComponentChildren } from 'preact';
import { ProgramContextProvider } from './components/program.tsx';
import { WindowContextProvider } from './components/window.tsx';
import { ScreensaverContextProvider } from './components/screensaver.tsx';

export const Providers = ({ children }: { children: ComponentChildren }) => {
	return (<ProgramContextProvider>
		<WindowContextProvider>
			<ScreensaverContextProvider>
				{ children }
			</ScreensaverContextProvider>
		</WindowContextProvider>
	</ProgramContextProvider>)
};
