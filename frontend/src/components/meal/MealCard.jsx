import React from 'react';
import styles from './MealCard.module.css';

export default function MealCard({ name, calories, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.name}>{name}</div>
      <div className={styles.calories}>{calories} Calories</div>
    </div>
  );
} 