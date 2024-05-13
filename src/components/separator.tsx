import { css } from '@linaria/core';

export type SeparatorProps = {
	orientation?: 'horizontal' | 'vertical',
	padding?: boolean
};

const separatorVertical = css`
  width: 2px;
  box-sizing: border-box;
  margin: 0 2px;
  border-right: 1px solid #fff;
  border-left: 1px solid #85898d;
`;

const separatorHorizontal = css`
  height: 2px;
  box-sizing: border-box;
  margin: 2px 0;
  border-top: 1px solid #85898d;
  border-bottom: 1px solid #fff;
`;

const separatorPadding = css`margin: 2px`;

export const Separator = ({ orientation, padding }: SeparatorProps) => {
	const className = orientation === 'horizontal' ? separatorHorizontal : separatorVertical;

	return (<div className={`${className} ${padding ? separatorPadding : ''}`} />);
}
