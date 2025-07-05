import React from 'react';
import MealCard from './MealCard';
import styles from './Timeline.module.css';

export default function Timeline({ data, onCardClick }) {
  // data: [{ time: '13:00', name: 'xxx', calories: 360, mealObj }]
  return (
    <div className={styles.timelineWrap}>
      {data.map((item, idx) => (
        <div className={styles.row} key={item.time + item.name + idx}>
          <div className={styles.timeLineCol}>
          <div className={styles.time}>{item.time}</div>
            {idx !== data.length - 1 && <div className={styles.line} />}
          </div>
          <MealCard name={item.name} calories={item.calories} onClick={() => onCardClick(item.mealObj)} />
        </div>
      ))}
    </div>
  );
} 