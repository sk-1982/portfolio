import { Separator } from './separator';
import { css } from '@linaria/core';
import cn from 'clsx/lite';

const handle = css`
  width: 3px;
  height: calc(100% - 4px);
  align-self: center;
	box-shadow: inset -1px -1px gray, inset 1px 1px #fff;
	margin-right: 2px;
	margin-left: 1px;
`;

const container = css`
  height: 100%;
  display: flex;
  margin-right: 2px;
`;

const separator = css`margin-right: 1px`;

export const ResizeHandle = ({ className }: { className?: string }) => (<div className={cn(handle, className)}/>);

export const ResizableSeparator = () => {
	return (<div className={container}>
		<Separator className={separator} />
		<ResizeHandle />
	</div>)
};
