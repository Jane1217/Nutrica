import React, { useState, useEffect, useRef } from 'react';
import '../styles/FoodModal.css';
import { validateFoodForm } from '../../../utils';
import { saveFoodWithServings, multiplyNutrition } from '../../../utils';
import ModalWrapper from '../../../components/common/ModalWrapper';
import Toast from '../../../components/common/Toast';
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
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });

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

  const validateInput = (name, value) => {
    // 确保value是字符串类型
    const stringValue = String(value);
    if (!stringValue.trim()) {
      return 'Field cannot be empty';
    }
    if (['calories', 'carbs', 'fats', 'protein'].includes(name)) {
      if (isNaN(Number(value)) || Number(value) < 0) {
        return 'Must be a valid number';
      }
    }
    if (name === 'number_of_servings') {
      if (isNaN(Number(value)) || Number(value) < 1) {
        return 'Must be at least 1';
      }
    }
    return null;
  };

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
    // 清除之前的错误
    setError('');
    setErrorToast({ show: false, message: '' });

    // 验证所有字段
    const fields = ['name', 'number_of_servings'];
    if (String(form.number_of_servings) === '1') {
      fields.push('calories', 'carbs', 'fats', 'protein');
    }
    
    for (const field of fields) {
      const validationError = validateInput(field, form[field]);
      if (validationError) {
        setErrorToast({ show: true, message: validationError });
        return;
      }
    }

    // 验证baseNutrition（当servings为1时）
    if (String(form.number_of_servings) === '1') {
      const nutritionFields = ['calories', 'carbs', 'fats', 'protein'];
      for (const field of nutritionFields) {
        const validationError = validateInput(field, baseNutrition[field]);
        if (validationError) {
          setErrorToast({ show: true, message: validationError });
          return;
        }
      }
    }
    
    setLoading(true);
    try {
      const result = await saveFoodWithServings(form, baseNutrition, initialData?.emoji || '🍽️', onDataChange);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Save failed');
        setLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleErrorToastClose = () => {
    setErrorToast({ show: false, message: '' });
  };

  const isSingleServing = String(form.number_of_servings) === '1';

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
            {isSingleServing ? (
              <div className="food-modal-input-group">
                <input name="calories" value={form.calories} onChange={handleChange} className="food-modal-input h4" />
                <span className="food-modal-unit h5">kcal</span>
              </div>
            ) : (
              <span className="food-modal-static-value h3">
                {form.calories ? `${form.calories} kcal` : ''}
              </span>
            )}
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Carbs</span>
            {isSingleServing ? (
              <div className="food-modal-input-group">
                <input name="carbs" value={form.carbs} onChange={handleChange} className="food-modal-input h4" />
                <span className="food-modal-unit h5">g</span>
              </div>
            ) : (
              <span className="food-modal-static-value h3">
                {form.carbs ? `${form.carbs}g` : ''}
              </span>
            )}
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Fats</span>
            {isSingleServing ? (
              <div className="food-modal-input-group">
                <input name="fats" value={form.fats} onChange={handleChange} className="food-modal-input h4" />
                <span className="food-modal-unit h5">g</span>
              </div>
            ) : (
              <span className="food-modal-static-value h3">
                {form.fats ? `${form.fats}g` : ''}
              </span>
            )}
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h3">Protein</span>
            {isSingleServing ? (
              <div className="food-modal-input-group">
                <input name="protein" value={form.protein} onChange={handleChange} className="food-modal-input h4" />
                <span className="food-modal-unit h5">g</span>
              </div>
            ) : (
              <span className="food-modal-static-value h3">
                {form.protein ? `${form.protein}g` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="food-modal-action-group">
          <button className="food-modal-confirm-btn h5" onClick={handleConfirm} disabled={loading}>{loading ? 'Saving...' : 'Log food'}</button>
        </div>
        {error && <div className="food-modal-error">{error}</div>}
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