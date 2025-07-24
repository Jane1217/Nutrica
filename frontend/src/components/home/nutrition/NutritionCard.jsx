import React, { useState } from 'react';
import styles from './NutritionCard.module.css';
import { icons } from '../../../utils/icons';
import NutritionHelpModal from './NutritionHelpModal';

export default function NutritionCard({ 
  calories = 0, 
  carbs = 0, 
  protein = 0, 
  fats = 0,
  carbsGoal = 200,
  proteinGoal = 150,
  fatsGoal = 65,
  hasSelectedPuzzle = false,
  carbsColors = [],
  proteinColors = [],
  fatsColors = [],
  onHelpClick 
}) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleHelpClick = () => {
    setShowHelpModal(true);
    if (onHelpClick) onHelpClick();
  };

  // 分段色块渲染函数
  const renderColorSegments = (colors) => (
    <div className={styles.paletteSegments}>
      {colors.length === 0 ? (
        <div className={styles.paletteSegment} style={{background: '#F0F0F0', height: 24, borderRadius: 12}} />
      ) : (
        colors.map((color, idx) => (
          <div
            key={idx}
            className={styles.paletteSegment}
            style={{
              background: color,
              '--segment-count': colors.length,
              borderTopLeftRadius: idx === 0 ? 4 : 0,
              borderTopRightRadius: idx === 0 ? 4 : 0,
              borderBottomLeftRadius: idx === colors.length - 1 ? 4 : 0,
              borderBottomRightRadius: idx === colors.length - 1 ? 4 : 0,
            }}
          />
        ))
      )}
    </div>
  );

  // 新实现：SVG带圆角方形进度条
  function SquareProgressBorder({ colors = [], progress = 1 }) {
    const size = 36;
    const strokeWidth = 2;
    const radius = 8;
    const length = 4 * (size - 2 * radius) + 2 * Math.PI * radius;
    const progressLength = Math.max(0, Math.min(1, progress)) * length;
    // 生成渐变id
    const gradId = `legend-grad-${Math.random().toString(36).slice(2, 10)}`;
    return (
      <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.length > 1 ? colors.map((color, idx) => (
              <stop key={idx} offset={`${(idx / (colors.length - 1)) * 100}%`} stopColor={color} />
            )) : <stop offset="0%" stopColor={colors[0] || '#DBE2D0'} />}
          </linearGradient>
        </defs>
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={size - strokeWidth}
          height={size - strokeWidth}
          rx={radius}
          ry={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progressLength},${length - progressLength}`}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <>
      <div className={styles.nutritionCard}>
        {/* Help Button */}
        <button className={styles.helpButton} onClick={handleHelpClick}>
          <img src={icons.help} alt="Help" />
        </button>
        
        {/* Title */}
        <span className={`${styles.title} h5`}>
          Nutrition Pool
        </span>
        
        {/* Content */}
        <div className={styles.content}>
          {/* Calories Card */}
          <div className={styles.caloriesCard}>
            <span className={`${styles.caloriesLabel} h5`}>
              Calories
            </span>
            <span className={`${styles.caloriesValue} h3`}>
              {calories}
            </span>
          </div>
          
          {/* Nutrition Wrapper */}
          <div className={styles.nutritionWrapper}>
            {/* Carbs Module */}
            <div className={styles.nutritionModule}>
              <div className={styles.colorTile} style={{ position: 'relative', border: 'none' }}>
                <SquareProgressBorder colors={carbsColors} progress={Math.max(0, Math.min(1, carbs / carbsGoal))} />
                {renderColorSegments(carbsColors)}
              </div>
              <div className={styles.values}>
                <div className={styles.heading}>
                  <span className={`${styles.nutritionLabel} h5`}>Carbs</span>
                  {carbs >= carbsGoal && <img src="/assets/success.svg" alt="success" width={17} height={17} style={{marginLeft: 4}} />}
                </div>
                <div className={styles.nutritionValues}>
                  <span className={`${styles.nutritionValue} h4`}>{carbs}g</span>
                  <span className={`${styles.nutritionGoal} labelSmall`}>{carbsGoal}g</span>
                </div>
              </div>
            </div>
            
            {/* Protein Module */}
            <div className={styles.nutritionModule}>
              <div className={styles.colorTile} style={{ position: 'relative', border: 'none' }}>
                <SquareProgressBorder colors={proteinColors} progress={Math.max(0, Math.min(1, protein / proteinGoal))} />
                {renderColorSegments(proteinColors)}
              </div>
              <div className={styles.values}>
                <div className={styles.heading}>
                  <span className={`${styles.nutritionLabel} h5`}>Protein</span>
                  {protein >= proteinGoal && <img src="/assets/success.svg" alt="success" width={17} height={17} style={{marginLeft: 4}} />}
                </div>
                <div className={styles.nutritionValues}>
                  <span className={`${styles.nutritionValue} h4`}>{protein}g</span>
                  <span className={`${styles.nutritionGoal} labelSmall`}>{proteinGoal}g</span>
                </div>
              </div>
            </div>
            
            {/* Fats Module */}
            <div className={styles.nutritionModule}>
              <div className={styles.colorTile} style={{ position: 'relative', border: 'none' }}>
                <SquareProgressBorder colors={fatsColors} progress={Math.max(0, Math.min(1, fats / fatsGoal))} />
                {renderColorSegments(fatsColors)}
              </div>
              <div className={styles.values}>
                <div className={styles.heading}>
                  <span className={`${styles.nutritionLabel} h5`}>Fats</span>
                  {fats >= fatsGoal && <img src="/assets/success.svg" alt="success" width={17} height={17} style={{marginLeft: 4}} />}
                </div>
                <div className={styles.nutritionValues}>
                  <span className={`${styles.nutritionValue} h4`}>{fats}g</span>
                  <span className={`${styles.nutritionGoal} labelSmall`}>{fatsGoal}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Modal */}
      <NutritionHelpModal 
        open={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </>
  );
} 