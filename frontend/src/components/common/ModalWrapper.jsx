import React, { useEffect, useRef, useState } from "react";
import "./ModalWrapper.css";

export default function ModalWrapper({ open, children, onClose, size = 'default' }) {
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

  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-mask${animate ? " open" : ""}`} />
      <div
        className={`modal-content${animate ? " open" : ""} ${size === 'auth' ? 'modal-content-auth' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
} 