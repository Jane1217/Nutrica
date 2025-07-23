import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, startOfDay, isAfter, isBefore, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import 'react-day-picker/style.css';
import styles from './DatePickerModal.module.css';
import { supabase } from '../../../supabaseClient';
import { apiGet } from '../../../utils/api';
import ModalWrapper from '../../common/ModalWrapper';

// Error Boundary Component
class DatePickerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DatePicker Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <span className="body1">Something went wrong with the date picker.</span>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 工具函数：获取本地 yyyy-MM-dd 日期字符串
function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerModal({ open, onClose, onDateSelect, currentDate, userId, activeDates = [] }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    if (currentDate && currentDate instanceof Date && !isNaN(currentDate.getTime())) {
      return currentDate;
    }
    return new Date();
  });
  const [loading, setLoading] = useState(false);
  const [firstPuzzleDate, setFirstPuzzleDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]); // 新增：可用日期

  // 新增：将 activeDates 转为 Date 对象数组
  const activeDateObjs = activeDates.map(dateStr => {
    // 统一用 yyyy-MM-dd 拆分
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }).filter(Boolean);

  // Get dates with nutrition images
  const fetchAvailableDates = async () => {
    setLoading(true);
    try {
      // First try using API
      console.log('Trying to fetch dates via API...');
      const { dates } = await apiGet('/api/nutrition-images/dates');
      console.log('API returned dates:', dates);
      const dateObjects = dates.map(dateStr => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      }).filter(date => date !== null);
      
      // 优先使用 activeDates，如果没有则使用 API 返回的日期
      if (activeDateObjs.length > 0) {
        setAvailableDates(activeDateObjs);
      } else {
        setAvailableDates(dateObjects);
      }
      
      // Set first puzzle date
      if (activeDateObjs.length > 0) {
        const sortedDates = activeDateObjs.sort((a, b) => a.getTime() - b.getTime());
        setFirstPuzzleDate(sortedDates[0]);
      } else if (dateObjects.length > 0) {
        const sortedDates = dateObjects.sort((a, b) => a.getTime() - b.getTime());
        setFirstPuzzleDate(sortedDates[0]);
      }
    } catch (error) {
      console.error('API failed to fetch available dates:', error);
      // If API fails, try to get from Supabase directly
      try {
        console.log('API failed, trying to get from Supabase directly...');
        const { data, error } = await supabase
          .from('nutrition_images')
          .select('date')
          .eq('user_id', userId);
        
        if (error) {
          console.error('Supabase failed to fetch dates:', error);
          setAvailableDates([]);
          return;
        }
        
        console.log('Supabase returned data:', data);
        const dateObjects = data.map(item => {
          const date = new Date(item.date);
          return isNaN(date.getTime()) ? null : date;
        }).filter(date => date !== null);
        
        // 优先使用 activeDates，如果没有则使用 Supabase 返回的日期
        if (activeDateObjs.length > 0) {
          setAvailableDates(activeDateObjs);
        } else {
          setAvailableDates(dateObjects);
        }
        
        // Set first puzzle date
        if (activeDateObjs.length > 0) {
          const sortedDates = activeDateObjs.sort((a, b) => a.getTime() - b.getTime());
          setFirstPuzzleDate(sortedDates[0]);
        } else if (dateObjects.length > 0) {
          const sortedDates = dateObjects.sort((a, b) => a.getTime() - b.getTime());
          setFirstPuzzleDate(sortedDates[0]);
        }
      } catch (supabaseError) {
        console.error('Supabase fallback also failed:', supabaseError);
        setAvailableDates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailableDates();
    }
  }, [open, userId, activeDates]); // Add activeDates to dependency array

  useEffect(() => {
    if (currentDate && currentDate instanceof Date && !isNaN(currentDate.getTime())) {
      setSelectedDate(currentDate);
    }
  }, [currentDate]);

  // Set initial month
  useEffect(() => {
    if (activeDateObjs.length === 0) {
      const now = new Date();
      if (currentMonth.getMonth() !== now.getMonth() || currentMonth.getFullYear() !== now.getFullYear()) {
        setCurrentMonth(now);
      }
    } else if (selectedDate) {
      if (currentMonth.getMonth() !== selectedDate.getMonth() || currentMonth.getFullYear() !== selectedDate.getFullYear()) {
        setCurrentMonth(selectedDate);
      }
    } else if (firstPuzzleDate) {
      if (currentMonth.getMonth() !== firstPuzzleDate.getMonth() || currentMonth.getFullYear() !== firstPuzzleDate.getFullYear()) {
        setCurrentMonth(firstPuzzleDate);
      }
    }
  }, [activeDateObjs, selectedDate, firstPuzzleDate]);

  const handleDateSelect = (date) => {
    if (date && date instanceof Date && !isNaN(date.getTime())) {
      setSelectedDate(date);
      if (onDateSelect) {
        onDateSelect(date);
      }
      onClose();
    }
  };

  // 判断某天是否为 active（可选）
  const hasDataForDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    return activeDateObjs.some(activeDate => isSameDay(activeDate, date));
  };

  // 判断某天是否 disabled
  const isDateDisabled = (date) => {
    const today = startOfDay(new Date());
    const isToday = isSameDay(date, today);
    const isFuture = isAfter(date, today);
    // 禁用未来日期
    if (isFuture) return true;
    // 没有任何 active 日期时，只允许今天
    if (activeDateObjs.length === 0) return !isToday;
    // 只允许 active 日期
    return !hasDataForDate(date);
  };

  // Check if a month has any selectable dates
  const hasSelectableDatesInMonth = (month) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    return daysInMonth.some(day => !isDateDisabled(day));
  };

  // Handle month change
  const handleMonthChange = (month) => {
    // Only allow navigation to months with selectable dates
    if (hasSelectableDatesInMonth(month)) {
      setCurrentMonth(month);
      return true;
    }
    return false;
  };

  // Check if previous month navigation is disabled
  const isPreviousMonthDisabled = () => {
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return !hasSelectableDatesInMonth(previousMonth);
  };

  // Check if next month navigation is disabled
  const isNextMonthDisabled = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return !hasSelectableDatesInMonth(nextMonth);
  };

  return (
    <ModalWrapper open={open} onClose={onClose} centered={true}>
      <div className={styles.modal}>
        {/* DatePicker */}
        <div className={styles.datePickerContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <span className="body1">Loading...</span>
            </div>
          ) : (
            <DatePickerErrorBoundary>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                navLayout="around"
                month={currentMonth}
                onMonthChange={handleMonthChange}
                className={styles.customDayPicker}
                classNames={{
                  nav_button_previous: isPreviousMonthDisabled() ? styles.navButtonDisabled : '',
                  nav_button_next: isNextMonthDisabled() ? styles.navButtonDisabled : '',
                }}
              />
            </DatePickerErrorBoundary>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
} 