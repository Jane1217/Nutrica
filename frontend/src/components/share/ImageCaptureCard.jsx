import React, { forwardRef } from 'react';
import styles from './ImageCaptureCard.module.css';
import logo from '/assets/logo.svg';

const ImageCaptureCard = forwardRef(function ImageCaptureCard({ puzzleCard }, ref) {
  return (
    <div className={styles.imageArea} ref={ref}>
      <img src={logo} alt="logo" className={styles.logo} />
      <div className={styles.puzzleWrapper}>
        {puzzleCard}
      </div>
    </div>
  );
});

export default ImageCaptureCard; 