import { Taskbar } from './components/taskbar.tsx';
import { Providers } from './providers.tsx';
import { DynamicProgram, usePrograms } from './components/program.tsx';
import { Desktop } from './components/desktop.tsx';
import { InternetExplorer } from './programs/internet-explorer.tsx';
import { useState, useEffect } from 'preact/hooks';

const Programs = () => {
  const programs = usePrograms();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    programs.queueOpen('iexplore.exe');
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (<>
    <DynamicProgram name="calc.exe" load={async () => {
      const { CalculatorProgram } = (await import('./programs/calculator.tsx'));
      return (<CalculatorProgram />);
    }} />

    <DynamicProgram name="lain_win.exe" load={async () => {
      const { load } = await import('./programs/lain-bootleg.tsx');
      return await load();
    }} />

    <DynamicProgram name="winmine.exe" load={async () => {
      const { Minesweeper } = await import('./programs/minesweeper.tsx');
      return (<Minesweeper />);
    }} />

    <DynamicProgram name="sol.exe" load={async () => {
      const { load } = await import('./programs/solitaire.tsx');
      return await load();
    }} />

    <DynamicProgram name="notepad.exe" load={async () => {
      const { Notepad } = await import('./programs/notepad.tsx');
      return (<Notepad />);
    }} />

    <DynamicProgram name="run" load={async () => {
      const { Run } = await import('./programs/run.tsx');
      return (<Run />);
    }} />

    <InternetExplorer />
  </>);
};

export function App() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', onContextMenu);
    return () => document.removeEventListener('contextmenu', onContextMenu);
  }, []);

  return (<Providers>
    <Desktop />
    <Taskbar />
    <Programs />
  </Providers>);
}
