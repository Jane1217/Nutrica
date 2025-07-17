import React, { useState, useEffect } from 'react';
import ModalWrapper from '../../../components/common/ModalWrapper';
import styles from '../styles/Auth.module.css';

// 哈里斯-贝内迪克特公式计算BMR
const calculateBMR = (gender, age, height, weight, unit) => {
  // 转换单位：如果是英制，转换为公制
  const heightCm = unit === 'us' ? height * 2.54 : height;
  const weightKg = unit === 'us' ? weight * 0.453592 : weight;
  
  if (gender === 'male') {
    return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    // 对于female和other都使用女性公式
    return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }
};

// 运动系数
const ACTIVITY_FACTORS = {
  sedentary: { value: 1.2, label: '0', description: 'Sedentary (Office work)' },
  lightlyActive: { value: 1.375, label: '1-3 Days', description: 'Light Exercise' },
  moderatelyActive: { value: 1.55, label: '3-5 Days', description: 'Moderate Exercise' },
  veryActive: { value: 1.725, label: '6-7 Days', description: 'Hard Exercise' },
  extremelyActive: { value: 1.9, label: 'Very Hard', description: ' Exercise/Physical Job' }
};

// 调整目标
const WEIGHT_GOALS = {
  maintain: { value: 0, label: 'Maintain Weight' },
  lose: { value: -500, label: 'Lose Weight' },
  gain: { value: 500, label: 'Gain Weight' }
};

export default function UserInfoModal({ open, onClose, onSubmit, initialData = {} }) {
  const [name, setName] = useState(initialData.name || '');
  const [gender, setGender] = useState(initialData.gender || 'male');
  const [age, setAge] = useState(initialData.age || '');
  const [unit, setUnit] = useState(initialData.unit || 'us');
  const [height, setHeight] = useState(initialData.height || '');
  const [weight, setWeight] = useState(initialData.weight || '');
  const [activityLevel, setActivityLevel] = useState(initialData.activityLevel || 'sedentary');
  const [weightGoal, setWeightGoal] = useState(initialData.weightGoal || 'maintain');
  const [calculatedCalories, setCalculatedCalories] = useState(2000);

  // 关键：每次initialData变化时自动同步state
  useEffect(() => {
    setName(initialData.name || '');
    setGender(initialData.gender || 'male');
    setAge(initialData.age || '');
    setUnit(initialData.unit || 'us');
    setHeight(initialData.height || '');
    setWeight(initialData.weight || '');
    setActivityLevel(initialData.activityLevel || 'sedentary');
    setWeightGoal(initialData.weightGoal || 'maintain');
  }, [initialData]);

  // 计算推荐卡路里
  useEffect(() => {
    if (age && height && weight) {
      const bmr = calculateBMR(gender, age, height, weight, unit);
      const tdee = bmr * ACTIVITY_FACTORS[activityLevel].value;
      const adjustedCalories = tdee + WEIGHT_GOALS[weightGoal].value;
      setCalculatedCalories(Math.round(adjustedCalories));
    }
  }, [gender, age, height, weight, unit, activityLevel, weightGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ 
      name, 
      gender, 
      age, 
      unit, 
      height, 
      weight, 
      activityLevel, 
      weightGoal,
      calculatedCalories 
    });
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form className={styles.modalForm} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
          <div className="h1" style={{ marginBottom: 16 }}>Welcome to Nutrica!</div>
        </header>
        <div className={styles.modalInputWrapper}>
          <label className="h5" style={{ marginBottom: 16, display: 'block' }}>Let us know your first name:</label>
          <input className={`${styles.modalInput} body1`} value={name} onChange={e => setName(e.target.value)} required style={{ marginBottom: 24, width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #CDD3C4', background: '#FCFCF8', padding: '20px 16px' }} />
          <hr className={styles.modalDivider} />
          <div className="h5" style={{ marginBottom: 16, textAlign: 'left' }}>
            Tell us some info so that we can estimate your Basal Metabolic Rate (BMR) and Macros needed for healthy eating.
          </div>
          <div className="body2" style={{ fontSize: 14, color: '#22221B', marginBottom: 16, textAlign: 'left' }}>
            * <span className="body2" style={{ color: '#22221B'}}>Your data will remain private.</span> <span className="body2" style={{ color: 'rgba(34, 34, 27, 0.60)'}}>
              You may skip this section now and we will estimate based on the <a href="https://www.nal.usda.gov/human-nutrition-and-food-safety/usda-nutrition-recommendations" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>USDA recommendation</a>. Come back anytime from the account page.
            </span>
          </div>
          
          {/* Gender Selection */}
          <div className="h2" style={{ fontWeight: 700, marginTop: 24, marginBottom: 8, textAlign: 'left' }}>Gender</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16}}>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'male' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('male')}>Male</button>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'female' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('female')}>Female</button>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'other' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('other')}>Other</button>
          </div>
          
          {/* Age Input */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '47px 0 46px 0', width: '100%', height: 48 }}>
            <div className="h2" style={{ fontWeight: 700, textAlign: 'left', minWidth: 48, height: 48, display: 'flex', alignItems: 'center' }}>Age</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 48 }}>
              <input
                className={`${styles.modalInput} h5`}
                type="number"
                min="0"
                value={age}
                onChange={e => setAge(e.target.value)}
                style={{
                  width: 96,
                  height: 48,
                  lineHeight: '48px',
                  borderRadius: 12,
                  border: '1.5px solid #CDD3C4',
                  background: '#F3F3EC',
                  textAlign: 'center',
                  display: 'block',
                  boxSizing: 'border-box',
                  margin: 0
                }}
              />
            </div>
          </div>
          
          {/* Unit Selection */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 27 }}>
            <button
              type="button"
              onClick={() => setUnit('us')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 48,
                borderRadius: '999px',
                background: unit === 'us' ? '#26361B' : '#F3F3EC',
                color: unit === 'us' ? '#FFF' : '#26361B',
                border: unit === 'us' ? 'none' : '1px solid #CDD3C4',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s, border 0.2s'
              }}
            >US Units</button>
            <button
              type="button"
              onClick={() => setUnit('metric')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 48,
                borderRadius: '999px',
                background: unit === 'metric' ? '#26361B' : '#F3F3EC',
                color: unit === 'metric' ? '#FFF' : '#26361B',
                border: unit === 'metric' ? 'none' : '1px solid #CDD3C4',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s, border 0.2s'
              }}
            >Metric Units</button>
          </div>
          
          {/* Height Input */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '37px 0', width: '100%', height: 48 }}>
            <div className="h2" style={{ fontWeight: 700, textAlign: 'left', minWidth: 90, height: 48, display: 'flex', alignItems: 'center' }}>Height</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 48 }}>
              <div style={{ position: 'relative', width: 96, height: 48 }}>
                <input
                  className={`${styles.modalInput} h5`}
                  type="number"
                  min="0"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  style={{
                    width: 96,
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
                }}>{unit === 'us' ? 'in' : 'cm'}</span>
              </div>
            </div>
          </div>
          
          {/* Weight Input */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '37px 0 37px 0', width: '100%', height: 48 }}>
            <div className="h2" style={{ fontWeight: 700, textAlign: 'left', minWidth: 90, height: 48, display: 'flex', alignItems: 'center' }}>Weight</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 48 }}>
              <div style={{ position: 'relative', width: 96, height: 48 }}>
                <input
                  className={`${styles.modalInput} h5`}
                  type="number"
                  min="0"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  style={{
                    width: 96,
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
                }}>{unit === 'us' ? 'lb' : 'kg'}</span>
              </div>
            </div>
          </div>

          {/* Activity Level Selection */}
          <div className="h2" style={{ fontWeight: 700, marginTop: 36, marginBottom: 16, textAlign: 'left' }}>How many days per week are you physically active?</div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 12, 
            marginBottom: 24 
          }}>
            {Object.entries(ACTIVITY_FACTORS).map(([key, factor]) => (
              <button
                key={key}
                type="button"
                className={`${styles.modalOptionBtn} ${activityLevel === key ? styles.modalOptionBtnActive : ''}`}
                onClick={() => setActivityLevel(key)}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '12px 16px',
                  height: 'auto',
                  minHeight: 48,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <span style={{ 
                  textAlign: 'center',
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '150%',
                  letterSpacing: '-0.32px'
                }}>{factor.label}</span>
                <span className="body1" style={{ fontSize: 12, opacity: 0.8 }}>{factor.description}</span>
              </button>
            ))}
          </div>

          {/* Weight Goal Selection */}
          <div className="h2" style={{ fontWeight: 700, marginTop: 24, marginBottom: 16, textAlign: 'left' }}>I would like to:</div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 12, 
            marginBottom: 24 
          }}>
            {Object.entries(WEIGHT_GOALS).map(([key, goal], index) => (
              <button
                key={key}
                type="button"
                className={`${styles.modalOptionBtn} ${weightGoal === key ? styles.modalOptionBtnActive : ''}`}
                onClick={() => setWeightGoal(key)}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '12px 16px',
                  height: 'auto',
                  minHeight: 48,
                  gridColumn: index === 2 ? '1 / 2' : 'auto' // 第三个选项占第一列
                }}
              >
                {goal.label}
              </button>
            ))}
          </div>

          {/* Calculated Calories Display */}
          {age && height && weight && (
            <div style={{ 
              background: '#E7E7D5', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 24,
              border: '1px solid #CDD3C4'
            }}>
              <div className="h5" style={{ marginBottom: 8, color: '#26361B' }}>
                Recommended Daily Calories:
              </div>
              <div className="h2" style={{ fontWeight: 700, color: '#2A4E14' }}>
                {calculatedCalories} kcal
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'center', marginBottom: 24 }}>
          <button
            type="button"
            className="h5"
            onClick={onClose}
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
              border: 'none',
              cursor: 'pointer'
            }}
          >Skip</button>
          <button
            type="submit"
            className="h5"
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
              color: '#FFF',
              border: 'none',
              cursor: 'pointer'
            }}
          >Next</button>
        </div>
      </form>
    </ModalWrapper>
  );
}
