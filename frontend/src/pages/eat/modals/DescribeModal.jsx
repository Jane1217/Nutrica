import React, { useState } from 'react';
import './FoodModal.css';
import ModalWrapper from '../../../components/ModalWrapper';

export default function DescribeModal({ open, onClose, onBack, onCloseModal, onNext }) {
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (description.trim()) {
      onNext(description.trim());
    }
  };

  return (
    <ModalWrapper open={open} onClose={onCloseModal}>
      <div className="eat-modal food-modal">
        <div className="eat-modal-group1 food-modal-group1">
          <div className="food-modal-title-group">
            <button className="food-modal-back-btn" onClick={onBack}>
              <img src="/assets/arrow-left.svg" alt="Back" />
            </button>
            <span className="eat-modal-title">Describe</span>
          </div>
          <button className="eat-modal-close-btn" onClick={onCloseModal}>×</button>
        </div>
        
        <div className="describe-input-container">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="describe-textarea h2"
            placeholder="Type what you ate (e.g., 2 eggs, a slice of bread, 1 avocado)"
            style={{ color: description ? '#000' : undefined }}
          />
        </div>
        
        <button 
          className="food-modal-confirm-btn" 
          onClick={handleNext}
          disabled={!description.trim()}
        >
          Next
        </button>
      </div>
    </ModalWrapper>
  );
} 