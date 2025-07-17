import React, { useState, useEffect } from 'react';
import '../styles/FoodModal.css';
import { validateFoodForm } from '../../../utils/validation';
import { foodApi, handleApiError } from '../../../utils/api';
import ModalWrapper from '../../../components/common/ModalWrapper';

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
  const [error, setError] = useState('');

  // 当AI数据变化时，自动填充表单
  useEffect(() => {
    if (aiData) {
      setForm({
        name: aiData.name || '',
        calories: aiData.calories || '',
        carbs: aiData.carbs || '',
        fats: aiData.fats || '',
        protein: aiData.protein || '',
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
      setError(validation.message);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const nutrition = {
        calories: Number(form.calories),
        carbs: Number(form.carbs),
        fats: Number(form.fats),
        protein: Number(form.protein),
      };
      
      const data = await foodApi.addFood({
        user_id: userId,
        name: form.name,
        number_of_servings: 1, // 固定为1
        nutrition,
        emoji: aiData?.emoji || '🍽️'
      });
      
      if (data.success) {
        setSuccess(true);
        if (onDataChange) onDataChange();
        setTimeout(() => { onClose && onClose(); }, 1200);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch (error) {
      setError(handleApiError(error, 'Save failed'));
    } finally {
      setLoading(false);
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
            <span className="eat-modal-title">Food</span>
          </div>
          <button className="eat-modal-close-btn" onClick={onCloseModal}>
            <span className="close-fill">
              <img src="/assets/mingcute_close-fill-black.svg" alt="close" width="24" height="24" />
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
            <span className="food-modal-row-label h2">Calories</span>
            <div className="food-modal-input-group">
              <input name="calories" value={form.calories} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit h5">kcal</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h2">Carbs</span>
            <div className="food-modal-input-group">
              <input name="carbs" value={form.carbs} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit h5">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h2">Fats</span>
            <div className="food-modal-input-group">
              <input name="fats" value={form.fats} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit h5">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h2">Protein</span>
            <div className="food-modal-input-group">
              <input name="protein" value={form.protein} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit h5">g</span>
            </div>
          </div>
        </div>
        <button className="food-modal-confirm-btn h5" onClick={handleConfirm} disabled={loading}>{loading ? 'Saving...' : 'Confirm'}</button>
        {success && <div className="food-modal-success">Saved!</div>}
        {error && <div className="food-modal-error">{error}</div>}
      </div>
    </ModalWrapper>
  );
} 