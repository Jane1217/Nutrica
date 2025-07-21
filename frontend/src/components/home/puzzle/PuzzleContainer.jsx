import React from 'react';
import styles from './PuzzleContainer.module.css';
import { icons } from '../../../utils/icons';

export default function PuzzleContainer({ children, hasSelectedPuzzle = false, onChoosePuzzle }) {
  return (
    <div className={styles.puzzleContainer}>
      {hasSelectedPuzzle ? (
        children
      ) : (
        <>
          <img 
            src={icons.puzzleGrid} 
            alt="Puzzle Grid" 
            className={styles.puzzleGrid}
          />
          <button className={styles.choosePuzzleButton} onClick={onChoosePuzzle}>
            <span className={styles.buttonText}>Choose nutrition puzzle</span>
            <img src={icons.addAlt} alt="Add" className={styles.addIcon} />
          </button>
        </>
      )}
    </div>
  );
} 