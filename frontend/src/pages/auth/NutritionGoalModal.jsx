import React, { useState } from "react";
import styles from "./Auth.module.css";
import { calculateNutritionFromCalories } from "../../utils/nutrition";

export default function NutritionGoalModal({ onClose, onBack, onSave, name = '', calories = 2000 }) {
  const [userInput, setUserInput] = useState('');
  const [isUserEditing, setIsUserEditing] = useState(false);
  
  // 获取当前应该使用的卡路里值
  const getCurrentCalories = () => {
    if (isUserEditing && userInput) {
      return Number(userInput) || calories;
    }
    return calories;
  };
  
  // 动态计算宏量营养素克数 - 使用utils函数和当前卡路里值
  const currentCalories = getCurrentCalories();
  const { carbs, fats, protein } = calculateNutritionFromCalories(currentCalories);
  
  const handleSave = () => {
    const finalValue = isUserEditing ? Number(userInput) : calories;
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
    if (!userInput || userInput === calories.toString()) {
      setIsUserEditing(false);
      setUserInput('');
    }
  };
  
  // 显示的值：如果用户正在编辑则显示用户输入，否则显示props值
  const displayValue = isUserEditing ? userInput : calories;
  
  return (
    <div className={styles.nutritionGoalModalWrapper} style={{
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* 滚动内容区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 32px',
        paddingBottom: 0
      }}>
        <h2 className='h1' style={{ marginBottom: 16 }}>
          Thanks for the info{name ? `, ${name}` : ''}!
        </h2>
        <div className='h5' style={{ marginBottom: 24 }}>
          Based on your Harris-Benedict BMR calculation and activity level, here's our estimate of the Macros needed for keeping you healthy and energetic.
        </div>
        
        {/* 显示计算说明 */}
        <div style={{ 
          background: '#F3F3EC', 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 32,
          border: '1px solid #CDD3C4'
        }}>
          <div className="h5" style={{ marginBottom: 8, color: '#26361B' }}>
            Calculation Method:
          </div>
          <div className="body2" style={{ color: '#666', lineHeight: '1.4' }}>
            • BMR calculated using Harris-Benedict formula<br/>
            • Adjusted for your activity level (1.2-1.9x) and weight goal<br/>
            • You can modify the calories below if needed
          </div>
        </div>
        
        <div style={{ marginBottom: 32 }}>
          <div className='h2' style={{ display: "flex", alignItems: "center", marginBottom: 45 }}>
            <span className='h2' style={{ flex: 1 }}>Calories</span>
            <div style={{ position: 'relative', width: 120, height: 48 }}>
              <input
                className={`${styles.modalInput} h5`}
                type="number"
                min={0}
                value={displayValue}
                onChange={handleCaloriesChange}
                onBlur={handleBlur}
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

          {/*不知道为啥这一部分代码删除之后，营养目标就无法显示公式计算的值*/}
          {/* 显示推荐标签 */}
          {/* <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 16,
            padding: '8px 12px',
            background: '#E7E7D5',
            borderRadius: 8,
            border: '1px solid #CDD3C4'
          }}>
            <span style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#2A4E14',
              background: '#A1CE90',
              padding: '2px 8px',
              borderRadius: 4,
              marginRight: 8
            }}>
              RECOMMENDED
            </span>
            <span className="body2" style={{ color: '#666' }}>
              Based on your personal information and goals
            </span>
          </div> */}
          
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
      </div>
      
      {/* 固定在底部的按钮区域 */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        justifyContent: 'center', 
        padding: '24px 32px 48px 32px',
        background: '#f6f6f0',
        borderTop: '1px solid #E7E7D5'
      }}>
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