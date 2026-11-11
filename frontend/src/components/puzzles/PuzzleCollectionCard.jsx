import React from "react";
import styles from "./PuzzleCollectionCard.module.css";

export default function PuzzleCollectionCard({ category }) {
  const journey = category.type === 'journey';
  return (
    <div 
      className={styles.puzzleCard}
      style={{ backgroundColor: category.bgColor || '#fff' }}
    >
      <div className={styles.puzzleHeader}>
        <span className={`${styles.collectionLabel} h5`}>{journey ? 'Journey' : 'Collection'}</span>
        <span className={`${styles.puzzlesCount} body2`}>{category.count} {journey ? 'Stages' : 'Puzzles'}</span>
      </div>
      <div className={`${styles.puzzleTitle} h3`}>{category.title}</div>
      <div className={styles.puzzleDesc}>{category.desc}</div>
      <div className={styles.puzzlePieces}>
        {category.puzzles && category.puzzles.map((puzzle, idx) => (
          <React.Fragment key={puzzle.id || idx}>
            {journey && idx > 0 && <span className={styles.stageArrow} aria-hidden="true">›</span>}
            <div
              className={styles.puzzlePieceBox}
              style={{ background: puzzle.bgColor || '#fff' }}
            >
              <img src={puzzle.img} alt={puzzle.name} style={{width: '48px', height: '48px', objectFit: 'contain'}} />
            </div>
          </React.Fragment>
        ))}
      </div>
      {/* pieces等内容可后续扩展 */}
    </div>
  );
} 