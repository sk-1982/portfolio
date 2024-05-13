import { css } from '@linaria/core';

const chevronRight = css`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

export const ChevronRight = () => {
	return (<div className={chevronRight}>
		<svg width="4" height="7" fill="currentColor">
			<path d="M4 3v1H3v1H2v1H1v1H0V0h1v1h1v1h1v1z" />
		</svg>
	</div>)
};
