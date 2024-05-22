import { SimpleProgram } from '../components/program.tsx';
import calc from '@images/calc.webp';
import win98 from '@98.css';
import { css } from '@linaria/core';
import { DropdownButton } from '../components/dropdown.tsx';
import { MenuBar } from '../components/menu-bar.tsx';
import cn from 'clsx/lite';
import {
	Dispatch,
	StateUpdater,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useState
} from 'preact/hooks';
import { createContext } from 'preact';
import { HTMLAttributes } from 'preact/compat';

const calcContainer = css`
	padding: 0 8px 8px 8px;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

const resultDisplay = css`
	height: 26px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: end;
`;

const buttons = css`
	display: grid;
	flex-grow: 1;
	grid-template-columns: 36px 1fr;
	grid-template-rows: 29px 1fr;
	gap: 7px 10px;
	margin-top: 11px;
	button {
		min-width: 0;
		padding: 0;
	}
`;

const memoryStatus = css`
	background: transparent;
	height: 26px;
	width: 27px;
	align-self: center;
	justify-self: center;
	display: flex;
	align-items: center;
	justify-content: center;
`

const topButtons = css`
	display: grid;
	grid-template-columns: repeat(3, 62px);
	gap: 3px;
`;

const sideButtons = css`
	display: grid;
	grid-template-rows: repeat(4, 29px);
	gap: 4px;
`;

const mainButtons = css`
	display: grid;
	grid-template-rows: repeat(4, 29px);
	grid-template-columns: repeat(5, 36px);
	gap: 4px 3px;
`;

const blue = css`
	color: blue;
	* { color: blue }
`

const red = css`
		color: red;
		* { color: red }
`;

const p = css`padding-left: 0.85px`;
const p2 = css`padding-left: 0.5px`;

const menuButton = css`min-height: 18px; height: 18px;`

const BINARY_OPS = new Set(['+', '-', '/', '*']);
const UNARY_OPS = new Set(['sqrt', '1/x', '%']);

const parse = (num: string | number) => typeof num === 'string' ? parseFloat(num || '0') : num;

const KeypressContext = createContext<{
	keyPress: string | null,
	setKeyPress: Dispatch<StateUpdater<string | null>>
}>({ keyPress: null, setKeyPress: () => {}  });

const CalculatorButton = ({ className, onClick, children, ...props }: Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> & { onClick: () => void }) => {
	const { keyPress, setKeyPress } = useContext(KeypressContext);
	const [active, setActive] = useState(false);

	useEffect(() => {
		if (keyPress === children) {
			setKeyPress(null);
			setActive(true);
			onClick();
			setTimeout(() => setActive(false), 50);
		}
	}, [children, keyPress, onClick]);

	return (<button {...props} onClick={onClick} className={cn(active && win98.active)}>
		<span className={className}>{ children }</span>
	</button>)
};

const KEYDOWN = new Map<string, string>([
	...[...new Array(10)]
		.map((_, i) => [i.toString(), i.toString()] as const),
	...['+', '-', '=', '/', '%', '*', '.', 'Backspace'].map(x => [x, x] as const),
	[',', '.'],
	['Enter', '='],
	['Escape', 'C'],
	['Delete', 'CE']
]);

export const CalculatorProgram = () => {
	const [{ input, result, recent }, dispatch] = useReducer((state, action: Partial<{ input: string | number, result: string | number }>) => {
		const val = Object.entries(action)
		return { ...state, ...action, recent: val.filter(x => x[1] && x[1] !== '0')[0]?.[0] ?? val[0][0] };
	}, { input: '0'  as number | string, result: '0' as number | string, recent: 'input' });
	const [operator, setOperator] = useState<string | null>(null)
	const [lastBinaryOpEq, setLastBinaryOpEq] = useState(false);
	const [lastInputOp, setLastInputOp] = useState(false);
	const [memory, setMemory] = useState<number | null>(null)
	const [inputReset, setInputReset] = useState(false);
	const [keyPress, setKeyPress] = useState<string | null>(null);

	const contextVal = useMemo(() => ({ keyPress, setKeyPress }), [keyPress, setKeyPress]);

	const recentVal = recent === 'input' ? input : result;
	const display = recentVal.toString().replace(/^\./, '0.') || '0';
	const operators = new Map([
		[null, () => dispatch({ input: '0', result: input })],
		['+', () => dispatch({ result: parse(result) + parse(input) })],
		['-', () => dispatch({ result: parse(result) - parse(input) })],
		['/', () => dispatch({ result: parse(result) / parse(input) })],
		['*', () => dispatch({ result: parse(result) * parse(input) })],
		['sqrt', () => dispatch({ input: Math.sqrt(parse(recentVal)) })],
		['1/x', () => dispatch({ input: 1 / parse(recentVal) })],
		['%', () => dispatch({ input: parse(recentVal) / 100 * parse(result) })]
	]);

	const inputVal = parse(input);
	const strInput = input.toString();

	const reset = () => {
		dispatch({ input: '0', result: '0' })
		setOperator(null);
		setLastBinaryOpEq(false);
		setInputReset(false);
		setLastInputOp(false);
	};

	return (<SimpleProgram name="calc.exe" title="Calculator" width={254} x={-1} y={-1} icon={calc}
	                       onKeyDown={useCallback((e: KeyboardEvent) => {
													 const action = KEYDOWN.get(e.key);
													 if (!action) return;
													 setKeyPress(action);
													 e.preventDefault();
	                       }, [])}
	                       onOpen={() => {
		                       reset();
		                       setMemory(null);
	                       }}>
		<MenuBar>
			<DropdownButton items={[{
				name: 'Copy',
				onClick: () => navigator.clipboard.writeText(display)
			}]} className={menuButton}>
				Edit
			</DropdownButton>
		</MenuBar>
		<KeypressContext.Provider value={contextVal}>
			<div className={calcContainer}>
				<div className={`${win98.sunkenPanel} ${resultDisplay}`}>
					{display.includes('.') ? display : `${display}.`}
				</div>
				<div className={buttons}>
					<div className={`${win98.sunkenPanel} ${memoryStatus}`}>
						{memory !== null && 'M'}
					</div>
					<div className={`${topButtons} ${red}`}>
						<CalculatorButton className={p2} onClick={() => {
							if (inputReset || recent !== 'input') return;
							dispatch({input: strInput.slice(0, -1)});
						}}>Backspace</CalculatorButton>
						<CalculatorButton onClick={() => dispatch({input: '0'})} className={p2}>CE</CalculatorButton>
						<CalculatorButton onClick={reset} className={p2}>C</CalculatorButton>
					</div>
					<div className={`${sideButtons} ${red}`}>
						<CalculatorButton className={p2} onClick={() => setMemory(null)}>MC</CalculatorButton>
						<CalculatorButton className={p2}
						                  onClick={() => memory !== null && dispatch({input: memory})}>MR</CalculatorButton>
						<CalculatorButton onClick={() => setMemory(parse(recentVal))}>MS</CalculatorButton>
						<CalculatorButton onClick={() => setMemory(m => (m ?? 0) + parse(recentVal))}>M+</CalculatorButton>
					</div>
					<div className={`${mainButtons} ${blue}`}>
						{[...new Array(10)].map((_, i) => (<CalculatorButton key={i}
						                                                     style={{gridRow: `${Math.floor(-i / 3 + 4)}`}}
						                                                     onClick={() => {
							                                                     const val = recent === 'input' && !inputReset ? input : '';
																																	 setLastInputOp(false);
							                                                     setInputReset(false);
							                                                     dispatch({input: `${val}${i}`.replace(/^0+/, '')});
						                                                     }}>{i.toString()}</CalculatorButton>))}
						{['/', '*', '-', '+', 'sqrt', '%', '1/x', '=']
							.map(((op, i) => (<CalculatorButton key={op}
							                                    className={cn((i < 4 || op === '=') && red, op === 'sqrt' || op === '/' && p)}
							                                    style={{
								                                    gridRow: `${i % 4 + 1}`,
								                                    gridColumn: `${Math.floor(i / 4 + 4)}`
							                                    }}
							                                    onClick={() => {
								                                    if (UNARY_OPS.has(op)) {
									                                    operators.get(op)?.();
									                                    setInputReset(true);
									                                    return;
								                                    }

																										if (lastInputOp) return;

								                                    if (op === '=' || !lastBinaryOpEq)
									                                    operators.get(operator)?.();
								                                    if (BINARY_OPS.has(op)) {
									                                    setOperator(op);
																											setLastInputOp(true);
								                                    }
								                                    setLastBinaryOpEq(op === '=');
							                                    }}>{op}</CalculatorButton>)))}
						<CalculatorButton onClick={() => dispatch({input: -inputVal})}>+/-</CalculatorButton>
						<CalculatorButton
							onClick={() => !strInput.includes('.') && dispatch({input: `${input}.`})}>.</CalculatorButton>
					</div>
				</div>
			</div>
		</KeypressContext.Provider>
	</SimpleProgram>);
};
