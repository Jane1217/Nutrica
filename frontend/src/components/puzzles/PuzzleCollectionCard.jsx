import React from "react";
import styles from "./PuzzleCollectionCard.module.css";
import PuzzlePieceIcon from "./PuzzlePieceIcon";

export default function PuzzleCollectionCard({ puzzle }) {
  return (
    <div className={styles.puzzleCard}>
      <div className={styles.puzzleHeader}>
        <span className={`${styles.collectionLabel} h5`}>Collection</span>
        <span className={`${styles.puzzlesCount} body2`}>{puzzle.count} Puzzles</span>
      </div>
      <div className={`${styles.puzzleTitle} h3`}>{puzzle.title}</div>
      <div className={styles.puzzleDesc}>{puzzle.desc}</div>
      <div className={styles.puzzlePieces}>
        {puzzle.pieces.map((got, i) => (
          <div className={styles.puzzlePieceBox} key={i}>
            {/* 64x64 SVG 占位图，像素内容在背景rect之后、描边rect之前 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="#FFB279"/>
                <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" stroke="#22221B"/>
                <rect x="40" y="14" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="42" y="14" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="32" y="14" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="34" y="14" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="46" y="14" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="40" y="16" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="30.001" y="16" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="42" y="16" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="32" y="16" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="44.001" y="16" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="34" y="16" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="46" y="16" width="2.00001" height="1.99999" fill="#98E673"/>
                <rect x="36.001" y="16" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="48" y="16" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="38.001" y="16" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="40" y="18.001" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="42" y="18.001" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="32" y="18.001" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="44.001" y="18.001" width="2.00001" height="1.99999" fill="#0FA23A"/>
                <rect x="34" y="18.001" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="46" y="18.001" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="36.001" y="18.001" width="2.00001" height="1.99999" fill="#0FA23A"/>
                <rect x="48" y="18.001" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="38.001" y="18.001" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="40" y="20" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="42" y="20" width="2.00001" height="1.99999" fill="#0FA23A"/>
                <rect x="44.001" y="20" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="34" y="20" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="46" y="20" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="36.001" y="20" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="38.001" y="20" width="2.00001" height="1.99999" fill="#0FA23A"/>
                <rect x="40" y="22" width="2.00001" height="1.99999" fill="#0FA23A"/>
                <rect x="30.001" y="22" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="42" y="22" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="32" y="22" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="44.001" y="22" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="34" y="22" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="46" y="22" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="36.001" y="22" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="48" y="22" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="38.001" y="22" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="28" y="24" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="40" y="24" width="2.00001" height="1.99999" fill="#0FA23A"/>
                <rect x="30.001" y="24" width="2.00001" height="1.99999" fill="#FF9F58"/>
                <rect x="42" y="24" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="32" y="24" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="44.001" y="24" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="34" y="24" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="46" y="24" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="36.001" y="24" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="48" y="24" width="2.00001" height="1.99999" fill="#60BF32"/>
                <rect x="38.001" y="24" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="50.001" y="24" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="26" y="26" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="28" y="26" width="2.00001" height="1.99999" fill="#FF9F58"/>
                <rect x="40" y="26" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="30.001" y="26" width="2.00001" height="1.99999" fill="#FF9F58"/>
                <rect x="42" y="26" width="2.00001" height="1.99999" fill="#1D793B"/>
                <rect x="32" y="26" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="34" y="26" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="46" y="26" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="36.001" y="26" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="48" y="26" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="38.001" y="26" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="50.001" y="26" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="16.001" y="40" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="18" y="40" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="20" y="40" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="22" y="40" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="24.001" y="28" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="24.001" y="40" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="26" y="28" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="26" y="40" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="28" y="28" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="28" y="40" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="40" y="28" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="30.001" y="28" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="30.001" y="40" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="42" y="28" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="32" y="28" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="34" y="28" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="36.001" y="28" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="38.001" y="28" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="50.001" y="28" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="16.001" y="42.001" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="18.001" y="42.001" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="20" y="42.001" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="22" y="42.001" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="24.001" y="30" width="2.00001" height="1.99999" fill="#FF9F58"/>
                <rect x="24.001" y="42.001" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="26" y="30" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="26" y="42.001" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="28" y="30" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="40" y="30" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="30.001" y="30" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="42" y="30" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="32" y="30" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="34" y="30" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="36.001" y="30" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="38.001" y="30" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="14" y="44" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="16.001" y="44" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="18" y="44" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="20" y="44" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="22" y="32" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="22" y="44" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="24.001" y="32" width="2.00001" height="1.99999" fill="#FF9F58"/>
                <rect x="24.001" y="44" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="26" y="32" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="28" y="32" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="40" y="32" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="30.001" y="32" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="32" y="32" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="34" y="32" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="36.001" y="32" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="38.001" y="32" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="14" y="46" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="16.001" y="46" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="18" y="46" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="20" y="34" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="20" y="46" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="22" y="34" width="2.00001" height="1.99999" fill="#FF9F58"/>
                <rect x="24.001" y="34" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="26" y="34" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="28" y="34" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="30.001" y="34" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="32" y="34" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="34" y="34" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="36.001" y="34" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="38.001" y="34" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="14" y="48.001" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="16.001" y="48.001" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="20" y="36" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="22" y="36" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="24.001" y="36" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="26" y="36" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="28" y="36" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="30.001" y="36" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="32" y="36" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="34" y="36" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="36.001" y="36" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="18.001" y="38" width="2.00001" height="1.99999" fill="#3B0E09"/>
                <rect x="20" y="38" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="22" y="38" width="2.00001" height="1.99999" fill="#FB6D03"/>
                <rect x="24.001" y="38" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="26" y="38" width="2.00001" height="1.99999" fill="#FB3503"/>
                <rect x="28" y="38" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="30.001" y="38" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="32" y="38" width="2.00001" height="1.99999" fill="#B92F17"/>
                <rect x="34" y="38" width="2.00001" height="1.99999" fill="#3B0E09"/>
                </svg>  
              {/* 像素内容结束 */}
              
          </div>
        ))}
      </div>
    </div>
  );
} 