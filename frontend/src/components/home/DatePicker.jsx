import React, { useState, useEffect } from 'react';
import { icons } from '../../utils/icons';
import { formatDate, getRelativeDateText } from '../../utils/format';
import styles from './DatePicker.module.css';

export default function DatePicker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // 检查指定日期是否有图像数据
  const checkDateHasImage = async (date) => {
    try {
      const response = await fetch(`/api/nutrition-images?date=${date.toISOString().split('T')[0]}`);
      const data = await response.json();
      return data.hasImage;
    } catch (error) {
      console.error('Error checking date image:', error);
      return false;
    }
  };

  // 获取第一个有图像的日期
  const getFirstImageDate = async () => {
    try {
      const response = await fetch('/api/nutrition-images/first');
      const data = await response.json();
      return data.firstDate ? new Date(data.firstDate) : null;
    } catch (error) {
      console.error('Error getting first image date:', error);
      return null;
    }
  };

  // 检查导航状态
  const updateNavigationState = async () => {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    
    // 检查是否可以向前导航（到未来）
    setCanGoForward(!isToday);
    
    // 检查是否可以向后导航（到过去有图像的日期）
    const firstImageDate = await getFirstImageDate();
    if (firstImageDate) {
      setCanGoBack(currentDate > firstImageDate);
    } else {
      setCanGoBack(false);
    }
  };

  // 导航到前一天
  const goToPreviousDay = async () => {
    if (!canGoBack) return;
    
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    // 检查前一天是否有图像，如果没有则继续往前找
    let targetDate = prevDate;
    while (targetDate > new Date(0)) { // 防止无限循环
      const hasImage = await checkDateHasImage(targetDate);
      if (hasImage) {
        setCurrentDate(targetDate);
        break;
      }
      targetDate.setDate(targetDate.getDate() - 1);
    }
  };

  // 导航到后一天
  const goToNextDay = async () => {
    if (!canGoForward) return;
    
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // 检查后一天是否有图像，如果没有则继续往后找
    let targetDate = nextDate;
    const today = new Date();
    while (targetDate <= today) {
      const hasImage = await checkDateHasImage(targetDate);
      if (hasImage) {
        setCurrentDate(targetDate);
        break;
      }
      targetDate.setDate(targetDate.getDate() + 1);
    }
  };

  useEffect(() => {
    updateNavigationState();
  }, [currentDate]);

  return (
    <div className={styles.datePicker}>
      {/* 左侧箭头 */}
      <img 
        src={icons.arrowBack} 
        alt="Previous" 
        className={`${styles.arrow} ${!canGoBack ? styles.arrowDisabled : ''}`}
        onClick={goToPreviousDay}
      />
      
      {/* 中间日期模块 */}
      <div className={styles.dateModule}>
        {/* 日期文本 */}
        <span className={`${styles.dateText} h4`}>
          {formatDate(currentDate)}
        </span>
        
        {/* 相对日期文本 */}
        <span className={`${styles.relativeDateText} body2`}>
          {getRelativeDateText(currentDate)}
        </span>
      </div>
      
      {/* 右侧箭头 */}
      <img 
        src={icons.arrowForward} 
        alt="Next" 
        className={`${styles.arrow} ${!canGoForward ? styles.arrowDisabled : ''}`}
        onClick={goToNextDay}
      />
    </div>
  );
} 