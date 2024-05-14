import { ComponentChildren, createContext, VNode } from 'preact';
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { ContextWindow, useWindows, Window, WindowProps } from './window.tsx';

type Program = {
	name: string,
	onOpen: (...args: string[]) => void
};

const ProgramContext = createContext<{
	register: (program: Program) => void,
	unregister: (name: string) => void,
	openProgram: (name: string, ...args: string[]) => void,
	queueOpen: (name: string, ...args: string[]) => void,
}>({ register: () => {}, unregister: () => {}, openProgram: () => {}, queueOpen: () => {} });

export const usePrograms = () => useContext(ProgramContext);

export const ProgramContextProvider = ({ children }: { children: ComponentChildren }) => {
	const [programList, setProgramList] = useState<Program[]>([]);
	const queuedLaunches = useRef<Record<string, string[]>>({});
	const openProgram = useCallback((name: string, ...args: string[]) => {
		programList.find(p => p.name === name)?.onOpen(...args);
	}, [programList]);
	const register = useCallback((program: Program) => {
		setProgramList(l => [...l, program]);
		if (queuedLaunches.current[program.name] !== undefined) {
			program.onOpen(...queuedLaunches.current[program.name]);
			delete queuedLaunches.current[program.name];
		}
	}, [setProgramList]);
	const unregister = useCallback((name: string) => {
		setProgramList(l => l.filter(p => p.name !== name));
	}, [setProgramList]);
	const queueOpen = useCallback((name: string, ...args: string[]) => {
		queuedLaunches.current[name] = args;
	}, []);

	return (<ProgramContext.Provider value={{ openProgram, unregister, register, queueOpen }}>
		{ children }
	</ProgramContext.Provider>)
};

type ProgramProps = {
	name: string,
	onOpen: (...args: string[]) => void,
	children?: ComponentChildren
};

export const Program = ({ name, onOpen, children }: ProgramProps) => {
	const context = usePrograms();

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

export const DynamicProgram = ({ name, load }: { name: string, load: () => Promise<VNode<any>> }) => {
	const loading = useRef(false);
	const [loaded, setLoaded] = useState<VNode<any> | null>(null);
	const programs = usePrograms();

	useEffect(() => {
		programs.register({ name, onOpen: (...args) => {
			if (loading.current) return;
			document.body.dataset.loading = (+(document.body.dataset.loading ?? 0) + 1).toString();
			loading.current = true;
			programs.unregister(name);
			programs.queueOpen(name, ...args);
			load().then(res => {
				setLoaded(res);
				const val = +(document.body.dataset.loading ?? 1) - 1;
				if (val)
					document.body.dataset.loading = val.toString();
				else
					delete document.body.dataset.loading;
			})
		} })
	}, []);

	if (loaded)
		return loaded;

	return null;
};
