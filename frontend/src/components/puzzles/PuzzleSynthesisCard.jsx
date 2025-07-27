import React from "react";
import styles from "./PuzzleSynthesisCard.module.css";

export default function PuzzleSynthesisCard({ category }) {
  
  return (
    <div 
      className={styles.synthesisCard}
      style={{ backgroundColor: category.bgColor || '#fff' }}
    >
      <div className={styles.synthesisHeader}>
        <span className={`${styles.synthesisLabel} h5`}>Synthesis</span>
        <span className={`${styles.puzzlesCount} body2`}>{category.count} Puzzles</span>
      </div>
      <div className={`${styles.synthesisTitle} h3`}>{category.title}</div>
      <div className={styles.synthesisDesc}>{category.desc}</div>
      <div className={styles.synthesisPieces}>
        {category.puzzles && category.puzzles.map((puzzle, idx) => (
          <div
            className={styles.synthesisPieceBox}
            key={puzzle.id || idx}
            style={{ background: puzzle.bgColor || '#fff' }}
          >
            <img src={puzzle.img} alt={puzzle.name} style={{width: '48px', height: '48px', objectFit: 'contain'}} />
          </div>
        ))}
      </div>
      {/* pieces等内容可后续扩展 */}
    </div>
  );
} 