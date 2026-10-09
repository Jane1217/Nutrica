import React from 'react';
import ModalWrapper from '../../common/ModalWrapper';
import styles from './NutritionHelpModal.module.css';

export default function NutritionHelpModal({ open, onClose }) {
  return (
    <ModalWrapper open={open} onClose={onClose} centered={true}>
      <div className={`${styles.modal} nutritionHelpModal`}>
        {/* Close button */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Close nutrition puzzle help">
          <img src="/assets/close.svg" alt="" width="20" height="20" />
        </button>

        {/* Heading with icon and text */}
        <div className={styles.heading}>
          <div className={styles.iconContainer}>
            <img src="/assets/collection.svg" alt="" width="24" height="24" />
          </div>
          <h2 className="h2">How a nutrition puzzle comes together?</h2>
        </div>

        {/* Divider line */}
        <div className={styles.divider}>
          <img src="/assets/divider line.svg" alt="" width="64" height="4" />
        </div>

        {/* Text content */}
        <span className="body1">
          Each puzzle is carefully designed with a specific shape and a set number of pixel blocks.<br/><br/>
          Each pixel block represents a fixed amount of a nutrient.<br/><br/>
          As you log more of that nutrient, the corresponding colored pixel blocks will gradually fill in. Once all blocks are filled, you’ve reached your daily goal!
        </span>

        {/* CTA Button */}
        <button className={styles.ctaButton} onClick={onClose}>
          <span className="h4">Ok</span>
        </button>
      </div>
    </ModalWrapper>
  );
}
