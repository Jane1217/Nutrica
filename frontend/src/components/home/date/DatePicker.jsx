import React, { useState, useEffect, lazy, Suspense } from 'react';
import { icons } from '../../../utils';
import { formatDate, getRelativeDateText } from '../../../utils';
import styles from './DatePicker.module.css';
// react-day-picker 只在用户第一次打开日历时才加载
const DatePickerModal = lazy(() => import('./DatePickerModal'));
import { supabase } from '../../../supabaseClient';

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
  const [datePickerOpened, setDatePickerOpened] = useState(false); // 打开过之后保持挂载，保留关闭动画
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
    
    // 否则查找比当前日期更早的、最近一个有数据的日期（数据库返回顺序不保证有序）
    const prevDateStr = [...activeDates].sort().reverse().find(d => d < currentDateStr);
    if (prevDateStr) {
      const [year, month, day] = prevDateStr.split('-');
      setCurrentDate(new Date(Number(year), Number(month) - 1, Number(day)));
    }
  };

  // Navigate to next day
  const goToNextDay = async () => {
    if (!canGoForward) return;
    
    const currentDateStr = getLocalDateString(currentDate);
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    // 优先查找比当前日期更晚、且不晚于今天的最近一个有数据的日期
    const nextDateStr = [...activeDates].sort().find(d => d > currentDateStr && d < todayStr);
    if (nextDateStr) {
      const [year, month, day] = nextDateStr.split('-');
      setCurrentDate(new Date(Number(year), Number(month) - 1, Number(day)));
      return;
    }
    
    // 没有更晚的有数据日期，且当前日期早于今天，则导航到今天
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
        setActiveDates(data
          .map(row => typeof row.date === 'string' ? row.date.slice(0, 10) : '')
          .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)));
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
    // 只在离开"今天"时保存：过去日期的快照本来就来自数据库，
    // 重新保存会把别的数据写进没有记录的日期
    if (userId && props.homeSnapshot?.puzzle_name
        && getLocalDateString(currentDate) === getLocalDateString(new Date())) {
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
    setDatePickerOpened(true);
    setShowDatePickerModal(true);
  };

  return (
    <div className={styles.datePicker}>
      {/* Left arrow */}
      <button
        type="button"
        className={`${styles.arrowButton} ${!canGoBack ? styles.arrowDisabled : ''}`}
        onClick={goToPreviousDay}
        disabled={!canGoBack}
        aria-label="Previous date"
      >
        <img src={icons.arrowBack} alt="" className={styles.arrow} />
      </button>
      
      {/* Center date module */}
      <button type="button" className={styles.dateModule} onClick={openDatePickerModal} aria-label="Choose date">
        {/* Date text */}
        <span className={styles.dateText}>
          {formatDate(currentDate)}
        </span>
        
        {/* Relative date text */}
        <span className={styles.relativeDateText}>
          {getRelativeDateText(currentDate)}
        </span>
      </button>
      
      {/* Right arrow */}
      <button
        type="button"
        className={`${styles.arrowButton} ${!canGoForward ? styles.arrowDisabled : ''}`}
        onClick={goToNextDay}
        disabled={!canGoForward}
        aria-label="Next date"
      >
        <img src={icons.arrowForward} alt="" className={styles.arrow} />
      </button>
      
      {/* DatePicker Modal */}
      {datePickerOpened && (
        <Suspense fallback={null}>
        <DatePickerModal
          open={showDatePickerModal}
          onClose={() => setShowDatePickerModal(false)}
          onDateSelect={handleDateSelect}
          currentDate={currentDate}
          userId={userId}
          activeDates={activeDates} // 新增
        />
        </Suspense>
      )}
    </div>
  );
}
