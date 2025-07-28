import React, { useEffect, useRef, useState } from 'react';
import styles from './CongratulationsModal.module.css';

export default function CongratulationsModal({ open, onClose, firstCompletedAt }) {
  const [show, setShow] = useState(open);
  const [animate, setAnimate] = useState(false);
  const timerRef = useRef(null);

  // 控制show的变化（严格参考ModalWrapper）
  useEffect(() => {
    if (open) {
      setShow(true);
    } else if (show) {
      setAnimate(false);
      timerRef.current = setTimeout(() => setShow(false), 600);
    }
    return () => clearTimeout(timerRef.current);
  }, [open]);

  // show变为true后，下一帧再加open类
  useEffect(() => {
    if (show && open) {
      requestAnimationFrame(() => setAnimate(true));
    }
  }, [show, open]);

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.centerArea}>
        <div className={`${styles.modalContent} ${styles.animated} ${animate ? styles.open : ''}`}>
          {/* Title */}
          <div className={styles.title}>
            <h1>Congratulations! New Pixel Art Unlocked!</h1>
          </div>
          
          {/* Puzzle Card */}
          <div className={styles.puzzleCard}>
            <div className={styles.date}>{firstCompletedAt ? new Date(firstCompletedAt).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</div>
            <div className={styles.collectionInfo}>Salmon Nigiri Boy</div>
            <div className={styles.heading}>
              The cutest sushi sidekick with a wink and a salmon-sized heart!
            </div>
            <img 
              src="/assets/puzzles/salmon_nigiri_boy.svg" 
              alt="Salmon Nigiri Boy" 
              className={styles.puzzleImage} 
            />
          </div>
          
          {/* CTA Button */}
          <button className={styles.ctaButton} onClick={onClose}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
} 