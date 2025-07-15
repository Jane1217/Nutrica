import React, { useState, useEffect, useRef } from 'react';
import './FoodModal.css';
import { validateFoodForm } from '../../utils/validation';
import { calculateNutritionTotal, multiplyNutrition } from '../../utils/format';
import { foodApi, handleApiError } from '../../utils/api';

export default function FoodModal({ open, onClose, initialData, userId }) {
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

  if (!open) return null;

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
      const nutrition = multiplyNutrition(baseNutrition, form.number_of_servings);
      
      const data = await foodApi.addFood({
        user_id: userId,
        name: form.name,
        number_of_servings: Number(form.number_of_servings),
        nutrition,
      });
      
      if (data.success) {
        setSuccess(true);
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
    <div className="eat-modal-overlay food-modal-overlay">
      <div className="eat-modal food-modal">
        <div className="eat-modal-group1 food-modal-group1">
          <span className="eat-modal-title h1">Food</span>
          <button className="eat-modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="food-modal-label h5">Food name</div>
        <input name="name" value={form.name} onChange={handleChange} className="food-modal-name-strong" style={{marginLeft: 0}} />
        <div className="food-modal-divider" style={{marginBottom: 15}} />
        <div className="food-modal-row">
          <span className="food-modal-row-label h2">Number of Servings</span>
          <div className="food-modal-serving-group">
            <input name="number_of_servings" type="number" min="1" step="1" value={form.number_of_servings} onChange={handleServingsChange} onBlur={handleServingsBlur} className="food-modal-input" />
          </div>
        </div>
        <div className="food-modal-divider" />
        <div className="food-modal-nutrition-list">
          <div className="food-modal-row">
            <span className="food-modal-row-label h2">Calories</span>
            <div className="food-modal-input-group">
              <input name="calories" value={form.calories} onChange={handleChange} className="food-modal-input" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit">kcal</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h2">Carbs</span>
            <div className="food-modal-input-group">
              <input name="carbs" value={form.carbs} onChange={handleChange} className="food-modal-input" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h2">Fats</span>
            <div className="food-modal-input-group">
              <input name="fats" value={form.fats} onChange={handleChange} className="food-modal-input" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label h2">Protein</span>
            <div className="food-modal-input-group">
              <input name="protein" value={form.protein} onChange={handleChange} className="food-modal-input" disabled={String(form.number_of_servings) !== '1'} />
              <span className="food-modal-unit">g</span>
            </div>
          </div>
        </div>
        <button className="food-modal-confirm-btn" onClick={handleConfirm} disabled={loading}>{loading ? 'Saving...' : 'Confirm'}</button>
        {success && <div className="food-modal-success">Saved!</div>}
        {error && <div className="food-modal-error">{error}</div>}
      </div>
    </div>
  );
} 