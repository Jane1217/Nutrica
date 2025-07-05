import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Detail from '../../components/meal/Detail';
import Timeline from '../../components/meal/Timeline';

export default function TodayView({ userEmail, isLoggedIn }) {
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [userId, setUserId] = useState(null);
  const today = new Date();
  today.setHours(0,0,0,0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    let from = new Date(today);
    let to = new Date(today);
    from.setHours(0,0,0,0);
    to.setHours(23,59,59,999);
    supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('time', from.toISOString())
      .lte('time', to.toISOString())
      .order('time', { ascending: true })
      .then(({ data }) => setMeals(data || []));
  }, [userId]);

  const totalKcal = meals.reduce((sum, m) => sum + (m.nutrition.Calories || 0), 0);
  const timelineData = meals.map(meal => ({
    time: new Date(meal.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    name: meal.name,
    calories: meal.nutrition.Calories,
    mealObj: meal
  }));

  return (
    <div>
      {/* 顶部日期和总kcal */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <div style={{fontWeight:700,fontSize:18}}>
          {today && today.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'2-digit', day:'2-digit' })}
        </div>
        <div style={{fontWeight:500,fontSize:16}}>{totalKcal} kcal</div>
      </div>
      {/* 时间线展示 */}
      {meals.length === 0 ? (
        <div>No meals recorded.</div>
      ) : (
        <Timeline data={timelineData} onCardClick={setSelectedMeal} />
      )}
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