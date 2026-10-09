import React, { useEffect, useRef, useState } from "react";
import "./ModalWrapper.css";

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export default function ModalWrapper({ open, children, onClose, size = 'default', centered = false }) {
  const [show, setShow] = useState(open);
  const [animate, setAnimate] = useState(false);
  const timerRef = useRef(null);
  const contentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

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
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !show || !contentRef.current) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const focusDialog = () => {
      const firstFocusable = contentRef.current?.querySelector(focusableSelector);
      (firstFocusable || contentRef.current)?.focus({ preventScroll: true });
    };
    const frame = requestAnimationFrame(focusDialog);

    return () => {
      cancelAnimationFrame(frame);
      previouslyFocusedRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, show]);

  const handleDialogKeyDown = (event) => {
    if (event.key !== 'Tab' || !contentRef.current) return;

    const focusableElements = [...contentRef.current.querySelectorAll(focusableSelector)]
      .filter((element) => element.getClientRects().length > 0);

    if (focusableElements.length === 0) {
      event.preventDefault();
      contentRef.current.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-mask${animate ? " open" : ""}`} />
      <div
        className={`modal-content${animate ? " open" : ""} modal-content-${size} ${centered ? 'modal-content-centered' : ''}`}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label="Dialog"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
} 
