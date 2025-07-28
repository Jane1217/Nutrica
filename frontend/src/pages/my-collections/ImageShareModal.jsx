import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import styles from './ImageShareModal.module.css';
import ImageCaptureCard from '../../components/share/ImageCaptureCard';
import { domToImageBase64, getPageBackground } from '../../utils';

export default function ImageShareModal({ open, puzzleCard, onClose, collectionType = 'Magic Garden' }) {
  const imageRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [show, setShow] = useState(open);
  const [animate, setAnimate] = useState(false);
  const timerRef = useRef(null);
  const lastPuzzleCardRef = useRef(puzzleCard);

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

  // 只要open变化就重置图片和loading
  useEffect(() => {
    if (open) {
      setImgLoading(true);
      setImgUrl(null);
      lastPuzzleCardRef.current = puzzleCard;
    }
  }, [open, puzzleCard]);

  // 截图逻辑，open为true且show为true时才执行，避免多次渲染
  useEffect(() => {
    let cancelled = false;
    if (open && show && imageRef.current) {
      setTimeout(() => {
        if (!imageRef.current) return;
        domToImageBase64(imageRef.current).then(base64 => {
          if (!cancelled) {
            setImgUrl(base64);
            setImgLoading(false);
          }
        }).catch(() => {
          setImgLoading(false);
        });
      }, 50);
    }
    return () => { cancelled = true; };
  }, [open, show, puzzleCard]);

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.centerArea}>
        <div className={`${styles.modalContent} ${styles.animated} ${animate ? styles.open : ''}`}>
          {/* Action Module */}
          <div className={styles.actionArea}>
            <div className={`${styles.tip} h4`}>Tap and hold to save this image and share it with friends on Social Media!</div>
            <button className={styles.closeBtn} onClick={onClose}>
              <h4 className={styles.closeText}>Close</h4>
            </button>
          </div>
          {/* 隐藏的截图区域，仅用于生成图片，不显示 */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <ImageCaptureCard ref={imageRef} puzzleCard={lastPuzzleCardRef.current} collectionType={collectionType} />
          </div>
          {/* 图片加载动画或图片本身 */}
          <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            {imgLoading ? (
              <div className={styles.imgLoading}></div>
            ) : (
              imgUrl && <img 
                src={imgUrl} 
                alt="share preview" 
                className={styles.shareImg} 
                style={{ background: getPageBackground(collectionType) }}
                draggable={false} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 