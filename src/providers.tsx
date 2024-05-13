import { ComponentChildren } from 'preact';
import { ProgramContextProvider } from './components/program.tsx';
import { WindowContextProvider } from './components/window.tsx';

export const Providers = ({ children }: { children: ComponentChildren }) => {
	return (<ProgramContextProvider>
		<WindowContextProvider>
			{ children }
		</WindowContextProvider>
	</ProgramContextProvider>)
};
