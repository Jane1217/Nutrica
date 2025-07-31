import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, startOfDay, isAfter, isBefore, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import 'react-day-picker/style.css';
import styles from './DatePickerModal.module.css';
import { supabase } from '../../../supabaseClient';
import { apiGet } from '../../../utils';
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
  const [hasFetchedDates, setHasFetchedDates] = useState(false); // 新增：是否已请求过
  const [monthChangeCount, setMonthChangeCount] = useState(0); // 新增：跟踪月份变化次数

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
      // 只用 activeDates，不再请求 nutrition-images API
      setAvailableDates(activeDateObjs);
      if (activeDateObjs.length > 0) {
        const sortedDates = activeDateObjs.sort((a, b) => a.getTime() - b.getTime());
        setFirstPuzzleDate(sortedDates[0]);
      }
    } catch (error) {
      console.error('Failed to fetch available dates:', error);
      setAvailableDates([]);
    } finally {
      setLoading(false);
    }
  };

  // 优化：只在首次打开时请求日期
  useEffect(() => {
    if (open && !hasFetchedDates) {
      fetchAvailableDates().then(() => setHasFetchedDates(true));
    }
  }, [open, hasFetchedDates]);

  useEffect(() => {
    if (currentDate && currentDate instanceof Date && !isNaN(currentDate.getTime())) {
      setSelectedDate(currentDate);
    }
  }, [currentDate]);

  // Set initial month - 根据选中的日期设置月份
  useEffect(() => {
    if (selectedDate) {
      // 如果选中的日期与当前显示的月份不同，则切换到选中日期所在月份
      if (currentMonth.getMonth() !== selectedDate.getMonth() || currentMonth.getFullYear() !== selectedDate.getFullYear()) {
        console.log('Switching to selected date month:', selectedDate);
        setCurrentMonth(selectedDate);
      }
    } else if (activeDateObjs.length > 0 && firstPuzzleDate) {
      // 如果没有选中日期但有历史数据，显示第一个有数据的月份
      if (currentMonth.getMonth() !== firstPuzzleDate.getMonth() || currentMonth.getFullYear() !== firstPuzzleDate.getFullYear()) {
        console.log('Switching to first puzzle date month:', firstPuzzleDate);
        setCurrentMonth(firstPuzzleDate);
      }
    } else {
      // 默认显示当前月份
      const now = new Date();
      if (currentMonth.getMonth() !== now.getMonth() || currentMonth.getFullYear() !== now.getFullYear()) {
        console.log('Switching to current month:', now);
        setCurrentMonth(now);
      }
    }
  }, [selectedDate, firstPuzzleDate]);

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
    // 今天始终可选，不管数据库中是否有数据
    if (isToday) return false;
    // 没有任何 active 日期时，不允许其他日期
    if (activeDateObjs.length === 0) return true;
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
    console.log('Month change requested to:', month);
    console.log('Current month before change:', currentMonth);
    // 允许导航到任何月份，不限制只有可选日期的月份
    setCurrentMonth(month);
    setMonthChangeCount(prev => prev + 1);
    console.log('Month change applied, count:', monthChangeCount + 1);
    return true;
  };

  // Check if previous month navigation is disabled
  const isPreviousMonthDisabled = () => {
    // 允许导航到任何过去的月份
    console.log('Previous month disabled check: false (always allowed)');
    return false;
  };

  // Check if next month navigation is disabled
  const isNextMonthDisabled = () => {
    // 禁用未来月份导航
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const today = new Date();
    const isDisabled = nextMonth.getMonth() > today.getMonth() || 
           (nextMonth.getMonth() === today.getMonth() && nextMonth.getFullYear() > today.getFullYear());
    console.log('Next month disabled check:', isDisabled, 'nextMonth:', nextMonth, 'today:', today);
    return isDisabled;
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
                  weekday: styles.weekdayHeader,
                  day: styles.dayCell,
                  day_disabled: styles.dayCellDisabled,
                  selected: styles.dayCellSelected,
                }}
                formatters={{
                  formatWeekdayName: (date) => {
                    const map = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    // 让周一在最前面，周日最后
                    return map[(date.getDay() + 6) % 7];
                  }
                }}
              />
            </DatePickerErrorBoundary>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
} 