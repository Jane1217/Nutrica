import React from "react";
import "./ModalWrapper.css";

export default function ModalWrapper({ open, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-mask" />
      <div
        className="modal-content open"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
} 