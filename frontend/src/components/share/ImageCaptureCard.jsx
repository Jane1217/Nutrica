import React, { forwardRef } from 'react';
import styles from './ImageCaptureCard.module.css';
import logo from '/assets/logo.svg';
import { getPageBackground } from '../../utils';

const ImageCaptureCard = forwardRef(function ImageCaptureCard({ puzzleCard, collectionType = 'Magic Garden' }, ref) {
  return (
    <div className={styles.imageArea} ref={ref} style={{ background: getPageBackground(collectionType) }}>
      <img src={logo} alt="logo" className={styles.logo} />
      <div className={styles.puzzleWrapper}>
        {puzzleCard}
      </div>
    </div>
  );
});

export default ImageCaptureCard; 