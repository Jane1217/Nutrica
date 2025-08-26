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
    const currentDateStr = getLocalDateString(currentDate);
    const todayStr = getLocalDateString(today);
    
    // 如果当前日期是今天，允许导航到昨天
    if (currentDateStr === todayStr) {
      canGoBackward = true;
    } else if (activeDates.length > 0) {
      // 如果当前日期不是今天，检查是否有更早的有数据的日期
      const sortedDates = activeDates.slice().sort();
      canGoBackward = currentDateStr > sortedDates[0];
    }
    
    // 检查是否有更晚的日期可以导航
    let canGoForward = false;
    
    // 如果当前日期是昨天或更早，允许导航到今天
    if (currentDateStr < todayStr) {
      canGoForward = true;
    } else if (activeDates.length > 0) {
      // 如果当前日期是今天，检查是否有更晚的有数据的日期
      const sortedDates = activeDates.slice().sort();
      canGoForward = currentDateStr < sortedDates[sortedDates.length - 1];
    }
    
    setCanGoBack(canGoBackward);
    setCanGoForward(canGoForward);
  };

  // Navigate to previous day
  const goToPreviousDay = async () => {
    if (!canGoBack) return;
    
    const currentDateStr = getLocalDateString(currentDate);
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    // 如果当前日期是今天，直接导航到昨天
    if (currentDateStr === todayStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setCurrentDate(yesterday);
      return;
    }
    
    // 否则查找前一个有数据的日期
    if (activeDates.length > 0) {
      const currentIndex = activeDates.indexOf(currentDateStr);
      if (currentIndex > 0) {
        const prevDateStr = activeDates[currentIndex - 1];
        const [year, month, day] = prevDateStr.split('-');
        const prevDate = new Date(Number(year), Number(month) - 1, Number(day));
        setCurrentDate(prevDate);
      }
    }
  };

  // Navigate to next day
  const goToNextDay = async () => {
    if (!canGoForward) return;
    
    const currentDateStr = getLocalDateString(currentDate);
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    // 如果当前日期是昨天，直接导航到今天
    if (currentDateStr === getLocalDateString(new Date(today.getTime() - 24 * 60 * 60 * 1000))) {
      setCurrentDate(today);
      return;
    }
    
    // 否则优先查找后一个有数据的日期
    if (activeDates.length > 0) {
      const currentIndex = activeDates.indexOf(currentDateStr);
      if (currentIndex >= 0 && currentIndex < activeDates.length - 1) {
        const nextDateStr = activeDates[currentIndex + 1];
        const [year, month, day] = nextDateStr.split('-');
        const nextDate = new Date(Number(year), Number(month) - 1, Number(day));
        setCurrentDate(nextDate);
        return;
      }
    }
    
    // 如果没有找到有数据的日期，且当前日期小于今天，则导航到今天
    if (currentDateStr < todayStr) {
      setCurrentDate(today);
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