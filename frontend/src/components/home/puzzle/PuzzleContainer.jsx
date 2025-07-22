import React from 'react';
import styles from './PuzzleContainer.module.css';
import { icons } from '../../../utils/icons';
import PixelArtGrid from './PixelArtGrid';

export default function PuzzleContainer({ children, hasSelectedPuzzle = false, onChoosePuzzle, selectedPuzzle, progress = {} }) {
  return (
    <div className={styles.puzzleContainer}>
      {hasSelectedPuzzle ? (
        <div className={styles.pixelGridWrapper}>
          <PixelArtGrid 
            pixelMap={selectedPuzzle?.pixelMap} 
            progress={progress} 
            showGrid={true} 
          />
        </div>
      ) : (
        <>
          <div className={styles.pixelGridWrapper}>
            <PixelArtGrid pixelMap={null} progress={{}} showGrid={true} />
          </div>
          <button className={styles.choosePuzzleButton} onClick={onChoosePuzzle}>
            <span className={styles.buttonText}>Choose nutrition puzzle</span>
            <img src={icons.addAlt} alt="Add" className={styles.addIcon} />
          </button>
        </>
      )}
    </div>
  );
} 