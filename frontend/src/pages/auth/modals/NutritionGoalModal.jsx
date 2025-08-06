import React, { useState } from "react";
import styles from "../styles/Auth.module.css";
import nutritionGoalStyles from "../styles/NutritionGoal.module.css";
import { calculateNutritionFromCalories } from '../../../utils';
import ModalWrapper from '../../../components/common/ModalWrapper';

export default function NutritionGoalModal({ open, onClose, onBack, onSave, name = '', calories = 0 }) {
  const [userInput, setUserInput] = useState('');
  const [isUserEditing, setIsUserEditing] = useState(false);
  
  // 获取当前应该使用的卡路里值
  const getCurrentCalories = () => {
    if (isUserEditing && userInput) {
      return Number(userInput) || 0;
    }
    return calories && calories > 0 ? calories : 0;
  };
  
  // 动态计算宏量营养素克数 - 使用utils函数和当前卡路里值
  const currentCalories = getCurrentCalories();
  const { carbs, fats, protein } = calculateNutritionFromCalories(currentCalories);
  
  const handleSave = () => {
    const finalValue = isUserEditing ? Number(userInput) : (calories && calories > 0 ? calories : 0);
    if (onSave) onSave(finalValue);
    if (onClose) onClose();
  };
  
  // 处理卡路里值变化
  const handleCaloriesChange = (e) => {
    const newValue = e.target.value;
    setUserInput(newValue);
    setIsUserEditing(true);
  };
  
  // 处理输入框失去焦点
  const handleBlur = () => {
    if (!userInput || userInput === (calories || 0).toString()) {
      setIsUserEditing(false);
      setUserInput('');
    }
  };
  
  // 显示的值：如果用户正在编辑则显示用户输入，否则显示props值（如果calories为0或空则显示空字符串）
  const displayValue = isUserEditing ? userInput : (calories && calories > 0 ? calories : '');
  
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
    >
      <div className={nutritionGoalStyles.modalContainer}>
        <div className={nutritionGoalStyles.scrollArea}>
          <h1 className={nutritionGoalStyles.title}>
            Thanks for the info{name ? `, ${name}` : ''}!
          </h1>
          <div className={`h5 ${nutritionGoalStyles.subtitle}`}>
          Here's our estimate of the macros you need to stay healthy and energized. 
          </div>
          
          {/* 显示计算说明 */}
          <div className={nutritionGoalStyles.calcBox}>
            <div className={`h5 ${nutritionGoalStyles.calcTitle}`}>
              Calculation Method:
            </div>
            <div className={`body2 ${nutritionGoalStyles.calcDesc}`}>
              • BMR calculated using Harris-Benedict formula<br/>
              • Adjusted for your activity level and weight goal<br/>
              • You can modify the calories below if needed
            </div>
          </div>
          
          <div className={nutritionGoalStyles.macrosBox}>
            <div className={`h3 ${nutritionGoalStyles.caloriesRow}`}>
              <span className={`h3 ${nutritionGoalStyles.caloriesLabel}`}>Calories</span>
              <div className={nutritionGoalStyles.caloriesInputWrap}>
                <input
                  className={`${styles.modalInput} h4 ${nutritionGoalStyles.caloriesInput}`}
                  type="number"
                  min={0}
                  value={displayValue}
                  onChange={handleCaloriesChange}
                  onBlur={handleBlur}
                />
                <span className={nutritionGoalStyles.kcalUnit}>kcal</span>
              </div>
            </div>
            <div className={nutritionGoalStyles.divider} />
            
            <div className={nutritionGoalStyles.macroRow}>
              <span className={`h3 ${nutritionGoalStyles.macroLabel}`}>Carbs</span>
              <span className='h4'>{carbs}</span>
              <span className={`h4 ${nutritionGoalStyles.macroUnit}`}>g</span>
            </div>
            <div className={nutritionGoalStyles.macroRow}>
              <span className={`h3 ${nutritionGoalStyles.macroLabel}`}>Fats</span>
              <span className='h4'>{fats}</span>
              <span className={`h4 ${nutritionGoalStyles.macroUnit}`}>g</span>
            </div>
            <div className={nutritionGoalStyles.macroRow}>
              <span className={`h3 ${nutritionGoalStyles.macroLabel}`}>Protein</span>
              <span className='h4'>{protein}</span>
              <span className={`h4 ${nutritionGoalStyles.macroUnit}`}>g</span>
            </div>
          </div>
        </div>
        <div className={nutritionGoalStyles.bottomContainer}>
          <button
            className={nutritionGoalStyles.backBtn}
            onClick={() => { if (onBack) onBack(); }}
          >
            <span className='h4'>Back</span>
          </button>
          <button
            className={nutritionGoalStyles.saveBtn}
            onClick={handleSave}
          >
            <span className='h4'>Save</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
} 