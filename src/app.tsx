import { Taskbar } from './components/taskbar.tsx';
import { Providers } from './providers.tsx';
import { Window } from './components/window.tsx';
import iexploreSmall from '@images/iexplore-small.webp';
import { useState } from 'preact/hooks';
import win98 from '@98.css';
import { css } from '@linaria/core';

export function App() {
  const [isOpen, setOpen] = useState(true);

  return (<Providers>
    <button onClick={() => setOpen(o => !o)}>{isOpen ? 'Close' : 'Open'}</button>
    <Window title="Tes test test tse tsetsetest test set t sdf sdf sd" width={200} height={100} id="test" x={20} y={20} icon={iexploreSmall} isOpen={isOpen} windowingStrategy="dom" onClose={() => setOpen(false)} className={css`display: flex`}>
        test
        <div className={win98.statusBar + ' ' + css`margin-top: auto`}>
          <div className={win98.statusBarField}>test</div>
          <div className={win98.statusBarField}>test</div>
        </div>

    </Window>
    <Taskbar/>
  </Providers>);
}
