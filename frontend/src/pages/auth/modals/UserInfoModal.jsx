import React, { useState, useEffect } from 'react';
import ModalWrapper from '../../../components/common/ModalWrapper';
import styles from '../styles/UserInfo.module.css';

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
  sedentary: { value: 1.2, label: '0 Day' },
  lightlyActive: { value: 1.375, label: '1-2 Days'},
  moderatelyActive: { value: 1.55, label: '3-5 Days'},
  veryActive: { value: 1.725, label: '6-7 Days' },
  extremelyActive: { value: 1.9, label: 'Physical Job' }
};

// 调整目标
const WEIGHT_GOALS = {
  maintain: { value: 0, label: 'maintain weight' },
  lose: { value: -500, label: 'lose weight' },
  gain: { value: 500, label: 'gain weight' }
};

export default function UserInfoModal({ open, onClose, onSubmit, initialData = {}, isUpdateMode = false }) {
  const [name, setName] = useState(initialData.name || '');
  const [gender, setGender] = useState(initialData.gender || 'male');
  const [age, setAge] = useState(initialData.age || '');
  const [unit, setUnit] = useState(initialData.unit || 'us');
  const [height, setHeight] = useState(initialData.height || '');
  const [heightFeet, setHeightFeet] = useState(initialData.heightFeet || '');
  const [heightInches, setHeightInches] = useState(initialData.heightInches || '');
  const [weight, setWeight] = useState(initialData.weight || '');
  const [activityLevel, setActivityLevel] = useState(initialData.activityLevel || 'sedentary');
  const [weightGoal, setWeightGoal] = useState(initialData.weightGoal || 'maintain');
  const [calculatedCalories, setCalculatedCalories] = useState(2000);
  const [isLoading, setIsLoading] = useState(false);

  // 关键：每次initialData变化时自动同步state
  useEffect(() => {
    setName(initialData.name || '');
    setGender(initialData.gender || 'male');
    setAge(initialData.age || '');
    setUnit(initialData.unit || 'us');
    setHeight(initialData.height || '');
    setHeightFeet(initialData.heightFeet || '');
    setHeightInches(initialData.heightInches || '');
    setWeight(initialData.weight || '');
    setActivityLevel(initialData.activityLevel || 'sedentary');
    setWeightGoal(initialData.weightGoal || 'maintain');
  }, [initialData]);

  // 计算推荐卡路里
  useEffect(() => {
    let currentHeight = height;
    let currentWeight = weight;
    
    // 处理US单位的身高数据
    if (unit === 'us' && (heightFeet || heightInches)) {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      currentHeight = feet * 12 + inches; // 转换为英寸
    }
    
    if (age && currentHeight && currentWeight) {
      const bmr = calculateBMR(gender, age, currentHeight, currentWeight, unit);
      const tdee = bmr * ACTIVITY_FACTORS[activityLevel].value;
      const adjustedCalories = tdee + WEIGHT_GOALS[weightGoal].value;
      setCalculatedCalories(Math.round(adjustedCalories));
    }
  }, [gender, age, height, heightFeet, heightInches, weight, unit, activityLevel, weightGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 处理US单位的身高数据
    let finalHeight = height;
    if (unit === 'us' && (heightFeet || heightInches)) {
      // 将英尺和英寸转换为英寸总数
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      finalHeight = feet * 12 + inches;
    }
    
    // 3秒后调用onSubmit
    setTimeout(() => {
      setIsLoading(false);
    onSubmit && onSubmit({ 
      name, 
      gender, 
      age, 
      unit, 
      height: finalHeight,
      heightFeet,
      heightInches,
      weight, 
      activityLevel, 
      weightGoal,
      calculatedCalories 
    });
    }, 3000);
  };

  // 如果正在加载，显示加载界面
  if (isLoading) {
    return (
      <ModalWrapper open={open} onClose={onClose}>
        <div className={styles.modalContainer}>
          <div className={styles.modalForm}>
            <header className={styles.modalHeader}>
              <div className="h2">{isUpdateMode ? 'Update Nutrition Goal' : 'Welcome to Nutrica!'}</div>
            </header>
            <div className={styles.loadingContent}>
              <div className="body1" style={{textAlign: 'center', marginBottom: '24px'}}>
                Estimating your daily macronutrient intake based on your input...
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <div className={styles.modalContainer}>
      <form className={styles.modalForm} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
            <div className="h2">{isUpdateMode ? 'Update Nutrition Goal' : 'Welcome to Nutrica!'}</div>
        </header>
        <div className={styles.modalInputWrapper}>
            {!isUpdateMode && (
              <>
          <label className="h5">Let us know your first name:</label>
          <input className={`${styles.nameInput} body1`} value={name} onChange={e => setName(e.target.value)} required />
          <hr className={styles.modalDivider} />
              </>
            )}
            <div className="h4">
            Tell us some info so that we can estimate your Basal Metabolic Rate (BMR) and Macros needed for healthy eating.
          </div>
          <div className={`${styles.privacyText} body2`}>
              * <span className={styles.privacyTextHighlight}>Your data will remain private. You can update your answers anytime on the Account page.</span>
          </div>
          
          {/* Gender Selection */}
            <div className={`${styles.sectionTitle} h3`}>Gender*</div>
          <div className={styles.genderButtons}>
              <button type="button" className={`${styles.modalOptionBtn} h5 ${gender === 'male' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('male')}>Male</button>
              <button type="button" className={`${styles.modalOptionBtn} h5 ${gender === 'female' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('female')}>Female</button>
              <button type="button" className={`${styles.modalOptionBtn} h5 ${gender === 'other' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('other')}>Other</button>
          </div>
          
          {/* Age Input */}
          <div className={styles.ageContainer}>
              <div className={`${styles.ageLabel} h3`}>Age*</div>
            <div className={styles.ageInputWrapper}>
              <input
                className={`${styles.ageInput} h5`}
                type="number"
                min="0"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>
          </div>
          
          {/* Unit Selection */}
          <div className={styles.unitButtons}>
            <button
              type="button"
              onClick={() => setUnit('us')}
              className={`${styles.unitButton} h5 ${unit === 'us' ? styles.unitButtonActive : styles.unitButtonInactive}`}
            >US Units</button>
            <button
              type="button"
              onClick={() => setUnit('metric')}
              className={`${styles.unitButton} h5 ${unit === 'metric' ? styles.unitButtonActive : styles.unitButtonInactive}`}
            >Metric Units</button>
          </div>
          
          {/* Height Input */}
          <div className={styles.measurementContainer}>
              <div className={`${styles.measurementLabel} h3`}>Height*</div>
            <div className={styles.measurementInputWrapper}>
              {unit === 'us' ? (
                <div className={styles.usHeightInputs}>
                  <div className={styles.measurementInputContainer}>
                    <input
                      className={`${styles.measurementInput} h5`}
                      type="number"
                      min="0"
                      value={heightFeet}
                      onChange={e => setHeightFeet(e.target.value)}
                      placeholder="0"
                    />
                    <span className={styles.measurementUnit}>ft</span>
                  </div>
                  <div className={styles.measurementInputContainer}>
                    <input
                      className={`${styles.measurementInput} h5`}
                      type="number"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={e => setHeightInches(e.target.value)}
                      placeholder="0"
                    />
                    <span className={styles.measurementUnit}>in</span>
                  </div>
                </div>
              ) : (
                <div className={styles.measurementInputContainer}>
                  <input
                    className={`${styles.measurementInput} h5`}
                    type="number"
                    min="0"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                  />
                  <span className={styles.measurementUnit}>cm</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Weight Input */}
          <div className={styles.measurementContainer}>
              <div className={`${styles.measurementLabel} h3`}>Weight*</div>
            <div className={styles.measurementInputWrapper}>
              <div className={styles.measurementInputContainer}>
                <input
                  className={`${styles.measurementInput} h5`}
                  type="number"
                  min="0"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
                <span className={styles.measurementUnit}>{unit === 'us' ? 'lbs' : 'kg'}</span>
              </div>
            </div>
          </div>

          {/* Activity Level Selection */}
            <div className={`${styles.sectionTitle} h3`}>How many days per week are you physically active?</div>
          <div className={styles.activityGrid}>
            {Object.entries(ACTIVITY_FACTORS).map(([key, factor]) => (
              <button
                key={key}
                type="button"
                className={`${styles.activityButton} ${styles.modalOptionBtn} ${activityLevel === key ? styles.modalOptionBtnActive : ''}`}
                onClick={() => setActivityLevel(key)}
              >
                <span className={styles.activityLabel}>{factor.label}</span>
              </button>
            ))}
          </div>

          {/* Weight Goal Selection */}
            <div className={`${styles.sectionTitle} h3`}>I would like to:</div>
          <div className={styles.weightGoalGrid}>
            {Object.entries(WEIGHT_GOALS).map(([key, goal], index) => (
              <button
                key={key}
                type="button"
                className={`${styles.weightGoalButton} h5 ${weightGoal === key ? styles.weightGoalButtonActive : ''} ${index === 2 ? styles.weightGoalButtonThird : ''}`}
                onClick={() => setWeightGoal(key)}
              >
                {goal.label}
              </button>
            ))}
          </div>


        </div>
        </form>
        <div className={styles.buttonContainerFixed}>
          <button
            type="button"
            className={`${styles.skipButton} h4`}
            onClick={onClose}
          >Cancel</button>
          <button
            type="submit"
            className={`${styles.nextButton} h4`}
            onClick={handleSubmit}
          >Next</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
