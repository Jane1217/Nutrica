import React, { useState } from 'react';
import { NavLogo, NavMenu } from '../../components/navbar';
import DailyView from './Daily view';
import WeeklyView from './Weekly view';
import TodayView from './TodayView';
import styles from './Meals.module.css';

// 日期工具函数
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getToday() {
  const now = new Date();
  now.setHours(0,0,0,0);
  return now;
}

export default function Meals(props) {
  const [view, setView] = useState('Day');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAllDates, setShowAllDates] = useState(false);

  // 假设有历史日期列表，实际应由后端/本地数据动态生成
  // 这里只做演示，后续可由props传递或fetch
  const start = new Date('2025-05-01');
  const end = new Date('2025-07-02');
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  // 只显示最近7天
  const recentDates = dates.slice(-7);

  // week picker（以周一为起点）
  function getWeekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    d.setHours(0,0,0,0);
    return d;
  }
  function getWeekRange(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return [start, end];
  }
  // week列表
  const weeks = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
    weeks.push(new Date(d));
  }
  const recentWeeks = weeks.slice(-4);

  return (
    <>
      <NavLogo />
      <NavMenu isLoggedIn={props.isLoggedIn} userEmail={props.userEmail} />
      <div className={styles['meals-root']}>
        <div className={styles['meals-main']}>
          {/* 大标题 */}
          <div className={styles['meals-title']}>Meals</div>
          {/* Tab区 */}
          <div className={styles['meals-tabs']}>
            {['Day', 'Week', 'Today'].map(tab => (
              <div
                key={tab}
                className={view === tab ? styles['meals-tab-active'] : styles['meals-tab']}
                onClick={() => {
                  if (tab === 'Today') {
                    setView('Today');
                    setSelectedDate(getToday());
                  } else {
                    setView(tab);
                  }
                }}
              >{tab}</div>
            ))}
          </div>
          {/* 只在 Day 视图显示日期条 */}
          {view === 'Day' && (
            <div className={styles['meals-datebar']}>
              {(showAllDates ? dates : recentDates).map(date => (
                <div
                  key={formatDate(date)}
                  className={isSameDay(date, selectedDate) ? styles['meals-date-active'] : styles['meals-date']}
                  onClick={() => setSelectedDate(new Date(date))}
                >
                  <div>{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0,1)}</div>
                  <div>{date.getDate()}</div>
                </div>
              ))}
              <div className={styles['meals-date-dropdown']} onClick={() => setShowAllDates(v => !v)}>
                {showAllDates ? '▲' : '▼'}
              </div>
            </div>
          )}
          {/* 视图内容 */}
          {view === 'Day' && <DailyView {...props} selectedDate={selectedDate} />}
          {view === 'Week' && <WeeklyView {...props} selectedDate={selectedDate} />}
          {view === 'Today' && <TodayView {...props} />}
        </div>
      </div>
    </>
  );
} 