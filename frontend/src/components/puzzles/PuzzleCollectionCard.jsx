import React from "react";
import styles from "./PuzzleCollectionCard.module.css";

export default function PuzzleCollectionCard({ category }) {
  return (
    <div className={styles.puzzleCard}>
      <div className={styles.puzzleHeader}>
        <span className={`${styles.collectionLabel} h5`}>Collection</span>
        <span className={`${styles.puzzlesCount} body2`}>{category.count} Puzzles</span>
      </div>
      <div className={`${styles.puzzleTitle} h3`}>{category.title}</div>
      <div className={styles.puzzleDesc}>{category.desc}</div>
      <div className={styles.puzzlePieces}>
        {category.puzzles && category.puzzles.map((puzzle, idx) => (
          <div
            className={styles.puzzlePieceBox}
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