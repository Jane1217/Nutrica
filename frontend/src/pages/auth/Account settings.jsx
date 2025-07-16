import React, { useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import EatModal from '../eat/modals/EatModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './Auth.module.css';
import UserInfoModal from './UserInfoModal';
import NutritionGoalModal from './NutritionGoalModal';
import ProfileEditModal from './ProfileEditModal';
import ModalWrapper from '../../components/ModalWrapper';

export default function AccountSettings({ userEmail }) {
  const navigate = useNavigate();
  const [showEatModal, setShowEatModal] = useState(false);
  const [showSafariSetup, setShowSafariSetup] = useState(true);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showNutritionGoalModal, setShowNutritionGoalModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const initial = userEmail ? userEmail[0].toUpperCase() : '';
  const [userInfo, setUserInfo] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const nickname = userInfo?.name || 'Your Name';
  const [latestCalories, setLatestCalories] = useState(2000);

  // 头像显示逻辑：优先使用昵称第一个字母，其次使用邮箱第一个字母
  const getAvatarText = () => {
    if (userInfo?.name && userInfo.name[0]) {
      return userInfo.name[0].toUpperCase();
    }
    if (userEmail && userEmail[0]) {
      return userEmail[0].toUpperCase();
    }
    return 'U';
  };
  const avatarText = getAvatarText();

  // 页面加载时自动从supabase user_metadata读取用户信息
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setUserInfo(null);
      const userMeta = user.user_metadata || {};
      setUserInfo(userMeta);
      if (userMeta.avatarUrl) {
        setAvatarUrl(userMeta.avatarUrl);
      }
    };
    fetchUserInfo();
  }, [userEmail]);

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

  // 打开营养目标弹窗前，先查数据库
  const openNutritionGoalModal = async () => {
    const calories = await fetchLatestGoal();
    setLatestCalories(calories);
    setShowNutritionGoalModal(true);
  };

  // 提交信息时写入supabase user_metadata，并并行切换弹窗
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
    if (error) {
      console.error('保存用户信息失败:', error);
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

  // 获取要显示的卡路里值：优先使用计算值，其次使用数据库值
  const getDisplayCalories = () => {
    if (userInfo?.calculatedCalories) {
      return userInfo.calculatedCalories;
    }
    return latestCalories;
  };

  const handleSignOut = async () => {
    // 清除用户信息弹窗标记，确保重新登录时能正确弹出
    localStorage.removeItem('nutrica_userinfo_shown');
    await supabase.auth.signOut();
    navigate('/', { replace: true }); // 跳转到welcome页面
  };

  return (
    <>
      <NavLogo onEatClick={() => setShowEatModal(true)} isLoggedIn={true} isAuth={false} />
      <div className={styles['account-main']}>
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%'}}>
          <h1 className={styles['account-title']} style={{marginBottom: 16, flex: 1, textAlign: 'left'}}>Account</h1>
          <button
            className="h5"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: '#767676',
              cursor: 'pointer',
              marginRight: 0,
              marginBottom: 20,
              paddingBottom: 6
            }}
            onClick={() => setShowProfileEditModal(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 2}}>
              <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#767676"/>
            </svg>
            Edit
          </button>
        </div>
      <div className={styles['account-avatar']} style={{background: '#905021'}}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
        ) : (
          avatarText
        )}
      </div>
      <div className={styles['account-nickname'] + ' h1'}>{nickname}</div>
      <div className={styles['account-email']+ ' h3'}>{userEmail}</div>
      {showSafariSetup && (
        <div className={styles['account-info-box']}>
          <div style={{display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
            <span style={{fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8}}>
              <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f30d.svg" alt="safari" style={{width: 24, height: 24, marginRight: 8}} />
              Safari Camera Permission Setup
            </span>
            <span style={{cursor: 'pointer', fontSize: 20, color: '#888'}} onClick={() => setShowSafariSetup(false)}>&times;</span>
          </div>
          <div style={{fontSize: 15, color: '#22221B', opacity: 0.8}}>
            Avoid repeated camera permission popups — enable full camera access for seamless scanning on Nutrica.com, with Safari.
          </div>
        </div>
      )}
      <div className={styles['account-card-list']}>
        <button className={styles['account-card-btn']} onClick={() => setShowUserInfoModal(true)}>
          Update Nutrition Goal
          <span>{'>'}</span>
        </button>
        <button className={styles['account-card-btn']} disabled>
          Change Password
          <span>{'>'}</span>
        </button>
        <button className={styles['account-card-btn']} onClick={handleSignOut}>
          Sign Out
          <span>{'>'}</span>
        </button>
      </div>
      <div className={styles['account-footer-bar']}>
        <span>About</span>
        <span>Contact Us</span>
        <span>Delete Account</span>
      </div>
      {showEatModal && (
        <EatModal
          onClose={() => setShowEatModal(false)}
          foods={[]}
          onDescribe={() => {}}
          onEnterValue={() => {}}
        />
      )}
      <UserInfoModal
        open={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        initialData={userInfo || {}}
        onSubmit={handleUserInfoSubmit}
      />
      <ModalWrapper open={showNutritionGoalModal} onClose={() => setShowNutritionGoalModal(false)}>
        <NutritionGoalModal
          onClose={() => setShowNutritionGoalModal(false)}
          onBack={() => {
            setShowNutritionGoalModal(false);
            setShowUserInfoModal(true);
          }}
          onSave={handleSaveCalories}
          name={userInfo?.name || ''}
          calories={getDisplayCalories()}
        />
      </ModalWrapper>
      <ProfileEditModal 
        open={showProfileEditModal} 
        onClose={() => setShowProfileEditModal(false)} 
        userInfo={{...userInfo, email: userEmail}} 
        onSave={async (data) => {
          const newMeta = { ...userInfo, ...data };
          setUserInfo(newMeta);
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          }
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { error } = await supabase.auth.updateUser({ data: newMeta });
          if (error) {
            console.error('保存用户信息失败:', error);
          }
        }} 
      />
      </div>
    </>
  );
}