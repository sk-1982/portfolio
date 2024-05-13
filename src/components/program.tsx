import { ComponentChildren, createContext } from 'preact';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';

type Program = {
	name: string,
	onOpen: (...args: string[]) => void
};

const ProgramContext = createContext<{
	register: (program: Program) => void,
	unregister: (name: string) => void,
	openProgram: (name: string, ...args: string[]) => void,
}>({ register: () => {}, unregister: () => {}, openProgram: () => {} });

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

	return children;
};
