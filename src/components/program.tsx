import { ComponentChildren, createContext } from 'preact';
import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks';
import { ContextWindow, useWindows, Window, WindowProps } from './window.tsx';

type Program = {
	name: string,
	onOpen: (...args: string[]) => void
};

const ProgramContext = createContext<{
	register: (program: Program) => void,
	unregister: (name: string) => void,
	openProgram: (name: string, ...args: string[]) => void,
}>({ register: () => {}, unregister: () => {}, openProgram: () => {} });

export const usePrograms = () => useContext(ProgramContext);

export const ProgramContextProvider = ({ children }: { children: ComponentChildren }) => {
	const [programList, setProgramList] = useState<Program[]>([]);
	const openProgram = useCallback((name: string, ...args: string[]) => {
		programList.find(p => p.name === name)?.onOpen(...args);
	}, [programList]);
	const register = useCallback((program: Program) => {
		setProgramList(l => [...l, program]);
	}, [setProgramList]);
	const unregister = useCallback((name: string) => {
		setProgramList(l => l.filter(p => p.name !== name));
	}, [setProgramList]);

	return (<ProgramContext.Provider value={{ openProgram, unregister, register }}>
		{ children }
	</ProgramContext.Provider>)
};

type ProgramProps = {
	name: string,
	onOpen: (...args: string[]) => void,
	children: ComponentChildren
};

export const Program = ({ name, onOpen, children }: ProgramProps) => {
	const context = useContext(ProgramContext);

	useEffect(() => {
		context.register({ name, onOpen });

		return () => context.unregister(name);
	}, [context.register, context.unregister]);

	return (<>{ children }</>);
};

type SimpleProgramProps = { name: string } & Omit<WindowProps, 'isOpen' | 'onClose' | 'id'>;

export const SimpleProgram = ({ name, children, ...windowProps }: SimpleProgramProps) => {
	const [isOpen, setOpen] = useState(false);
	const windows = useWindows();
	const ref = useRef<ContextWindow | null>(null);

	return (<Program name={name} onOpen={() => {
		setOpen(true);
		windows.setActiveWindow(name);
		if (ref.current?.minimized) ref.current?.setMinimized(false);
	}}>
		<Window isOpen={isOpen} onClose={() => setOpen(false)} {...windowProps} id={name} contextRef={ref}>
			{ children }
		</Window>
	</Program>);
};
