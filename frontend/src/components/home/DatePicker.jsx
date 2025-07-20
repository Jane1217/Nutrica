import React, { useState, useEffect } from 'react';
import { icons } from '../../utils/icons';
import { formatDate, getRelativeDateText } from '../../utils/format';
import styles from './DatePicker.module.css';
import DatePickerModal from './DatePickerModal';
import { supabase } from '../../supabaseClient';
import { apiGet } from '../../utils/api';

export default function DatePicker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [userId, setUserId] = useState(null);

  // Check if specified date has image data
  const checkDateHasImage = async (date) => {
    try {
      const { hasImage } = await apiGet(`/api/nutrition-images?date=${date.toISOString().split('T')[0]}`);
      return hasImage;
    } catch (error) {
      console.error('Error checking date image:', error);
      return false;
    }
  };

  // Get first date with image
  const getFirstImageDate = async () => {
    try {
      const { firstDate } = await apiGet('/api/nutrition-images/first');
      return firstDate ? new Date(firstDate) : null;
    } catch (error) {
      console.error('Error getting first image date:', error);
      return null;
    }
  };

  // Update navigation state
  const updateNavigationState = async () => {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    
    // Check if can navigate forward (to future dates with images, but not beyond today)
    setCanGoForward(!isToday);
    
    // Check if can navigate backward (to past dates with images)
    try {
      const firstImageDate = await getFirstImageDate();
      if (firstImageDate) {
        const earliestDate = new Date(firstImageDate);
        earliestDate.setHours(0, 0, 0, 0);
        setCanGoBack(currentDate > earliestDate);
      } else {
        setCanGoBack(false);
      }
    } catch (error) {
      console.error('Failed to update navigation state:', error);
      // If fetch fails, disable backward navigation
      setCanGoBack(false);
    }
  };

  // Navigate to previous day
  const goToPreviousDay = async () => {
    if (!canGoBack) return;
    
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    // Check if previous day has image, if not continue searching backward
    let targetDate = prevDate;
    const firstImageDate = await getFirstImageDate();
    const earliestDate = firstImageDate || new Date(0);
    
    while (targetDate >= earliestDate) {
      const hasImage = await checkDateHasImage(targetDate);
      if (hasImage) {
        setCurrentDate(targetDate);
        break;
      }
      targetDate.setDate(targetDate.getDate() - 1);
    }
  };

  // Navigate to next day
  const goToNextDay = async () => {
    if (!canGoForward) return;
    
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Check if next day has image, if not continue searching forward
    let targetDate = nextDate;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    while (targetDate <= today) {
      const hasImage = await checkDateHasImage(targetDate);
      if (hasImage) {
        setCurrentDate(targetDate);
        break;
      }
      targetDate.setDate(targetDate.getDate() + 1);
    }
  };

  // Get current user ID
  useEffect(() => {
    const getCurrentUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUserId();
  }, []);

  useEffect(() => {
    updateNavigationState();
  }, [currentDate]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setCurrentDate(date);
  };

  // Open date picker modal
  const openDatePickerModal = () => {
    setShowDatePickerModal(true);
  };

  return (
    <div className={styles.datePicker}>
      {/* Left arrow */}
      <img 
        src={icons.arrowBack} 
        alt="Previous" 
        className={`${styles.arrow} ${!canGoBack ? styles.arrowDisabled : ''}`}
        onClick={goToPreviousDay}
      />
      
      {/* Center date module */}
      <div className={styles.dateModule} onClick={openDatePickerModal}>
        {/* Date text */}
        <span className={`${styles.dateText} h4`}>
          {formatDate(currentDate)}
        </span>
        
        {/* Relative date text */}
        <span className={`${styles.relativeDateText} body2`}>
          {getRelativeDateText(currentDate)}
        </span>
      </div>
      
      {/* Right arrow */}
      <img 
        src={icons.arrowForward} 
        alt="Next" 
        className={`${styles.arrow} ${!canGoForward ? styles.arrowDisabled : ''}`}
        onClick={goToNextDay}
      />
      
      {/* DatePicker Modal */}
      <DatePickerModal
        open={showDatePickerModal}
        onClose={() => setShowDatePickerModal(false)}
        onDateSelect={handleDateSelect}
        currentDate={currentDate}
        userId={userId}
      />
    </div>
  );
} 