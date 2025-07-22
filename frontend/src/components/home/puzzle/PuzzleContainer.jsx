import React, { useState } from 'react';
import styles from './PuzzleContainer.module.css';
import { icons } from '../../../utils/icons';
import PixelArtGrid from './PixelArtGrid';
import NutritionPuzzlesModal from '../../../pages/home/puzzles/NutritionPuzzlesModal';

export default function PuzzleContainer({ children, hasSelectedPuzzle = false, onChoosePuzzle, selectedPuzzle, progress = {} }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showUnfinishedBlocks, setShowUnfinishedBlocks] = useState(true);

  return (
    <div className={styles.puzzleContainer} onClick={() => { if (hasSelectedPuzzle) setShowMenu(true); }}>
      {hasSelectedPuzzle ? (
        <div className={styles.pixelGridWrapper}>
          <PixelArtGrid 
            pixelMap={selectedPuzzle?.pixelMap} 
            progress={progress} 
            showGrid={showGrid} 
            showUnfinishedBlocks={showUnfinishedBlocks}
          />
        </div>
      ) : (
        <>
          <div className={styles.pixelGridWrapper}>
            <PixelArtGrid pixelMap={null} progress={{}} showGrid={showGrid} showUnfinishedBlocks={showUnfinishedBlocks} />
          </div>
          <button className={styles.choosePuzzleButton} onClick={onChoosePuzzle}>
            <span className={styles.buttonText}>Choose nutrition puzzle</span>
            <img src={icons.addAlt} alt="Add" className={styles.addIcon} />
          </button>
        </>
      )}
      {/* 右下角圆形图标按钮 */}
      <div className={styles.cornerIconWrapper}>
        <div className={styles.cornerIconCircle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 16" fill="none">
            <path d="M7 9.5V13.5H3V9.5H7ZM13.999 9.5V13.5H10V9.5H13.999ZM7 2.50098V6.5H3V2.50098H7ZM13.999 2.50098V6.5H10V2.50098H13.999Z" stroke="#6A6A61"/>
          </svg>
        </div>
      </div>
      {/* 弹出菜单蒙层 */}
      {showMenu && (
        <div className={styles.menuOverlay} onClick={e => { e.stopPropagation(); }}>
          <div className={styles.menuButtons}>
            <button className={styles.menuBtn} onClick={() => { setShowMenu(false); if (onChoosePuzzle) onChoosePuzzle(); }}>
              <img src="/assets/switch icon.svg" alt="switch" style={{width: 24, height: 24, aspectRatio: '1/1', marginRight: 0}} />
              <span className="h5">Change puzzle</span>
            </button>
            <button className={styles.menuBtn} onClick={() => setShowGrid(g => !g)}>
              <img src="/assets/hide grid icon.svg" alt="hide grid" style={{width: 24, height: 24, aspectRatio: '1/1', marginRight: 0}} />
              <span className="h5">{showGrid ? 'Hide grid' : 'Show grid'}</span>
            </button>
            <button className={styles.menuBtn} onClick={() => setShowUnfinishedBlocks(b => !b)}>
              <img src="/assets/hide unfinished blocks icon.svg" alt="hide unfinished blocks" style={{width: 24, height: 24, aspectRatio: '1/1', marginRight: 0}} />
              <span className="h5">{showUnfinishedBlocks ? 'Hide unfinished blocks' : 'Show unfinished blocks'}</span>
            </button>
          </div>
          <button className={styles.menuClose} onClick={() => setShowMenu(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{width: 20, height: 20, flexShrink: 0, aspectRatio: '1/1'}}>
              <path fillRule="evenodd" clipRule="evenodd" d="M10.008 11.8844L14.7227 16.5938C14.9729 16.8437 15.3122 16.9841 15.666 16.9841C16.0198 16.9841 16.3591 16.8437 16.6093 16.5938C16.8595 16.3439 17 16.005 17 15.6516C17 15.2982 16.8595 14.9592 16.6093 14.7093L11.8928 10L16.6084 5.29067C16.7322 5.16693 16.8304 5.02005 16.8974 4.85841C16.9644 4.69676 16.9988 4.52352 16.9988 4.34858C16.9988 4.17363 16.9642 4.00041 16.8972 3.83879C16.8301 3.67718 16.7318 3.53034 16.6079 3.40667C16.4841 3.28299 16.337 3.1849 16.1752 3.11799C16.0134 3.05108 15.8399 3.01666 15.6648 3.0167C15.4896 3.01674 15.3162 3.05124 15.1544 3.11823C14.9926 3.18522 14.8456 3.28338 14.7218 3.40711L10.008 8.11644L5.29327 3.40711C5.17031 3.27983 5.0232 3.17828 4.86053 3.10839C4.69786 3.0385 4.52288 3.00168 4.34581 3.00006C4.16874 2.99844 3.99311 3.03206 3.82919 3.09896C3.66526 3.16586 3.51632 3.2647 3.39105 3.38971C3.26577 3.51472 3.16668 3.66341 3.09955 3.82708C3.03242 3.99076 2.99859 4.16615 3.00005 4.34302C3.0015 4.51989 3.03821 4.6947 3.10802 4.85725C3.17783 5.0198 3.27936 5.16684 3.40667 5.28978L8.12316 10L3.40756 14.7102C3.28025 14.8332 3.17872 14.9802 3.10891 15.1427C3.03909 15.3053 3.00239 15.4801 3.00093 15.657C2.99948 15.8339 3.0333 16.0092 3.10044 16.1729C3.16757 16.3366 3.26666 16.4853 3.39193 16.6103C3.51721 16.7353 3.66615 16.8341 3.83008 16.901C3.994 16.9679 4.16963 17.0016 4.3467 16.9999C4.52377 16.9983 4.69875 16.9615 4.86142 16.8916C5.02409 16.8217 5.1712 16.7202 5.29416 16.5929L10.008 11.8844Z" fill="#6A6A61"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
} 