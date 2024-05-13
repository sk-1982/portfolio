import { SimpleProgram } from '../components/program.tsx';
import calc from '@images/calc.webp';

export const CalculatorProgram = () => {
	return (<SimpleProgram name="calc.exe" title="Calculator" width={254} height={246} x={-1} y={-1} icon={calc}>
		Test
	</SimpleProgram>);
};
