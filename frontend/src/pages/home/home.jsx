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
import Toast from '../../components/common/Toast';
// 删除 HomeDataTestPanel 的引入
// import HomeDataTestPanel from './HomeDataTestPanel';

import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { calculateNutritionFromCalories, formatFoods, fetchNutritionGoals, fetchTodayNutrition, getCurrentUser, getUserMetadata, updateUserMetadata, isUserInfoComplete, hasShownUserInfoModal, setUserInfoModalShown, getDisplayCalories } from '../../utils';
import { puzzleCategories, colorOrders } from '../../data/puzzles';
import { format } from 'date-fns';
import { monitorPuzzleCompletion } from '../../utils';
import { preloadCollectionStatus } from '../../utils';

// 工具函数：按顺序提取某营养素的所有颜色
function getNutrientColorsByOrder(pixelMap, nutrientType, colorOrder) {
  if (!pixelMap) return [];
  const colorSet = new Set();
  for (let y = 0; y < pixelMap.length; y++) {
    for (let x = 0; x < pixelMap[y].length; x++) {
      const pix = pixelMap[y][x];
      if (pix.nutrient === nutrientType) {
        colorSet.add(pix.color);
      }
    }
  }
  return colorOrder.filter(color => colorSet.has(color));
}

// 工具函数：获取本地 yyyy-MM-dd 日期字符串
function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 保存 daily_home_data 快照到 supabase
async function saveDailyHomeData(data) {
  if (!data.user_id || !data.date) return;
  
  // 检查puzzle是否完成 - 修复：使用与checkPuzzleCompletion一致的条件
  const isPuzzleCompleted = data.puzzle_progress === 1;
  
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
  } else {
    // 只有在puzzle真正完成时才检查并添加到collections
    if (isPuzzleCompleted) {
      console.log(`Puzzle completed, calling monitorPuzzleCompletion for ${data.puzzle_name}`);
      const completionResult = await monitorPuzzleCompletion(data.user_id, data);
      if (completionResult.success) {
        console.log('Puzzle completion monitored successfully');
      } else if (completionResult.error !== 'Puzzle not completed or missing puzzle name' && 
                 completionResult.error !== 'Puzzle already collected today') {
        console.error('Failed to monitor puzzle completion:', completionResult.error);
      }
    }
  }
}

// 新增：通过puzzle_id查找本地puzzle对象
function findPuzzleById(puzzleId) {
  if (!puzzleId) return null;
  for (const cat of puzzleCategories) {
    const found = cat.puzzles.find(p => p.id === puzzleId);
    if (found) return found;
  }
  return null;
}

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
  const [puzzleLoading, setPuzzleLoading] = useState(false); // 新增：puzzle loading 状态
  const [foodsTotal, setFoodsTotal] = useState(0); // 总数据量
  const foodsPerPage = 5;
  const foodsAllRef = useRef([]); // 保存所有foods原始数据
  
  // Toast状态
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // 营养数据状态
  const [nutritionGoals, setNutritionGoals] = useState({ calories: 2000, carbs: 200, protein: 150, fats: 65 });
  const [todayNutrition, setTodayNutrition] = useState({ calories: 0, carbs: 0, protein: 0, fats: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [snapshotData, setSnapshotData] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false); // 新增
  const [snapshotError, setSnapshotError] = useState(null); // 新增

  useEffect(() => {
    if (searchParams.get('eat') === '1') {
      setShowEatModal(true);
      // 立即开始加载食物数据
      if (userId) {
        setFoodsPage(1);
        fetchFoods(true);
      }
    }
  }, [searchParams, userId]);

  // 当EatModal打开时，立即开始加载食物数据
  useEffect(() => {
    if (showEatModal && userId) {
      setFoodsPage(1);
      fetchFoods(true);
    }
  }, [showEatModal, userId]);

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

  // 当用户信息加载完成后，预加载收藏状态
  useEffect(() => {
    if (userId && userInfo) {
      // 确保用户完全登录后再预加载
      preloadCollectionStatus(userId);
    }
  }, [userId, userInfo]);

  // 页面加载时，优先用本地缓存渲染selectedPuzzle（并校验日期，不是今天就清空）
  useEffect(() => {
    // 立即设置 loading 状态
    setPuzzleLoading(true);
    
    const saved = localStorage.getItem('selectedPuzzle');
    const savedDate = localStorage.getItem('selectedPuzzleDate');
    const todayStr = getLocalDateString(new Date());
    
    if (saved && savedDate === todayStr) {
      try {
        const parsedPuzzle = JSON.parse(saved);
        setSelectedPuzzle(parsedPuzzle);
        // 如果有有效缓存，立即结束 loading
        setPuzzleLoading(false);
      } catch {
        // 缓存解析失败，保持 loading 状态等待 userId 获取
        setSelectedPuzzle(null);
        localStorage.removeItem('selectedPuzzle');
        localStorage.removeItem('selectedPuzzleDate');
      }
    } else {
      // 没有有效缓存，清除并保持 loading 状态
      localStorage.removeItem('selectedPuzzle');
      localStorage.removeItem('selectedPuzzleDate');
      setSelectedPuzzle(null);
    }
  }, []);

  // userId变化时，拉取supabase数据
  useEffect(() => {
    if (!userId) {
      // 如果没有 userId，清除数据但保持 loading 状态
      setSelectedPuzzle(null);
      localStorage.removeItem('selectedPuzzle');
      localStorage.removeItem('selectedPuzzleDate');
      return;
    }
    
    // 如果已经有选中的 puzzle，结束 loading
    if (selectedPuzzle) {
      setPuzzleLoading(false);
      return;
    }
    
    // 确保 loading 状态为 true
    setPuzzleLoading(true);
    
    const today = getLocalDateString(new Date());
    supabase.from('daily_home_data')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.puzzle_id) {
          const puzzle = findPuzzleById(data.puzzle_id);
          if (puzzle) {
            setSelectedPuzzle(puzzle);
            localStorage.setItem('selectedPuzzle', JSON.stringify(puzzle));
            localStorage.setItem('selectedPuzzleDate', today);
          }
        } else {
          setSelectedPuzzle(null);
          localStorage.removeItem('selectedPuzzle');
          localStorage.removeItem('selectedPuzzleDate');
        }
      })
      .finally(() => {
        setPuzzleLoading(false); // 结束加载
      });
  }, [userId, selectedPuzzle]);

  // 新增：设置定时器在下一个0点清除puzzle选择
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msToMidnight = nextMidnight - now;
    const timer = setTimeout(() => {
      localStorage.removeItem('selectedPuzzle');
      localStorage.removeItem('selectedPuzzleDate');
      setSelectedPuzzle(null);
    }, msToMidnight);
    return () => clearTimeout(timer);
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
      console.error('Failed to fetch food data:', error);
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

  // 首次进入页面自动保存当天快照
  useEffect(() => {
    if (userId && selectedPuzzle) {
      const today = getLocalDateString(new Date());
      const puzzleProgress = getPuzzleProgress(selectedPuzzle, calculateNutritionProgress());
      saveDailyHomeData({
        user_id: userId,
        date: today,
        puzzle_category: selectedPuzzle
          ? (puzzleCategories.find(cat => cat.puzzles.some(p => selectedPuzzle.id.startsWith(p.id)))?.title || '')
          : '',
        puzzle_name: selectedPuzzle?.name || '',
        puzzle_id: selectedPuzzle?.id || '', //
        daily_text: getPuzzleDescription(selectedPuzzle, calculateNutritionProgress(), userInfo?.name),
        pixel_art_data: selectedPuzzle?.pixelMap || null,
        calories: todayNutrition.calories,
        carbs: todayNutrition.carbs,
        protein: todayNutrition.protein,
        fats: todayNutrition.fats,
        carbs_goal: nutritionGoals.carbs,
        protein_goal: nutritionGoals.protein,
        fats_goal: nutritionGoals.fats,
        puzzle_progress: puzzleProgress,
        carbs_colors: carbsColors,
        protein_colors: proteinColors,
        fats_colors: fatsColors
      });
    }
    // 设置午夜定时保存
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1) - now;
    const timer = setTimeout(() => {
      if (userId && selectedPuzzle) {
        const today = getLocalDateString(new Date());
        const puzzleProgress = getPuzzleProgress(selectedPuzzle, calculateNutritionProgress());
        saveDailyHomeData({
          user_id: userId,
          date: today,
          puzzle_category: selectedPuzzle
            ? (puzzleCategories.find(cat => cat.puzzles.some(p => selectedPuzzle.id.startsWith(p.id)))?.title || '')
            : '',
          puzzle_name: selectedPuzzle?.name || '',
          puzzle_id: selectedPuzzle?.id || '', // 新增
          daily_text: getPuzzleDescription(selectedPuzzle, calculateNutritionProgress(), userInfo?.name),
          pixel_art_data: selectedPuzzle?.pixelMap || null,
          calories: todayNutrition.calories,
          carbs: todayNutrition.carbs,
          protein: todayNutrition.protein,
          fats: todayNutrition.fats,
          carbs_goal: nutritionGoals.carbs,
          protein_goal: nutritionGoals.protein,
          fats_goal: nutritionGoals.fats,
          puzzle_progress: puzzleProgress
        });
      }
    }, msToMidnight);
    return () => clearTimeout(timer);
  }, [userId, selectedPuzzle, todayNutrition, nutritionGoals, userInfo]);


  // EatModal 新增/修改后自动刷新foods和营养数据
  const handleEatModalDataChange = () => {
    setFoodsPage(1);
    fetchFoods(true);
    fetchTodayNutritionData(); // 刷新今日营养数据
    
    // 关闭EatModal并跳转到home页面
    setShowEatModal(false);
    navigate('/');
    
    // 显示成功toast
    setShowSuccessToast(true);
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
      console.error('Failed to save user info:', error);
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
      console.error('Failed to save calories:', error);
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
    localStorage.setItem('selectedPuzzle', JSON.stringify(puzzle));
    localStorage.setItem('selectedPuzzleDate', getLocalDateString(new Date()));
  };

  // 计算营养进度
  const calculateNutritionProgress = () => {
    return {
      1: Math.min(todayNutrition.carbs / nutritionGoals.carbs, 1), // carbs
      2: Math.min(todayNutrition.protein / nutritionGoals.protein, 1), // protein  
      3: Math.min(todayNutrition.fats / nutritionGoals.fats, 1) // fats
    };
  };

  // 计算puzzle完成度（已填色/有颜色的像素）
  function getPuzzleProgress(puzzle, progress) {
    if (!puzzle?.pixelMap) return 0;
    let total = 0, filled = 0;
    const nutrientPixels = [];
    puzzle.pixelMap.forEach((row, y) =>
      row.forEach((pix, x) => {
        if (pix.nutrient !== 0) {
          total++;
          // 计算该像素是否已填色
          const p = progress?.[pix.nutrient] || 0;
          // 统计该营养素所有像素
          if (!nutrientPixels[pix.nutrient]) nutrientPixels[pix.nutrient] = [];
          nutrientPixels[pix.nutrient].push({ x, y });
        }
      })
    );
    // 计算每种营养素已填色数量
    Object.keys(nutrientPixels).forEach(n => {
      const nInt = parseInt(n);
      const count = Math.round(nutrientPixels[n].length * (progress?.[nInt] || 0));
      filled += count;
    });
    return total === 0 ? 0 : filled / total;
  }

  // 获取当前puzzle的描述
  function getPuzzleDescription(puzzle, progress, userName) {
    if (!puzzle) return `Hey ${userName || 'User'}! Ready to collect today’s nutrition puzzle?`;
    const percent = getPuzzleProgress(puzzle, progress);
    if (!puzzle.descriptions || puzzle.descriptions.length === 0) return puzzle.description;
    if (percent === 0) return puzzle.descriptions[0];
    if (percent < 0.25) return puzzle.descriptions[0];
    if (percent < 0.5) return puzzle.descriptions[1];
    if (percent < 0.75) return puzzle.descriptions[2];
    if (percent < 0.9) return puzzle.descriptions[3];
    if (percent < 1) return puzzle.descriptions[4];
    return 'Puzzle collected! Treat yourself in tomorrow’s challenge!';
  }

  // 选中puzzle时提取颜色（自动顺序）
  const colorOrder = selectedPuzzle ? colorOrders[selectedPuzzle.id] || [] : [];
  const carbsColors = getNutrientColorsByOrder(selectedPuzzle?.pixelMap, 1, colorOrder);
  const proteinColors = getNutrientColorsByOrder(selectedPuzzle?.pixelMap, 2, colorOrder);
  const fatsColors = getNutrientColorsByOrder(selectedPuzzle?.pixelMap, 3, colorOrder);

//console.log('selectedPuzzle', selectedPuzzle);
//console.log('carbsColors', carbsColors, 'proteinColors', proteinColors, 'fatsColors', fatsColors);

  // 监听 currentDate 变化，拉取快照
  useEffect(() => {
    const todayStr = getLocalDateString(new Date());
    const selectedStr = getLocalDateString(currentDate);
    if (selectedStr === todayStr) {
      setSnapshotData(null);
      setSnapshotLoading(false);
      setSnapshotError(null);
      return;
    }
    let cancelled = false;
    setSnapshotLoading(true);
    setSnapshotError(null);
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setSnapshotLoading(false);
        setSnapshotError('快照加载超时，请检查网络或稍后重试');
      }
    }, 10000); // 10秒超时
    async function fetchSnapshot() {
      if (!userId || !selectedStr) return;
      let data, error;
      if (supabase.from('daily_home_data').maybeSingle) {
        // v2 支持 maybeSingle
        ({ data, error } = await supabase
          .from('daily_home_data')
          .select('*')
          .eq('user_id', userId)
          .eq('date', selectedStr)
          .maybeSingle());
      } else {
        // v1 兼容
        const res = await supabase
          .from('daily_home_data')
          .select('*')
          .eq('user_id', userId)
          .eq('date', selectedStr)
          .limit(1);
        data = res.data && res.data.length > 0 ? res.data[0] : null;
        error = res.error;
      }
      clearTimeout(timeout);
      if (!cancelled) {
        setSnapshotData(error ? null : data);
        setSnapshotLoading(false);
        setSnapshotError(error ? '快照加载失败' : null);
      }
    }
    fetchSnapshot();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [currentDate, userId]);

  // 渲染时优先用 snapshotData，只声明一次 todayStr 和 isHistory，后续复用
  const todayStr = getLocalDateString(new Date());
  const isHistory = snapshotData && snapshotData.date && snapshotData.date !== todayStr;

  // 计算历史页面拼图完成度
  let historyPuzzle = null;
  let historyProgress = 0;
  if (isHistory) {
    historyPuzzle = findPuzzleById(snapshotData.puzzle_id);
    historyProgress = snapshotData.puzzle_progress;
  }

  const renderData = snapshotData ? {
    puzzle_category: snapshotData.puzzle_category,
    puzzle_name: snapshotData.puzzle_name,
    // 修改历史页面 description 逻辑
    daily_text: isHistory
      ? (historyProgress === 1
        ? 'Puzzle collected! Treat yourself in tomorrow’s challenge!'
        : 'So close to completing this puzzle! — try again next time!')
      : getPuzzleDescription(selectedPuzzle, calculateNutritionProgress(), userInfo?.name),
    pixel_art_data: snapshotData.pixel_art_data,
    calories: snapshotData.calories,
    carbs: snapshotData.carbs,
    protein: snapshotData.protein,
    fats: snapshotData.fats,
    carbs_goal: snapshotData.carbs_goal,
    protein_goal: snapshotData.protein_goal,
    fats_goal: snapshotData.fats_goal,
    puzzle_progress: snapshotData.puzzle_progress,
    carbs_colors: snapshotData.carbs_colors,
    protein_colors: snapshotData.protein_colors,
    fats_colors: snapshotData.fats_colors
  } : {
    puzzle_category: selectedPuzzle
      ? (puzzleCategories.find(cat => cat.puzzles.some(p => selectedPuzzle.id.startsWith(p.id)))?.title || '')
      : '',
    puzzle_name: selectedPuzzle?.name || '',
    daily_text: getPuzzleDescription(selectedPuzzle, calculateNutritionProgress(), userInfo?.name),
    pixel_art_data: selectedPuzzle?.pixelMap || null,
    calories: todayNutrition.calories,
    carbs: todayNutrition.carbs,
    protein: todayNutrition.protein,
    fats: todayNutrition.fats,
    carbs_goal: nutritionGoals.carbs,
    protein_goal: nutritionGoals.protein,
    fats_goal: nutritionGoals.fats,
    puzzle_progress: snapshotData ? snapshotData.puzzle_progress : getPuzzleProgress(selectedPuzzle, calculateNutritionProgress()),
    carbs_colors: snapshotData ? snapshotData.carbs_colors : carbsColors,
    protein_colors: snapshotData ? snapshotData.protein_colors : proteinColors,
    fats_colors: snapshotData ? snapshotData.fats_colors : fatsColors
  };

  // PuzzleContainer的progress参数
  const renderProgress = snapshotData
    ? {
        1: (snapshotData.carbs_goal && snapshotData.carbs ? Math.min(snapshotData.carbs / snapshotData.carbs_goal, 1) : 0),
        2: (snapshotData.protein_goal && snapshotData.protein ? Math.min(snapshotData.protein / snapshotData.protein_goal, 1) : 0),
        3: (snapshotData.fats_goal && snapshotData.fats ? Math.min(snapshotData.fats / snapshotData.fats_goal, 1) : 0),
      }
    : calculateNutritionProgress();

  // PuzzleContainer的img参数（历史快照100%时也传img）
  const renderPuzzle = snapshotData
    ? findPuzzleById(snapshotData.puzzle_id)
    : selectedPuzzle;

  // 判断是否为历史快照（非今天）
  // 已在上方声明 todayStr 和 isHistory，这里移除重复声明

  return (
    <>
      <NavLogo onEatClick={() => setShowEatModal(true)} isLoggedIn={props.isLoggedIn} isAuth={false} />
      <div className={styles['home-main']}>
        <div className={styles.container}>
          <DatePicker
            userId={userId}
            homeSnapshot={{
              puzzle_category: renderData.puzzle_category,
              puzzle_name: renderData.puzzle_name,
              daily_text: renderData.daily_text,
              pixel_art_data: renderData.pixel_art_data,
              calories: renderData.calories,
              carbs: renderData.carbs,
              protein: renderData.protein,
              fats: renderData.fats,
              carbs_goal: renderData.carbs_goal,
              protein_goal: renderData.protein_goal,
              fats_goal: renderData.fats_goal
            }}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
          <PuzzleTextModule 
            puzzleName={renderData.puzzle_name}
            categoryName={renderData.puzzle_category}
            puzzleText={renderData.daily_text}
            userName={userInfo?.name || 'User'}
            hasSelectedPuzzle={!!renderData.puzzle_name}
          />
          <PuzzleContainer
            hasSelectedPuzzle={!!renderData.puzzle_name}
            onChoosePuzzle={() => setShowPuzzlesModal(true)}
            selectedPuzzle={renderPuzzle}
            pixelArtData={renderData.pixel_art_data}
            progress={renderProgress}
            forceShowSvg={renderData.puzzle_progress === 1 && renderPuzzle?.img}
            disableChangePuzzle={isHistory}
            isLoading={puzzleLoading}
          >
            {/* 拼图内容将在这里 */}
          </PuzzleContainer>
          <NutritionCard 
            calories={renderData.calories}
            carbs={renderData.carbs}
            protein={renderData.protein}
            fats={renderData.fats}
            carbsGoal={renderData.carbs_goal}
            proteinGoal={renderData.protein_goal}
            fatsGoal={renderData.fats_goal}
            hasSelectedPuzzle={!!renderData.puzzle_name}
            carbsColors={renderData.carbs_colors || carbsColors}
            proteinColors={renderData.protein_colors || proteinColors}
            fatsColors={renderData.fats_colors || fatsColors}
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
        
        <Toast
          message="Food Logged"
          type="success"
          show={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
          />
      </div>
    </>
  );
} 