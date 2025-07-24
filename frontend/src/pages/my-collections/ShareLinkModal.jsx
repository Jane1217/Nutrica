import React, { useState, useEffect } from 'react';
import styles from './ShareLinkModal.module.css';
import ModalWrapper from '../../components/common/ModalWrapper';
import { getCurrentUser } from '../../utils/user';
import { getShareLink, copyToClipboard } from '../../utils';

export default function ShareLinkModal({ open, onClose, puzzleName = 'carrot', nickname }) {
  const [userId, setUserId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 获取当前用户ID
  useEffect(() => {
    const fetchUserId = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUserId();
  }, []);

  // 根据环境动态生成分享链接
  let BASE_URL = '';
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      BASE_URL = 'https://localhost:3000';
    } else {
      BASE_URL = 'https://my-nutrition-demo-openai-frontend.vercel.app';
    }
  }
  // nickname必须传递真实值
  const params = [
    `nickname=${encodeURIComponent(nickname || '')}`
  ];
  const paramStr = `?${params.join('&')}`;
  const shareLink = getShareLink({ userId, puzzleName, nickname });

  const handleCopy = async () => {
    if (!shareLink) return;
    const ok = await copyToClipboard(shareLink);
    if (ok) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleShare = () => {
    if (!shareLink) return;
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
          <img src="/assets/divider line.svg" alt="divider" className={styles.divider} />
          {/* Link module */}
          <div className={styles.linkModule}>
            <div className={styles.linkWrapper}>
              <span className="body2" style={{ color: 'var(--Neutral-Secondary-Text, #6A6A61)', whiteSpace: 'nowrap', overflowX: 'auto', display: 'block', maxWidth: '180px' }}>{shareLink || 'Loading...'}</span>
            </div>
            <button className={styles.copyBtn} onClick={handleCopy} disabled={!shareLink}>
              <span className="h5" style={{ color: 'var(--Neutral-Primary-Text, #22221B)' }}>
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>
          {/* Share 按钮 */}
          <button className={styles.shareBtn} onClick={handleShare} disabled={!shareLink}>
            <span className="h4" style={{ color: 'var(--Brand-Background, #F3F3EC)' }}>Share</span>
          </button>
        </div>
    </ModalWrapper>
  );
} 