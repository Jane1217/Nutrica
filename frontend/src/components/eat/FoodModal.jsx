import React, { useState } from 'react';
import './FoodModal.css';

export default function FoodModal({ open, onClose, initialData, userId }) {
  const [form, setForm] = useState({
    name: initialData?.['Food name'] || '',
    number_of_servings: initialData?.['Number of Servings'] || 1,
    calories: initialData?.Calories || '',
    carbs: initialData?.Carbs || '',
    fats: initialData?.Fats || '',
    protein: initialData?.Protein || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const nutrition = {
        calories: form.calories,
        carbs: form.carbs,
        fats: form.fats,
        protein: form.protein,
      };
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: form.name,
          number_of_servings: form.number_of_servings,
          nutrition,
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => { onClose && onClose(); }, 1200);
      } else {
        setError(data.error || '保存失败');
      }
    } catch (e) {
      setError('网络错误');
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
        <div className="food-modal-label">Food name</div>
        <input name="name" value={form.name} onChange={handleChange} className="food-modal-input food-modal-name" />
        <div className="food-modal-divider" />
        <div className="food-modal-row">
          <span className="food-modal-row-label">Number of Servings</span>
          <input name="number_of_servings" value={form.number_of_servings} onChange={handleChange} className="food-modal-input food-modal-serving" />
        </div>
        <div className="food-modal-divider" />
        <div className="food-modal-nutrition-list">
          <div className="food-modal-row">
            <span className="food-modal-row-label">Calories</span>
            <div className="food-modal-row-value">
              <input name="calories" value={form.calories} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit">kcal</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label">Carbs</span>
            <div className="food-modal-row-value">
              <input name="carbs" value={form.carbs} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label">Fats</span>
            <div className="food-modal-row-value">
              <input name="fats" value={form.fats} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit">g</span>
            </div>
          </div>
          <div className="food-modal-row">
            <span className="food-modal-row-label">Protein</span>
            <div className="food-modal-row-value">
              <input name="protein" value={form.protein} onChange={handleChange} className="food-modal-input" />
              <span className="food-modal-unit">g</span>
            </div>
          </div>
        </div>
        <button className="food-modal-confirm-btn" onClick={handleConfirm} disabled={loading}>{loading ? 'Saving...' : 'Confirm'}</button>
        {success && <div className="food-modal-success">保存成功！</div>}
        {error && <div className="food-modal-error">{error}</div>}
      </div>
    </div>
  );
} 