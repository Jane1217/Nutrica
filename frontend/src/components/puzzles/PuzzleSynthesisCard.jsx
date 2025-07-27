import React from "react";
import styles from "./PuzzleSynthesisCard.module.css";

export default function PuzzleSynthesisCard({ category }) {
  
  return (
    <div 
      className={styles.synthesisCard}
      style={{ backgroundColor: category.bgColor || '#fff' }}
    >
      <div className={styles.synthesisHeader}>
        <span className={`${styles.synthesisLabel} h5`}>Recipe</span>
        <span className={`${styles.puzzlesCount} body2`}>{category.count} Puzzles</span>
      </div>
      <div className={`${styles.synthesisTitle} h3`}>{category.title}</div>
      <div className={styles.synthesisDesc}>{category.desc}</div>
      <div className={styles.synthesisPieces}>
        {category.puzzles && category.puzzles.map((puzzle, idx) => (
          <React.Fragment key={puzzle.id || idx}>
            <div
              className={styles.synthesisPieceBox}
              style={{ background: puzzle.bgColor || '#fff' }}
            >
              <img src={puzzle.img} alt={puzzle.name} style={{width: '48px', height: '48px', objectFit: 'contain'}} />
            </div>
            {idx < category.puzzles.length - 1 && (
              <div className={styles.synthesisOperator}>+</div>
            )}
          </React.Fragment>
        ))}
        <div className={styles.synthesisOperator}>=</div>
        {category.resultImage && (
          <img src={category.resultImage} alt="Synthesis Result" style={{width: '64px', height: '64px', objectFit: 'contain'}} />
        )}
      </div>
      {/* pieces等内容可后续扩展 */}
    </div>
  );
} 