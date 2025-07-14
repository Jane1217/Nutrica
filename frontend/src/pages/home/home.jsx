import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import NavLogo from '../../components/navbar/Nav-Logo';
import DateDisplayBox from '../../components/home/DateDisplayBox';
import EatModal from '../../components/eat/EatModal';
import UserInfoModal from '../auth/UserInfoModal';
import NutritionGoalModal from '../auth/NutritionGoalModal';
import ModalWrapper from '../../components/ModalWrapper';
import { useSearchParams } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home(props) {
  const [showEatModal, setShowEatModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showNutritionGoalModal, setShowNutritionGoalModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState(null);
  const [latestCalories, setLatestCalories] = useState(2000);

  useEffect(() => {
    if (searchParams.get('eat') === '1') {
      setShowEatModal(true);
    }
  }, [searchParams]);

  // 页面加载时自动从supabase user_metadata读取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setUserInfo(null);
      setUserInfo(user.user_metadata || {});
    };
    fetchUserInfo();
  }, []);

  // 查询数据库中当前用户最近一次提交的calories
  const fetchLatestGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 2000;
    const { data, error } = await supabase
      .from('nutrition_goal')
      .select('calories')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) {
      return 2000;
    }
    return data[0].calories || 2000;
  };

  // 检查用户信息是否缺失，缺失则弹窗
  useEffect(() => {
    const checkUserInfo = async () => {
      const hasShown = localStorage.getItem('nutrica_userinfo_shown');
      if (hasShown) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const info = user.user_metadata || {};
      // 检查是否缺少关键信息
      if (!info.name || !info.gender || !info.age || !info.height || !info.weight) {
        setShowUserInfoModal(true);
      }
    };
    checkUserInfo();
  }, []);

  // 提交信息时写入supabase user_metadata，并并行切换弹窗，与 Account settings 页面逻辑一致
  const handleUserInfoSubmit = async (data) => {
    setShowUserInfoModal(false); // 立即关闭信息收集弹窗
    setShowNutritionGoalModal(true); // 立即打开营养目标弹窗
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // 合并原有meta，避免覆盖其他字段
    const newMeta = { ...user.user_metadata, ...data };
    const { error } = await supabase.auth.updateUser({ data: newMeta });
    
    if (!error) {
      setUserInfo(newMeta);
      // 只有在成功保存后才设置标记，避免重复弹出
      localStorage.setItem('nutrica_userinfo_shown', '1');
    } else {
      console.error('保存用户信息失败:', error);
      // 保存失败时关闭营养目标弹窗，重新打开用户信息弹窗
      setShowNutritionGoalModal(false);
      setShowUserInfoModal(true);
    }
  };

  // 营养目标弹窗返回信息收集弹窗
  const handleNutritionGoalBack = () => {
    setShowNutritionGoalModal(false);
    setShowUserInfoModal(true);
  };

  // 保存用户填写的卡路里值到 nutrition_goal 表
  const handleSaveCalories = async (calories) => {
    // 计算三大营养素
    const carbs = Math.round((0.50 * calories) / 4);
    const fats = Math.round((0.30 * calories) / 9);
    const protein = Math.round((0.20 * calories) / 4);

    // 获取当前用户id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 插入到 nutrition_goal 表
    const { error } = await supabase
      .from('nutrition_goal')
      .insert([
        {
          user_id: user.id,
          calories,
          carbs,
          fats,
          protein,
          created_at: new Date().toISOString()
        }
      ]);
    if (error) {
      console.error('保存失败', error);
    }
    setShowNutritionGoalModal(false);
  };

  return (
    <>
      <NavLogo onEatClick={() => setShowEatModal(true)} isLoggedIn={props.isLoggedIn} isAuth={false} />
      <div className={styles['home-main']}>
        <DateDisplayBox />
        {showEatModal && (
          <EatModal
            onClose={() => setShowEatModal(false)}
            foods={[]}
            onDescribe={() => alert('Describe')}
            onEnterValue={() => alert('Enter Value')}
            onScanLabel={() => alert('Scan Label')}
          />
        )}
        <UserInfoModal
          open={showUserInfoModal}
          onClose={() => setShowUserInfoModal(false)}
          onSubmit={handleUserInfoSubmit}
          initialData={userInfo || {}}
        />
        <ModalWrapper open={showNutritionGoalModal} onClose={() => setShowNutritionGoalModal(false)}>
          <NutritionGoalModal
            onClose={() => setShowNutritionGoalModal(false)}
            onBack={handleNutritionGoalBack}
            onSave={handleSaveCalories}
            name={userInfo?.name || ''}
            calories={latestCalories}
          />
        </ModalWrapper>
      </div>
    </>
  );
} 