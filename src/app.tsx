import { Taskbar } from './components/taskbar.tsx';
import { Providers } from './providers.tsx';
import { DynamicProgram, usePrograms } from './components/program.tsx';
import { Desktop } from './components/desktop.tsx';
import { InternetExplorer } from './programs/internet-explorer.tsx';
import { useState, useEffect, useContext } from 'preact/hooks';
import { ScreensaverContext } from './components/screensaver.tsx';
import { choices } from './utils/random.ts';

const SCREENSAVERS = {
  '3d flower box.scr': async () => {
    const { Flowerbox } = (await import('./screensavers/3d-flowerbox'));
    return (<Flowerbox />);
  },
  '3d maze.scr': async () => {
    const { Maze } = await import('./screensavers/3d-maze');
    return (<Maze />);
  }
};

const Screensavers = () => {
  const context = useContext(ScreensaverContext);
  const programs = usePrograms();

  useEffect(() => {
    context.setOnIdle(() => {
      const p = choices(Object.keys(SCREENSAVERS))[0];

      programs.openProgram(p);
    });
  }, [programs]);

  return (<>
    {Object.entries(SCREENSAVERS).map(([k, v]) => <DynamicProgram key={k} name={k} load={v} />)}
  </>);
};

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

    <DynamicProgram name="pinball.exe" load={async () => {
      const { load } = await import('./programs/pinball.tsx');
      return await load();
    }} />

    <DynamicProgram name="doom.exe" load={async () => {
      const { load } = await import('./programs/doom.tsx');
      return await load();
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
    <Screensavers />
    <Desktop />
    <Taskbar />
    <Programs />
  </Providers>);
}
