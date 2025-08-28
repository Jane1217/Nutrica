import React, { useState, useEffect } from 'react';
import '../styles/FoodModal.css';
import { validateFoodForm } from '../../../utils';
import { validateAndSaveFood } from '../../../utils';
import ModalWrapper from '../../../components/common/ModalWrapper';
import Toast from '../../../components/common/Toast';
import { icons } from '../../../utils';

export default function DescribeFoodModal({ open, onClose, onBack, onCloseModal, aiData, userId, onDataChange }) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    carbs: '',
    fats: '',
    protein: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });

  // 当AI数据变化时，自动填充表单
  useEffect(() => {
    if (aiData) {
      setForm({
        name: aiData.name || '',
        calories: aiData.calories ?? '',
        carbs: aiData.carbs ?? '',
        fats: aiData.fats ?? '',
        protein: aiData.protein ?? '',
      });
    }
  }, [aiData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleConfirm = async () => {
    // 校验所有输入框不能为空
    const validation = validateFoodForm(form);
    if (!validation.isValid) {
      // 使用简洁的错误信息，而不是validateFoodForm返回的详细错误信息
      setErrorToast({ show: true, message: 'Field cannot be empty' });
      return;
    }
    
    setLoading(true);
    setErrorToast({ show: false, message: '' });
    try {
      const result = await validateAndSaveFood(form, aiData?.emoji || '🍽️', onDataChange);
      
      if (result.success) {
        setSuccess(true);
        // 保存成功时不重置loading，让onDataChange处理跳转
      } else {
        setErrorToast({ show: true, message: 'Food description not recognized' });
        setLoading(false); // 只在失败时重置loading
      }
    } catch (error) {
      let errorMessage = 'Save failed';
      
      // 检查是否是网络错误
      if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection'))) {
        errorMessage = 'No Internet connection';
      }
      
      setErrorToast({ show: true, message: errorMessage });
      setLoading(false); // 只在失败时重置loading
    }
    // 移除finally块，避免在成功时重置loading
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
            <span className="eat-modal-title h2">Food</span>
          </div>
          <button className="eat-modal-close-btn" onClick={onCloseModal}>
            <span className="close-fill">
              <img src={icons.closeFillBlack} alt="close" width="24" height="24" />
            </span>
          </button>
        </div>
        <div className="food-modal-label h5">Food name</div>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className="food-modal-name-strong" 
          style={{marginLeft: 0}}
        />
        <div className="food-modal-divider" style={{marginBottom: 15}} />
        <div className="food-modal-nutrition-list">
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Calories</span>
            <div className="food-modal-input-group">
              <input name="calories" value={form.calories} onChange={handleChange} className="food-modal-input h4" />
              <span className="food-modal-unit h4">kcal</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Carbs</span>
            <div className="food-modal-input-group">
              <input name="carbs" value={form.carbs} onChange={handleChange} className="food-modal-input h4" />
              <span className="food-modal-unit h4">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Fats</span>
            <div className="food-modal-input-group">
              <input name="fats" value={form.fats} onChange={handleChange} className="food-modal-input h4" />
              <span className="food-modal-unit h4">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Protein</span>
            <div className="food-modal-input-group">
              <input name="protein" value={form.protein} onChange={handleChange} className="food-modal-input h4" />
              <span className="food-modal-unit h4">g</span>
            </div>
          </div>
        </div>
        {/* Action Group */}
        <div className="food-modal-action-group">
          <button className="food-modal-confirm-btn h5" onClick={handleConfirm} disabled={loading}>{loading ? 'Saving...' : 'Log food'}</button>
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