import { SimpleProgram } from '../components/program.tsx';
import calc from '@images/calc.webp';
import { css } from '@linaria/core';


export const CalculatorProgram = () => {
	return (<SimpleProgram name="calc.exe" title="Calculator" width={254} height={246} x={-1} y={-1} icon={calc}>
		<div className={css`display: grid; align-items: center; width: 100%; height: 100%`}>Test</div>
	</SimpleProgram>);
};
