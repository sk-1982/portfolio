import { MutableRef, useEffect, useRef } from 'preact/hooks';

type HoverCloserOptions = {
	continueIf: (e: HTMLElement) => boolean,
	onClose: () => void,
	hoverTrigger?: boolean
};

export const useHoverCloser = ({ continueIf, onClose, hoverTrigger }: HoverCloserOptions) => {
	useEffect(() => {
		const mouseDownListener = (e: MouseEvent) => {
			let target = e.target as HTMLElement | null;

			while (target) {
				if (continueIf(target))
					return;
				target = target.parentElement;
			}

			onClose();
		};

		document.addEventListener('mousedown', mouseDownListener);
		if (hoverTrigger !== false)
			document.addEventListener('hovertrigger' as any, mouseDownListener);

		return () => {
			document.removeEventListener('mousedown', mouseDownListener);
			if (hoverTrigger !== false)
				document.removeEventListener('hovertrigger' as any, mouseDownListener);
		}
	}, []);
};

export const useHoverTrigger = (onTriggered?: () => void, wait = 1000) => {
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const clear = () => {
		if (timeout.current) {
			clearTimeout(timeout.current);
			timeout.current = null;
		}
	};

	return ({
		onMouseOver: (e: MouseEvent) => {
			clear();
			timeout.current = setTimeout(() => {
				e.target?.dispatchEvent(new Event('hovertrigger', { bubbles: true, cancelable: true }));
				onTriggered?.();
			}, wait);
		},
		onMouseOut: () => {
			clear();
		}
	})
};
