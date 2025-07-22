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
              <div className={styles.colorTile}>
                {renderColorSegments(carbsColors)}
              </div>
              <div className={styles.values}>
                <div className={styles.heading}>
                  <span className={`${styles.nutritionLabel} h5`}>Carbs</span>
                  {carbs >= carbsGoal && <div className={styles.success}></div>}
                </div>
                <div className={styles.nutritionValues}>
                  <span className={`${styles.nutritionValue} h4`}>{carbs}g</span>
                  <span className={`${styles.nutritionGoal} labelSmall`}>{carbsGoal}g</span>
                </div>
              </div>
            </div>
            
            {/* Protein Module */}
            <div className={styles.nutritionModule}>
              <div className={styles.colorTile}>
                {renderColorSegments(proteinColors)}
              </div>
              <div className={styles.values}>
                <div className={styles.heading}>
                  <span className={`${styles.nutritionLabel} h5`}>Protein</span>
                  {protein >= proteinGoal && <div className={styles.success}></div>}
                </div>
                <div className={styles.nutritionValues}>
                  <span className={`${styles.nutritionValue} h4`}>{protein}g</span>
                  <span className={`${styles.nutritionGoal} labelSmall`}>{proteinGoal}g</span>
                </div>
              </div>
            </div>
            
            {/* Fats Module */}
            <div className={styles.nutritionModule}>
              <div className={styles.colorTile}>
                {renderColorSegments(fatsColors)}
              </div>
              <div className={styles.values}>
                <div className={styles.heading}>
                  <span className={`${styles.nutritionLabel} h5`}>Fats</span>
                  {fats >= fatsGoal && <div className={styles.success}></div>}
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