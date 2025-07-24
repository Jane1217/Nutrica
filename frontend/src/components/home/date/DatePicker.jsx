import React, { useState, useEffect } from 'react';
import { icons } from '../../../utils/icons';
import { formatDate, getRelativeDateText } from '../../../utils/format';
import styles from './DatePicker.module.css';
import DatePickerModal from './DatePickerModal';
import { supabase } from '../../../supabaseClient';
import { apiGet } from '../../../utils/api';
import { format } from 'date-fns';

// 保存 daily_home_data 快照到 supabase
async function saveDailyHomeData(data) {
  if (!data.user_id || !data.date) return;
  const { error } = await supabase
    .from('daily_home_data')
    .upsert([
      {
        ...data,
        updated_at: new Date().toISOString()
      }
    ], { onConflict: ['user_id', 'date'] });
  if (error) {
    console.error('Failed to save daily home data:', error);
  }
}

// 工具函数：获取本地 yyyy-MM-dd 日期字符串
function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePicker(props) {
  const currentDate = props.currentDate;
  const setCurrentDate = props.setCurrentDate;
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeDates, setActiveDates] = useState([]); // 新增：有数据的日期

  // Update navigation state
  const updateNavigationState = async () => {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    setCanGoForward(!isToday);
    // 只根据 activeDates 判断能否回退
    if (activeDates.length > 0) {
      const sortedDates = activeDates.slice().sort();
      setCanGoBack(getLocalDateString(currentDate) > sortedDates[0]);
    } else {
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
    
    while (true) { // Infinite loop until a date with data is found
      const hasData = activeDates.includes(getLocalDateString(targetDate));
      if (hasData) {
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
    
    while (true) { // Infinite loop until a date with data is found
      const hasData = activeDates.includes(getLocalDateString(targetDate));
      if (hasData) {
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

  // 获取当前用户所有有 daily_home_data 的日期
  useEffect(() => {
    async function fetchActiveDates() {
      if (!props.userId) return;
      const { data, error } = await supabase
        .from('daily_home_data')
        .select('date')
        .eq('user_id', props.userId);
      if (!error && data) {
        setActiveDates(data.map(row => getLocalDateString(new Date(row.date))));
      }
    }
    fetchActiveDates();
  }, [props.userId]);

  useEffect(() => {
    updateNavigationState();
  }, [currentDate, activeDates]); // Add activeDates to dependency array

  // Handle date selection
  const handleDateSelect = async (date) => {
    // 切换日期前，先保存当前页面快照（切换前的日期）
    if (userId && props.homeSnapshot) {
      await saveDailyHomeData({
        ...props.homeSnapshot,
        user_id: userId,
        date: getLocalDateString(currentDate)
      });
    }
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
        <span className={styles.dateText}>
          {formatDate(currentDate)}
        </span>
        
        {/* Relative date text */}
        <span className={styles.relativeDateText}>
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
        activeDates={activeDates} // 新增
      />
    </div>
  );
} 