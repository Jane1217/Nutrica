import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Detail from '../../components/meal/Detail';
import Timeline from '../../components/meal/Timeline';
import styles from './Meals.module.css';

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
function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export default function WeeklyView({ userEmail, isLoggedIn, selectedDate }) {
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeWeek, setActiveWeek] = useState(getWeekStart(selectedDate || new Date()));
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    setActiveWeek(getWeekStart(selectedDate || new Date()));
  }, [selectedDate]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId || !activeWeek) return;
    let from = new Date(activeWeek);
    let to = new Date(activeWeek);
    to.setDate(from.getDate() + 6);
    to.setHours(23,59,59,999);
    supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('time', from.toISOString())
      .lte('time', to.toISOString())
      .order('time', { ascending: true })
      .then(({ data }) => setMeals(data || []));
  }, [userId, activeWeek]);

  // 生成所有周区间（假设2025-05-01~2025-07-02）
  const allWeeks = [];
  let d = new Date('2025-05-01');
  while (d <= new Date('2025-07-02')) {
    allWeeks.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }

  const [weekStart, weekEnd] = getWeekRange(activeWeek);

  // 按天分组
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  const mealsByDay = days.map(day => {
    const dayMeals = meals.filter(m => {
      const t = new Date(m.time);
      return t.getFullYear() === day.getFullYear() && t.getMonth() === day.getMonth() && t.getDate() === day.getDate();
    });
    return { day, meals: dayMeals };
  });

  // 每天最多3条，超出可展开
  return (
    <div>
      {/* 顶部周区间和下拉 */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:16}}>
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </div>
        <div style={{width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} onClick={()=>setShowAllWeeks(v=>!v)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0_34_2392)">
              <path d="M7.41 8.58997L12 13.17L16.59 8.58997L18 9.99997L12 16L6 9.99997L7.41 8.58997Z" fill="black"/>
            </g>
            <defs>
              <clipPath id="clip0_34_2392">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        {showAllWeeks && (
          <div style={{position:'absolute',background:'#fff',border:'1px solid #000',zIndex:10}}>
            {allWeeks.map(w => {
              const [s,e] = getWeekRange(w);
              return (
                <div key={s.toISOString()} style={{padding:'4px 12px',cursor:'pointer'}} onClick={()=>{setActiveWeek(new Date(w));setShowAllWeeks(false);}}>
                  {formatDate(s)} - {formatDate(e)}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* 内容分天展示 */}
      {mealsByDay.map(({day, meals}) => {
        const totalKcal = meals.reduce((sum, m) => sum + (m.nutrition.Calories || 0), 0);
        const showExpand = meals.length > 3;
        const showMeals = expandedDay === day.toDateString() ? meals : meals.slice(0,3);
        return (
          <div key={day.toDateString()} style={{marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <div style={{fontWeight:700,fontSize:14}}>{day.toLocaleDateString('en-US', { weekday:'long', month:'2-digit', day:'2-digit' })}</div>
              <div style={{fontWeight:500,fontSize:14}}>{totalKcal} kcal</div>
              {showExpand && (
                <span style={{cursor:'pointer',fontSize:16}} onClick={()=>setExpandedDay(expandedDay===day.toDateString()?null:day.toDateString())}>
                  {expandedDay===day.toDateString()?'▲':'▼'}
                </span>
              )}
            </div>
            {showMeals.length === 0 ? <div style={{color:'#888',fontSize:13}}>No meals</div> :
              showMeals.map(meal => (
                <div key={meal.id} style={{marginBottom:6}}>
                  <Timeline data={[{
                    time: new Date(meal.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    name: meal.name,
                    calories: meal.nutrition.Calories,
                    mealObj: meal
                  }]} onCardClick={m=>setSelectedMeal(m)} />
                </div>
              ))
            }
          </div>
        );
      })}
      {selectedMeal && (
        <Detail
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onUpdate={updated => setMeals(meals.map(m => m.id === updated.id ? updated : m))}
          onDuplicate={dup => setMeals([...meals, dup])}
          onDelete={id => { setMeals(meals.filter(m => m.id !== id)); setSelectedMeal(null); }}
        />
      )}
    </div>
  );
} 