import React, { useState } from "react";
import styles from "./Auth.module.css";

export default function NutritionGoalModal({ onClose, onBack, onSave, name = '', calories = 2000 }) {
  const [caloriesValue, setCaloriesValue] = useState(calories);
  // 动态计算宏量营养素克数
  const carbs = Math.round((0.50 * caloriesValue) / 4);
  const fats = Math.round((0.30 * caloriesValue) / 9);
  const protein = Math.round((0.20 * caloriesValue) / 4);
  const handleSave = () => {
    if (onSave) onSave(Number(caloriesValue));
    if (onClose) onClose();
  };
  return (
    <div className={styles.nutritionGoalModalWrapper} style={{padding: '8px 32px', display: 'flex', flexDirection: 'column', minHeight: '100%'}}>
      <h2 className='h1' style={{ marginBottom: 16 }}>
        Thanks for the info{name ? `, ${name}` : ''}!
      </h2>
      <div className='h5' style={{ marginBottom: 36 }}>
        Here's our estimate of the Macros needed for<br />
        keeping you healthy and energetic.
      </div>
      <div style={{ marginBottom: 32 }}>
        <div className='h2' style={{ display: "flex", alignItems: "center", marginBottom: 45 }}>
          <span className='h2' style={{ flex: 1 }}>Calories</span>
          <div style={{ position: 'relative', width: 120, height: 48 }}>
            <input
              className={`${styles.modalInput} h5`}
              type="number"
              min={0}
              value={caloriesValue}
              onChange={e => setCaloriesValue(e.target.value)}
              style={{
                width: 120,
                height: 48,
                lineHeight: '24px',
                borderRadius: 12,
                border: '1.5px solid #CDD3C4',
                background: '#F3F3EC',
                textAlign: 'left',
                display: 'block',
                boxSizing: 'border-box',
                margin: 0,
                fontWeight: 500,
                padding: '12px 16px',
                paddingRight: 38
              }}
            />
            <span style={{
              position: 'absolute',
              right: 16,
              top: 0,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(0,0,0,0.60)',
              fontFamily: 'Kanit',
              fontSize: 16,
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '24px',
              textAlign: 'right',
              pointerEvents: 'none'
            }}>kcal</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <span className='h2' style={{ flex: 1 }}>Carbs</span>
          <span className='h5'>{carbs}</span>
          <span className='h5' style={{ color: 'rgba(0,0,0,0.60)', marginLeft: 6 }}>g</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <span className='h2' style={{ flex: 1 }}>Fats</span>
          <span className='h5'>{fats}</span>
          <span className='h5' style={{ color: 'rgba(0,0,0,0.60)', marginLeft: 6 }}>g</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <span className='h2' style={{ flex: 1 }}>Protein</span>
          <span className='h5'>{protein}</span>
          <span className='h5' style={{ color: 'rgba(0,0,0,0.60)', marginLeft: 6 }}>g</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 'auto', marginBottom: 48, width: '100%' }}>
        <button
          style={{
            display: 'flex',
            width: 119,
            height: 80,
            padding: '12px 24px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            borderRadius: 36,
            background: '#E7E7D5',
            color: '#222',
            border: 'none',
            fontSize: 20,
            fontWeight: 500,
            cursor: 'pointer'
          }}
          onClick={() => { if (onBack) onBack(); }}
        >
          <span className='h5'>Back</span>
        </button>
        <button
          style={{
            display: 'flex',
            width: 200,
            height: 80,
            padding: '13px 21px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            borderRadius: 36,
            background: 'var(--Brand-Dark, #2A4E14)',
            color: '#fff',
            border: 'none',
            fontSize: 22,
            fontWeight: 500,
            cursor: 'pointer'
          }}
          onClick={handleSave}
        >
          <span className='h5'>Save</span>
        </button>
      </div>
    </div>
  );
} 