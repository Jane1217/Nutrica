import React from 'react';
import ModalWrapper from '../common/ModalWrapper';
import styles from './NutritionHelpModal.module.css';

export default function NutritionHelpModal({ open, onClose }) {
  return (
    <ModalWrapper open={open} onClose={onClose} centered={true}>
      <div className={`${styles.modal} nutritionHelpModal`}>
        {/* Close button */}
        <button className={styles.closeButton} onClick={onClose}>
          <img src="/assets/close.svg" alt="close" width="20" height="20" />
        </button>

        {/* Heading with icon and text */}
        <div className={styles.heading}>
          <div className={styles.iconContainer}>
            <img src="/assets/collection.svg" alt="collection" width="24" height="24" />
          </div>
          <h2 className="h2">How a nutrition puzzle comes together?</h2>
        </div>

        {/* Divider line */}
        <div className={styles.divider}>
          <img src="/assets/divider line.svg" alt="divider" width="64" height="4" />
        </div>

        {/* Text content */}
        <p className="body1">
          Each puzzle is carefully designed with a specific shape and a set number of pixel blocks.
          Each pixel block represents a fixed amount of a nutrient.
          As you log more of that nutrient, the corresponding colored pixel blocks will gradually fill in. Once all blocks are filled, you've reached your daily goal!
        </p>

        {/* CTA Button */}
        <button className={styles.ctaButton} onClick={onClose}>
          <span className="h4">Ok</span>
        </button>
      </div>
    </ModalWrapper>
  );
} 