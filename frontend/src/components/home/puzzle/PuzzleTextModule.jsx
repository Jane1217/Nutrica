import React from 'react';
import styles from './PuzzleTextModule.module.css';

export default function PuzzleTextModule({ puzzleName, puzzleText, userName, hasSelectedPuzzle = false, categoryName }) {
  return (
    <div className={styles.puzzleTextModule}>
      <span className={`${styles.puzzleName} label`}>
        {hasSelectedPuzzle ? (categoryName && puzzleName ? `${categoryName} · ${puzzleName}` : puzzleName || '') : ''}
      </span>
      <div className={styles.puzzleText}>
        {hasSelectedPuzzle 
          ? (
            puzzleText === 'Puzzle collected! Treat yourself in tomorrow’s challenge!'
              ? (
                <span style={{display: 'inline-block', textAlign: 'center'}}>
                  <img src={"/assets/icon.svg"} alt="success" style={{width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '0.15em'}} />
                  {puzzleText}
                </span>
              )
              : (puzzleText || 'Carrot')
          )
          : `Hey ${userName || 'User'}! Ready to collect today's nutrition puzzle?`
        }
      </div>
    </div>
  );
} 