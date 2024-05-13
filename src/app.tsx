import { Taskbar } from './components/taskbar.tsx';
import { Providers } from './providers.tsx';
import { CalculatorProgram } from './programs/calculator.tsx';

export function App() {

  return (<Providers>
    <CalculatorProgram />
    <Taskbar />
  </Providers>);
}
