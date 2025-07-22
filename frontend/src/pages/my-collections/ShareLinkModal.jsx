import React from 'react';
import styles from './ShareLinkModal.module.css';
import ModalWrapper from '../../components/common/ModalWrapper';

export default function ShareLinkModal({ open, onClose, puzzleName = 'carrot', iconUrl }) {
  const BASE_URL = 'https://my-nutrition-demo-openai-frontend.vercel.app';
  const shareLink = `${BASE_URL}/my-collections/detail/${puzzleName.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleShare = () => {
    window.open(shareLink, '_blank');
  };

  return (
    <ModalWrapper open={open} onClose={onClose} centered={true}>
      <div className={styles.modalBox}>
          {/* 右上角关闭按钮 */}
          <div className={styles.closeBtn} onClick={onClose}>
            <img src="/assets/close (2).svg" alt="close" className={styles.closeIcon} />
          </div>
          {/* Heading 区域 */}
          <div className={styles.heading}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconBg}>
                <img src="/assets/collection (1).svg" alt="collection" className={styles.icon} />
              </div>
            </div>
            <div className={`${styles.headingText} h2`}>Share Link generated!</div>
          </div>
          <img src="/assets/divider line (1).svg" alt="divider" className={styles.divider} />
          {/* Link module */}
          <div className={styles.linkModule}>
            <div className={styles.linkWrapper}>
              <span className="body2" style={{ color: 'var(--Neutral-Secondary-Text, #6A6A61)', whiteSpace: 'nowrap', overflowX: 'auto', display: 'block', maxWidth: '180px' }}>{shareLink}</span>
            </div>
            <button className={styles.copyBtn} onClick={handleCopy}>
              <span className="h5" style={{ color: 'var(--Neutral-Primary-Text, #22221B)' }}>Copy Link</span>
            </button>
          </div>
          {/* Share 按钮 */}
          <button className={styles.shareBtn} onClick={handleShare}>
            <span className="h4" style={{ color: 'var(--Brand-Background, #F3F3EC)' }}>Share</span>
          </button>
        </div>
    </ModalWrapper>
  );
} 