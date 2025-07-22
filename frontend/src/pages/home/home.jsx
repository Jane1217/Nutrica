import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import NavLogo from '../../components/navbar/Nav-Logo';
import DatePicker from '../../components/home/date/DatePicker';
import PuzzleTextModule from '../../components/home/puzzle/PuzzleTextModule';
import PuzzleContainer from '../../components/home/puzzle/PuzzleContainer';
import NutritionCard from '../../components/home/nutrition/NutritionCard';
import EatModal from '../eat/modals/EatModal';
import UserInfoModal from '../auth/modals/UserInfoModal';
import NutritionGoalModal from '../auth/modals/NutritionGoalModal';
import NutritionPuzzlesModal from './puzzles/NutritionPuzzlesModal';

import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { calculateNutritionFromCalories, formatFoods, fetchNutritionGoals, fetchTodayNutrition } from '../../utils/nutrition';
import { getCurrentUser, getUserMetadata, updateUserMetadata, isUserInfoComplete, hasShownUserInfoModal, setUserInfoModalShown, getDisplayCalories } from '../../utils/user';

export default function Home(props) {
  const [showEatModal, setShowEatModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showNutritionGoalModal, setShowNutritionGoalModal] = useState(false);
  const [showPuzzlesModal, setShowPuzzlesModal] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null); // 新增：选中的puzzle
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
  
  // 营养数据状态
  const [nutritionGoals, setNutritionGoals] = useState({ calories: 2000, carbs: 200, protein: 150, fats: 65 });
  const [todayNutrition, setTodayNutrition] = useState({ calories: 0, carbs: 0, protein: 0, fats: 0 });

  useEffect(() => {
    if (searchParams.get('eat') === '1') {
      setShowEatModal(true);
    }
  }, [searchParams]);

  // 页面加载时自动从supabase user_metadata读取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setUserInfo(null);
        setUserId(null);
        return;
      }
      const metadata = await getUserMetadata();
      setUserInfo(metadata);
      setUserId(user.id);
    };
    fetchUserInfo();
  }, []);

  // 获取用户最新的营养目标
  const fetchNutritionGoalsData = async () => {
    if (!userId) return;
    const goals = await fetchNutritionGoals(supabase, userId);
    setNutritionGoals(goals);
  };

  // 获取今日营养摄入数据
  const fetchTodayNutritionData = async () => {
    if (!userId) return;
    const nutrition = await fetchTodayNutrition(supabase, userId);
    setTodayNutrition(nutrition);
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

  // 首次加载和userId变化时重置分页并获取营养数据
  useEffect(() => {
    setFoodsPage(1);
    fetchFoods(true);
    fetchNutritionGoalsData();
    fetchTodayNutritionData();
  }, [userId]);



  // EatModal 新增/修改后自动刷新foods和营养数据
  const handleEatModalDataChange = () => {
    setFoodsPage(1);
    fetchFoods(true);
    fetchTodayNutritionData(); // 刷新今日营养数据
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
      if (hasShownUserInfoModal()) return;
      
      const user = await getCurrentUser();
      if (!user) return;
      
      const info = await getUserMetadata();
      // 检查是否缺少关键信息
      if (!isUserInfoComplete(info)) {
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
    
    try {
      // 异步保存到Supabase，不阻塞UI更新
      await updateUserMetadata(newMeta);
      // 只有在成功保存后才设置标记，避免重复弹出
      setUserInfoModalShown();
    } catch (error) {
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
  const getDisplayCaloriesValue = () => {
    return getDisplayCalories(userInfo, latestCalories);
  };

  // 新增：处理puzzle选择
  const handlePuzzleSelect = (puzzle) => {
    setSelectedPuzzle(puzzle);
    setShowPuzzlesModal(false);
  };

  return (
    <>
      <NavLogo onEatClick={() => setShowEatModal(true)} isLoggedIn={props.isLoggedIn} isAuth={false} />
      <div className={styles['home-main']}>
        <div className={styles.container}>
          <DatePicker />
          <PuzzleTextModule 
            puzzleName={selectedPuzzle?.name || "Magic Garden"}
            puzzleText={selectedPuzzle?.name || "Carrot"}
            userName={userInfo?.name || 'User'}
            hasSelectedPuzzle={!!selectedPuzzle}
          />
          <PuzzleContainer
            hasSelectedPuzzle={!!selectedPuzzle}
            onChoosePuzzle={() => setShowPuzzlesModal(true)}
            selectedPuzzle={selectedPuzzle}
          >
            {/* 拼图内容将在这里 */}
          </PuzzleContainer>
          <NutritionCard 
            calories={todayNutrition.calories}
            carbs={todayNutrition.carbs}
            protein={todayNutrition.protein}
            fats={todayNutrition.fats}
            carbsGoal={nutritionGoals.carbs}
            proteinGoal={nutritionGoals.protein}
            fatsGoal={nutritionGoals.fats}
            hasSelectedPuzzle={!!selectedPuzzle}
          />
        </div>
        
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
            calories={getDisplayCaloriesValue()}
          />
        <NutritionPuzzlesModal
          open={showPuzzlesModal}
          onClose={() => setShowPuzzlesModal(false)}
          onReopen={() => setShowPuzzlesModal(true)}
          onPuzzleSelect={handlePuzzleSelect}
        />
      </div>
    </>
  );
} 