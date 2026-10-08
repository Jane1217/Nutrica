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

  // 当modal打开时，重置所有状态
  useEffect(() => {
    if (open) {
      setLoading(false);
      setSuccess(false);
      setErrorToast({ show: false, message: '' });
      // 如果没有AI数据，重置表单
      if (!aiData) {
        setForm({
          name: '',
          calories: '',
          carbs: '',
          fats: '',
          protein: '',
        });
      }
    } else {
      // 当modal关闭时，也重置所有状态
      setLoading(false);
      setSuccess(false);
      setErrorToast({ show: false, message: '' });
    }
  }, [open, aiData]);

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
    // 立即清除任何之前的错误提示
    setErrorToast({ show: false, message: '' });
    
    try {
      const result = await validateAndSaveFood(form, aiData?.emoji || '🍽️', onDataChange);
      
      if (result.success) {
        // 保存成功后，立即清除所有状态，然后跳转
        setSuccess(true);
        setLoading(false);
        setErrorToast({ show: false, message: '' });
        
        // 重置表单和AI数据
        setForm({
          name: '',
          calories: '',
          carbs: '',
          fats: '',
          protein: '',
        });
        setAiData(null);
        
        // 延迟跳转，确保状态更新完成
        setTimeout(() => {
          if (onDataChange) {
            onDataChange();
          }
        }, 100);
      } else {
        setErrorToast({ show: true, message: 'Food description not recognized' });
        setLoading(false);
      }
    } catch (error) {
      let errorMessage = 'Save failed';
      
      // 检查是否是网络错误
      if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection'))) {
        errorMessage = 'No Internet connection';
      }
      
      setErrorToast({ show: true, message: errorMessage });
      setLoading(false);
    }
  };

  const handleErrorToastClose = () => {
    setErrorToast({ show: false, message: '' });
  };

  return (
    <ModalWrapper open={open} onClose={onCloseModal} size="eat">
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
      {/* 只在有错误且不是成功状态时显示错误Toast */}
      {errorToast.show && !success && (
        <Toast
          message={errorToast.message}
          type="error"
          show={errorToast.show}
          onClose={handleErrorToastClose}
        />
      )}
    </ModalWrapper>
  );
} 
