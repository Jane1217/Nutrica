import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import NavLogo from '../../components/navbar/Nav-Logo';
import DateDisplayBox from '../../components/home/DateDisplayBox';
import EatModal from '../eat/modals/EatModal';
import UserInfoModal from '../auth/modals/UserInfoModal';
import NutritionGoalModal from '../auth/modals/NutritionGoalModal';
import ModalWrapper from '../../components/common/ModalWrapper';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { calculateNutritionFromCalories, formatFoods } from '../../utils/nutrition';

export default function Home(props) {
  const [showEatModal, setShowEatModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showNutritionGoalModal, setShowNutritionGoalModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [latestCalories, setLatestCalories] = useState(2000);
  const [userId, setUserId] = useState(null);
  const [foods, setFoods] = useState([]);
  const [foodsPage, setFoodsPage] = useState(1); // 当前页数
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodsTotal, setFoodsTotal] = useState(0); // 总数据量
  const foodsPerPage = 5;
  const foodsAllRef = useRef([]); // 保存所有foods原始数据

  useEffect(() => {
    if (searchParams.get('eat') === '1') {
      setShowEatModal(true);
    }
  }, [searchParams]);

  // 页面加载时自动从supabase user_metadata读取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserInfo(null);
        setUserId(null);
        return;
      }
      setUserInfo(user.user_metadata || {});
      setUserId(user.id);
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

  // 分页加载foods
  const fetchFoods = async (reset = false) => {
    if (!userId) return;
    setFoodsLoading(true);
    
    const page = reset ? 1 : foodsPage;
    const from = (page - 1) * foodsPerPage;
    const to = from + foodsPerPage - 1;
    
    const { data, error, count } = await supabase
      .from('food')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('time', { ascending: false })
      .range(from, to);
    
    setFoodsLoading(false);
    
    if (error) {
      console.error('获取食物数据失败:', error);
      setFoods([]);
      foodsAllRef.current = [];
      setFoodsTotal(0);
      return;
    }
    
    const foodsFormatted = formatFoods(data || []);
    
    if (reset) {
      // 重置时，直接设置当前页数据
      setFoods(foodsFormatted);
      foodsAllRef.current = data || [];
      setFoodsTotal(count || 0);
    } else {
      // 加载更多时，追加到现有数据
      setFoods(prevFoods => [...prevFoods, ...foodsFormatted]);
      foodsAllRef.current = [...foodsAllRef.current, ...(data || [])];
    }
  };

  // 首次加载和userId变化时重置分页
  useEffect(() => {
    setFoodsPage(1);
    fetchFoods(true);
  }, [userId]);

  // 分页加载更多
  const handleLoadMoreFoods = () => {
    const nextPage = foodsPage + 1;
    setFoodsPage(nextPage);
    fetchFoods(false);
  };

  // EatModal 新增/修改后自动刷新foods
  const handleEatModalDataChange = () => {
    setFoodsPage(1);
    fetchFoods(true);
  };

  // EatModal滚动到底部时加载更多
  const handleEatModalScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 10 && !foodsLoading) {
      // 检查是否还有更多数据
      if (foods.length < foodsTotal) {
        const nextPage = foodsPage + 1;
        setFoodsPage(nextPage);
        fetchFoods(false);
      }
    }
  };

  // 关闭EatModal时不重置foodsPage和foods
  // 只在handleEatModalDataChange时重置

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
    
    // 立即更新userInfo状态，包含计算出的卡路里值
    const newMeta = { ...userInfo, ...data };
    setUserInfo(newMeta);
    
    // 异步保存到Supabase，不阻塞UI更新
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.auth.updateUser({ data: newMeta });
    
    if (!error) {
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
    const { carbs, fats, protein } = calculateNutritionFromCalories(calories);
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

  // 获取要显示的卡路里值：优先使用计算值，其次使用数据库值
  const getDisplayCalories = () => {
    if (userInfo?.calculatedCalories) {
      return userInfo.calculatedCalories;
    }
    return latestCalories;
  };

  return (
    <>
      <NavLogo onEatClick={() => setShowEatModal(true)} isLoggedIn={props.isLoggedIn} isAuth={false} />
      <div className={styles['home-main']}>
      <DateDisplayBox />
        <EatModal
          open={showEatModal}
          onClose={() => {
            setShowEatModal(false);
            navigate('/', { replace: true });
          }}
          foods={foods}
          foodsLoading={foodsLoading}
          onDescribe={() => alert('Describe')}
          onEnterValue={() => alert('Enter Value')}
          onScanLabel={() => alert('Scan Label')}
          userId={userId}
          onDataChange={handleEatModalDataChange}
          onFoodsScroll={handleEatModalScroll}
        />
        <UserInfoModal
          open={showUserInfoModal}
          onClose={() => setShowUserInfoModal(false)}
          onSubmit={handleUserInfoSubmit}
          initialData={userInfo || {}}
        />
        <NutritionGoalModal
          open={showNutritionGoalModal}
          onClose={() => setShowNutritionGoalModal(false)}
          onBack={handleNutritionGoalBack}
          onSave={handleSaveCalories}
          name={userInfo?.name || ''}
          calories={getDisplayCalories()}
        />
    </div>
    </>
  );
} 