import { Separator } from './separator';
import { css } from '@linaria/core';

const handle = css`
  width: 3px;
  height: calc(100% - 4px);
  align-self: center;
  box-sizing: border-box;
  position: relative;

  border-top: 1px solid white;
  border-left: 1px solid white;
  border-right: 1px solid #85898d;
  border-bottom: 1px solid #85898d;

  &::before, &::after {
    position: absolute;
    content: " ";
    width: 1px;
    height: 1px;
    background: #85898d;
  }

  &::before {
    bottom: -1px;
    right: 1px;
  }

  &::after {
    top: -1px;
    left: 1px;
  }
`;

const container = css`
  height: 100%;
  display: flex;
  margin-right: 2px;
`;

export const ResizableSeparator = () => {
	return (<div className={container}>
		<Separator />
		<div className={handle} />
	</div>)
};
