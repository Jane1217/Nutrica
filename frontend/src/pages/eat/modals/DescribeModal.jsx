import React, { useState, useEffect } from 'react';
import '../styles/FoodModal.css';
import ModalWrapper from '../../../components/common/ModalWrapper';
import Toast from '../../../components/common/Toast';
import { icons } from '../../../utils';
import { parseFoodDescription } from '../../../utils';

export default function DescribeModal({ open, onClose, onBack, onCloseModal, onNext }) {
  const [description, setDescription] = useState('');
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(false);

  // 当modal打开时，重置所有状态
  useEffect(() => {
    if (open) {
      setDescription('');
      setLoading(false);
      setErrorToast({ show: false, message: '' });
    } else {
      // 当modal关闭时，也重置所有状态
      setDescription('');
      setLoading(false);
      setErrorToast({ show: false, message: '' });
    }
  }, [open]);

  const handleNext = async () => {
    if (!description.trim()) {
      setErrorToast({ show: true, message: 'Input cannot be empty' });
      return;
    }

    setLoading(true);
    setErrorToast({ show: false, message: '' });
    
    try {
      const response = await parseFoodDescription(description.trim());
      if (response.success) {
        onNext(description.trim(), response.data);
      } else {
        setErrorToast({ show: true, message: 'Food description not recognized' });
      }
    } catch (error) {
      let errorMessage = 'Food description not recognized';
      if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection'))) {
        errorMessage = 'No Internet connection';
      }
      setErrorToast({ show: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleErrorToastClose = () => {
    setErrorToast({ show: false, message: '' });
  };

  return (
    <ModalWrapper open={open} onClose={onCloseModal}>
      <div className="eat-modal food-modal">
        <div className="eat-modal-group1 food-modal-group1">
          <div className="food-modal-title-group">
            <button className="food-modal-back-btn" onClick={onBack}>
              <img src={icons.arrowLeft} alt="Back" />
            </button>
            <span className="eat-modal-title h2">Describe</span>
          </div>
          <button className="eat-modal-close-btn" onClick={onCloseModal}>
            <span className="close-fill">
              <img src={icons.closeFillBlack} alt="close" width="24" height="24" />
            </span>
          </button>
        </div>
        
        <div className="describe-input-container">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="describe-textarea h2"
            placeholder="Type what you ate (e.g., 2 eggs, a slice of bread, 1 avocado)"
            style={{ color: description ? '#000' : undefined }}
            disabled={loading}
          />
        </div>
        <div className="food-modal-action-group">
        <button 
          className="food-modal-confirm-btn h5" 
          onClick={handleNext}
          disabled={!description.trim() || loading}
        >
          {loading ? 'Analyzing...' : 'Next'}
        </button>
        </div>
      </div>
      <Toast
        message={errorToast.message}
        type="error"
        show={errorToast.show}
        onClose={handleErrorToastClose}
      />
    </ModalWrapper>
  );
} 