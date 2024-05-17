import { Taskbar } from './components/taskbar.tsx';
import { Providers } from './providers.tsx';
import { DynamicProgram } from './components/program.tsx';
import { Desktop } from './components/desktop.tsx';

export function App() {
  return (<Providers>
    <DynamicProgram name="calc.exe" load={async () => {
      const { CalculatorProgram } = (await import('./programs/calculator.tsx'));
      return (<CalculatorProgram />);
    }} />
    <Desktop />
    <Taskbar />
  </Providers>);
}
