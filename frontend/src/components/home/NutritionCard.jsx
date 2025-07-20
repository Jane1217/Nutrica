import React from 'react';
import styles from './NutritionCard.module.css';
import { icons } from '../../utils/icons';

export default function NutritionCard({ 
  calories = 0, 
  carbs = 0, 
  protein = 0, 
  fats = 0,
  carbsGoal = 200,
  proteinGoal = 150,
  fatsGoal = 65,
  hasSelectedPuzzle = false,
  onHelpClick 
}) {
  return (
    <div className={styles.nutritionCard}>
      {/* Help Button */}
      <button className={styles.helpButton} onClick={onHelpClick}>
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
              <div className={`${styles.palette} ${hasSelectedPuzzle ? styles.paletteSelected : ''}`} 
                   style={hasSelectedPuzzle ? { background: '#FF6B6B' } : {}}>
              </div>
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
              <div className={`${styles.palette} ${hasSelectedPuzzle ? styles.paletteSelected : ''}`}
                   style={hasSelectedPuzzle ? { background: '#4ECDC4' } : {}}>
              </div>
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
              <div className={`${styles.palette} ${hasSelectedPuzzle ? styles.paletteSelected : ''}`}
                   style={hasSelectedPuzzle ? { background: '#45B7D1' } : {}}>
              </div>
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
  );
} 