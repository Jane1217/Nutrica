import React, { useState, useEffect } from 'react';
import { icons } from '../../../utils';
import { formatDate, getRelativeDateText } from '../../../utils';
import styles from './DatePicker.module.css';
import DatePickerModal from './DatePickerModal';
import { supabase } from '../../../supabaseClient';
import { apiGet } from '../../../utils';
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
    
    // 检查是否有更早的日期可以导航
    let canGoBackward = false;
    if (activeDates.length > 0) {
      const sortedDates = activeDates.slice().sort();
      const currentDateStr = getLocalDateString(currentDate);
      canGoBackward = currentDateStr > sortedDates[0];
    }
    
    // 检查是否有更晚的日期可以导航（但不能超过今天）
    let canGoForward = false;
    if (activeDates.length > 0) {
      const sortedDates = activeDates.slice().sort();
      const currentDateStr = getLocalDateString(currentDate);
      const todayStr = getLocalDateString(today);
      canGoForward = currentDateStr < sortedDates[sortedDates.length - 1] && currentDateStr < todayStr;
    }
    
    setCanGoBack(canGoBackward);
    setCanGoForward(canGoForward);
  };

  // Navigate to previous day
  const goToPreviousDay = async () => {
    if (!canGoBack) return;
    
    // 直接查找前一个有数据的日期
    const currentDateStr = getLocalDateString(currentDate);
    
    // 找到当前日期在activeDates中的索引
    const currentIndex = activeDates.indexOf(currentDateStr);
    
    if (currentIndex > 0) {
      // 如果当前日期不是第一个，取前一个日期
      const prevDateStr = activeDates[currentIndex - 1];
      
      // 将字符串转换为Date对象
      const [year, month, day] = prevDateStr.split('-');
      const prevDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      setCurrentDate(prevDate);
    }
  };

  // Navigate to next day
  const goToNextDay = async () => {
    if (!canGoForward) return;
    
    // 直接查找后一个有数据的日期
    const currentDateStr = getLocalDateString(currentDate);
    
    // 找到当前日期在activeDates中的索引
    const currentIndex = activeDates.indexOf(currentDateStr);
    
    if (currentIndex >= 0 && currentIndex < activeDates.length - 1) {
      // 如果当前日期不是最后一个，取后一个日期
      const nextDateStr = activeDates[currentIndex + 1];
      
      // 将字符串转换为Date对象
      const [year, month, day] = nextDateStr.split('-');
      const nextDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      setCurrentDate(nextDate);
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