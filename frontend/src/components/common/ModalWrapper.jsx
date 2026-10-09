import React, { useEffect, useRef, useState } from "react";
import "./ModalWrapper.css";

export default function ModalWrapper({ open, children, onClose, size = 'default', centered = false }) {
  const [show, setShow] = useState(open);
  const [animate, setAnimate] = useState(false);
  const timerRef = useRef(null);

  // 控制show的变化
  useEffect(() => {
    if (open) {
      setShow(true);
    } else if (show) {
      setAnimate(false);
      timerRef.current = setTimeout(() => setShow(false), 600); // 动画时长需与css一致
    }
    return () => clearTimeout(timerRef.current);
  }, [open]);

  // show变为true后，下一帧再加open类
  useEffect(() => {
    if (show && open) {
      requestAnimationFrame(() => setAnimate(true));
    }
  }, [show, open]);

  useEffect(() => {
    if (!open || !onClose) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-mask${animate ? " open" : ""}`} />
      <div
        className={`modal-content${animate ? " open" : ""} modal-content-${size} ${centered ? 'modal-content-centered' : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Dialog"
      >
        {children}
      </div>
    </div>
  );
} 
