import { useEffect, useRef } from 'preact/hooks';

export const useChange = (val: any, onChange: () => void, deps: any[] = []) => {
	const lastValue = useRef(val);

	useEffect(() => {
		if (val !== lastValue.current) {
			lastValue.current = val;
			onChange();
		}
	}, [val, ...deps])
};
