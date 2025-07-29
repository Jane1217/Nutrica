import React, { useState } from 'react';
import '../styles/FoodModal.css';
import { validateFoodForm } from '../../../utils';
import { validateAndSaveFoodWithEmoji } from '../../../utils';
import ModalWrapper from '../../../components/common/ModalWrapper';
import { icons } from '../../../utils';

export default function EnterValueModal({ open, onClose, onBack, onCloseModal, userId, onDataChange }) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    carbs: '',
    fats: '',
    protein: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleConfirm = async () => {
    // 校验所有输入框不能为空
    const validation = validateFoodForm(form);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const result = await validateAndSaveFoodWithEmoji(form, onDataChange);
      
      if (result.success) {
        setSuccess(true);
        // 保存成功时不重置loading，让onDataChange处理跳转
      } else {
        setError(result.error || 'Save failed');
        setLoading(false); // 只在失败时重置loading
      }
    } catch (error) {
      setError(error.message);
      setLoading(false); // 只在失败时重置loading
    }
    // 移除finally块，避免在成功时重置loading
  };

  return (
    <ModalWrapper open={open} onClose={onCloseModal}>
      <div className="eat-modal food-modal">
        <div className="eat-modal-group1 food-modal-group1">
          <div className="food-modal-title-group">
            <button className="food-modal-back-btn" onClick={onBack}>
              <img src={icons.arrowLeft} alt="Back" />
            </button>
            <span className="eat-modal-title">Enter Value</span>
          </div>
          <button className="eat-modal-close-btn" onClick={onCloseModal}>
            <span className="close-fill">
              <img src={icons.closeFillBlack} alt="close" width="24" height="24" />
            </span>
          </button>
        </div>
        <div className="food-modal-label h3">Food name</div>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className="food-modal-name-strong" 
          style={{marginLeft: 0}}
          placeholder="Type food name..."
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
        <div className="food-modal-action-group">
          <button className="food-modal-confirm-btn h5" onClick={handleConfirm} disabled={loading}>{loading ? 'Saving...' : 'Log food'}</button>
        </div>
        {error && <div className="food-modal-error">{error}</div>}
      </div>
    </ModalWrapper>
  );
} 