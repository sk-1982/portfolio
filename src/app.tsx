import { Taskbar } from './components/taskbar.tsx';
import { Providers } from './providers.tsx';
import { DynamicProgram, usePrograms } from './components/program.tsx';
import { Desktop } from './components/desktop.tsx';
import { InternetExplorer } from './programs/internet-explorer.tsx';
import { useState, useEffect } from 'preact/hooks';
import { Notepad } from './programs/notepad.tsx';
import { Run } from './programs/run.tsx';

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

    <InternetExplorer />
    <Notepad />
    <Run />
  </>);
};

export function App() {
  return (<Providers>
    <Desktop />
    <Taskbar />
    <Programs />
  </Providers>);
}
