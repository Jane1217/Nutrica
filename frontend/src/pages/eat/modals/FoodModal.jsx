import React, { useState, useEffect, useRef } from 'react';
import '../styles/FoodModal.css';
import { validateFoodForm } from '../../../utils/validation';
import { saveFoodWithServings, multiplyNutrition } from '../../../utils';
import ModalWrapper from '../../../components/common/ModalWrapper';
import { icons } from '../../../utils';

export default function FoodModal({ open, onClose, initialData, userId, onDataChange }) {
  const [form, setForm] = useState({
    name: '',
    number_of_servings: 1,
    calories: '',
    carbs: '',
    fats: '',
    protein: '',
  });
  const [baseNutrition, setBaseNutrition] = useState({
    calories: '',
    carbs: '',
    fats: '',
    protein: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 每次 initialData 变化时自动填充表单和baseNutrition
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData['Food name'] || '',
        number_of_servings: initialData['Number of Servings'] || 1,
        calories: initialData.Calories || '',
        carbs: initialData.Carbs || '',
        fats: initialData.Fats || '',
        protein: initialData.Protein || '',
      });
      setBaseNutrition({
        calories: initialData.Calories || '',
        carbs: initialData.Carbs || '',
        fats: initialData.Fats || '',
        protein: initialData.Protein || '',
      });
    }
  }, [initialData]);

  const baseNutritionRef = useRef(baseNutrition);
  useEffect(() => {
    baseNutritionRef.current = baseNutrition;
  }, [baseNutrition]);

  const handleServingsChange = e => {
    const value = e.target.value;
    setForm(f => ({
      ...f,
      number_of_servings: value
    }));
  };
  const handleServingsBlur = e => {
    let value = e.target.value;
    if (!value || isNaN(Number(value)) || Number(value) < 1) value = '1';
    value = String(parseInt(value));
    setForm(f => ({
      ...f,
      number_of_servings: value,
      ...multiplyNutrition(baseNutritionRef.current, value)
    }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (["calories", "carbs", "fats", "protein"].includes(name)) {
      if (String(form.number_of_servings) === '1') {
        setBaseNutrition(b => ({ ...b, [name]: value }));
        setForm(f => ({ ...f, [name]: value }));
      }
    } else if (name !== 'number_of_servings') {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleConfirm = async () => {
    // 校验所有输入框不能为空
    const validation = validateFoodForm(form);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    
    if (!baseNutrition.calories || !baseNutrition.carbs || !baseNutrition.fats || !baseNutrition.protein) {
      setError('All fields are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const result = await saveFoodWithServings(form, baseNutrition, initialData?.emoji || '🍽️', onDataChange);
      
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
    <ModalWrapper open={open} onClose={onClose}>
      <div className="eat-modal food-modal">
        <div className="eat-modal-group1 food-modal-group1">
          <span className="eat-modal-title">Food</span>
          <button className="eat-modal-close-btn" onClick={onClose}>
            <img src={icons.closeFillBlack} alt="close" width="24" height="24" />
          </button>
        </div>
        <div className="food-modal-label h5">Food name</div>
        <input name="name" value={form.name} onChange={handleChange} className="food-modal-name-strong" style={{marginLeft: 0}} />
        <div className="food-modal-divider" style={{marginBottom: 15}} />
        <div className="food-modal-row">
          <span className="food-modal-row-label h3">Number of Servings</span>
          <div className="food-modal-serving-group">
            <input name="number_of_servings" type="number" min="1" step="1" value={form.number_of_servings} onChange={handleServingsChange} onBlur={handleServingsBlur} className="food-modal-input" />
          </div>
        </div>
        <div className="food-modal-divider" />
        <div className="food-modal-nutrition-list">
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Calories</span>
            <div className="food-modal-input-group">
              <input name="calories" value={form.calories} onChange={handleChange} className="food-modal-input h4" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit h5">kcal</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Carbs</span>
            <div className="food-modal-input-group">
              <input name="carbs" value={form.carbs} onChange={handleChange} className="food-modal-input h4" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit h5">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Fats</span>
            <div className="food-modal-input-group">
              <input name="fats" value={form.fats} onChange={handleChange} className="food-modal-input h4" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit h5">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Protein</span>
            <div className="food-modal-input-group">
              <input name="protein" value={form.protein} onChange={handleChange} className="food-modal-input h4" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit h5">g</span>
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