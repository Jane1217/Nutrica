import React from 'react';
import styles from './PuzzleTextModule.module.css';

export default function PuzzleTextModule({ puzzleName, puzzleText, userName, hasSelectedPuzzle = false }) {
  return (
    <div className={styles.puzzleTextModule}>
      <span className={`${styles.puzzleName} label`}>
        {hasSelectedPuzzle ? (puzzleName || 'Magic Garden') : ''}
      </span>
      <div className={styles.puzzleText}>
        {hasSelectedPuzzle 
          ? (puzzleText || 'Carrot')
          : `Hey ${userName || 'User'}! Ready to collect today's nutrition puzzle?`
        }
      </div>
    </div>
  );
} 