import { SimpleProgram } from '../components/program.tsx';
import calc from '@images/calc.webp';
import { css } from '@linaria/core';
import { DropdownButton } from '../components/dropdown.tsx';
import { MenuBar, MenuBarGroup } from '../components/menu-bar.tsx';
import { ResizeHandle } from '../components/resizable-separator.tsx';

export const CalculatorProgram = () => {
	return (<SimpleProgram name="calc.exe" title="Calculator" width={254} height={246} x={-1} y={-1} icon={calc}>
		<MenuBarGroup>
			<MenuBar>
				<ResizeHandle />
				<DropdownButton items={[{ name: 'Test' }]}>
					Test
				</DropdownButton>
				<DropdownButton items={[{ name: 'Test' }]}>
					Test
				</DropdownButton>
			</MenuBar>
		</MenuBarGroup>

		<div className={css`display: grid; align-items: center; width: 100%; height: 100%`}>Test</div>
	</SimpleProgram>);
};
