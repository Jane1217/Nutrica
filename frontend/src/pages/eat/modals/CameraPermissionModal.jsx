import React from 'react';
import '../styles/CameraPermissionModal.css';
import { icons } from '../../../utils';

export default function CameraPermissionModal({ onClose, onOk }) {
  return (
    <div className="camera-permission-overlay">
      <div className="camera-permission-modal">
        <div className="camera-permission-group1">
          <span className="camera-permission-icon">
            <span className="camera-solid">
              <img src={icons.camera} alt="camera" width="24" height="24" />
            </span>
          </span>
          <span className="camera-permission-title h1">Camera Permissions</span>
        </div>
        <svg className="camera-permission-vector" xmlns="http://www.w3.org/2000/svg" width="53" height="4" viewBox="0 0 53 4" fill="none">
          <path d="M2 2H51" stroke="#CDD3C4" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <span className="camera-permission-desc body1">
          The food label scanner only works with camera permissions enabled for <span className="camera-permission-bold">Nutrica.io</span>. Please allow access in the next screen, no images will be saved.
        </span>
        <button className="camera-permission-btn h5" onClick={onOk || onClose}>Ok</button>
      </div>
    </div>
  );
} 