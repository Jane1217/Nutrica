import React, { useState } from 'react';
import NavLogo from '../../../components/navbar/Nav-Logo';
import EatModal from '../../../pages/eat/modals/EatModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import styles from '../styles/Auth.module.css';
import UserInfoModal from '../modals/UserInfoModal';
import NutritionGoalModal from '../modals/NutritionGoalModal';
import ProfileEditModal from '../modals/ProfileEditModal';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import ModalWrapper from '../../../components/common/ModalWrapper';

export default function AccountSettings({ userEmail }) {
  const navigate = useNavigate();
  const [showEatModal, setShowEatModal] = useState(false);
  const [showSafariSetup, setShowSafariSetup] = useState(true);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showNutritionGoalModal, setShowNutritionGoalModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const initial = userEmail ? userEmail[0].toUpperCase() : '';
  const [userInfo, setUserInfo] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const nickname = userInfo?.name || 'Your Name';
  const [latestCalories, setLatestCalories] = useState(2000);

  // 初始化时立即加载缓存数据
  React.useEffect(() => {
    const cachedData = localStorage.getItem('nutrica_user_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.data) {
          setUserInfo(parsed.data);
          if (parsed.data.avatarUrl) {
            setAvatarUrl(parsed.data.avatarUrl);
          }
        }
      } catch (error) {
        console.error('初始化时解析缓存失败:', error);
        localStorage.removeItem('nutrica_user_cache');
      }
    }
  }, []);

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

  // 立即从本地缓存加载数据，然后异步更新
  React.useEffect(() => {
    // 立即尝试从本地缓存读取数据（同步操作）
    const cachedData = localStorage.getItem('nutrica_user_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.data) {
          setUserInfo(parsed.data);
          if (parsed.data.avatarUrl) {
            setAvatarUrl(parsed.data.avatarUrl);
          }
        }
      } catch (error) {
        console.error('解析本地缓存失败:', error);
        localStorage.removeItem('nutrica_user_cache');
      }
    }

    // 异步获取最新数据
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        localStorage.removeItem('nutrica_user_cache');
        setUserInfo(null);
        return;
      }

      const freshUserMeta = user.user_metadata || {};
      const currentData = userInfo || {};
      const hasChanges = JSON.stringify(freshUserMeta) !== JSON.stringify(currentData);
      
      if (hasChanges || !cachedData) {
        setUserInfo(freshUserMeta);
        if (freshUserMeta.avatarUrl) {
          setAvatarUrl(freshUserMeta.avatarUrl);
        }
        
        const cacheData = {
          userId: user.id,
          data: freshUserMeta,
          timestamp: Date.now()
        };
        localStorage.setItem('nutrica_user_cache', JSON.stringify(cacheData));
      }
    };
    
    // 延迟执行异步更新，让UI先渲染缓存数据
    setTimeout(fetchUserInfo, 100);
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
    
    // 立即更新userInfo状态，包含计算出的卡路里值
    const newMeta = { ...userInfo, ...data };
    setUserInfo(newMeta);
    
    // 立即打开营养目标弹窗，使用计算出的卡路里值
    setShowNutritionGoalModal(true);
    
    // 异步保存到Supabase，不阻塞UI更新
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ data: newMeta });
    if (error) {
      console.error('保存用户信息失败:', error);
    } else {
      // 更新本地缓存
      const cacheData = {
        userId: user.id,
        data: newMeta,
        timestamp: Date.now()
      };
      localStorage.setItem('nutrica_user_cache', JSON.stringify(cacheData));
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
    // 清除用户信息弹窗标记和本地缓存，确保重新登录时能正确弹出
    localStorage.removeItem('nutrica_userinfo_shown');
    localStorage.removeItem('nutrica_user_cache');
    await supabase.auth.signOut();
    navigate('/', { replace: true }); // 跳转到welcome页面
  };

  return (
    <>
      <NavLogo onEatClick={() => setShowEatModal(true)} isLoggedIn={true} isAuth={false} />
      <div className={styles['account-main']}>
        <div className={styles.accountHeaderRow}>
          <h1 className={`${styles['account-title']} h1`}>Account</h1>
          <button
            className={styles.accountEditBtn + ' h4'}
            onClick={() => setShowProfileEditModal(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.accountEditIcon}>
              <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#767676"/>
            </svg>
            Edit
          </button>
        </div>
        <div className={styles['account-avatar']}>
        {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className={styles.accountAvatarImg} />
        ) : (
          avatarText
        )}
      </div>
        <div className={styles['account-nickname'] + ' h3'}>{nickname}</div>
        <div className={styles['account-email']+ ' h4'}>{userEmail}</div>
      {showSafariSetup && (
        <div className={styles['account-info-box']}>
            <div className={styles.accountInfoBoxHeader}>
              <span className={`${styles.accountInfoBoxTitle} body1`}>
                <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f30d.svg" alt="safari" className={styles.accountInfoBoxIcon} />
              Safari Camera Permission Setup
            </span>
              <span className={styles.accountInfoBoxClose} onClick={() => setShowSafariSetup(false)}>&times;</span>
          </div>
            <div className={`${styles.accountInfoBoxDesc} body2`}>
            Avoid repeated camera permission popups for seamless scanning on Nutrica.life, with Safari.
          </div>
        </div>
      )}
      <div className={styles['account-card-list']}>
        <button className={`${styles['account-card-btn']} body1`} onClick={() => setShowUserInfoModal(true)}>
          Update Nutrition Goal
          <span>{'>'}</span>
        </button>
        <button className={`${styles['account-card-btn']} body1`} onClick={() => setShowChangePasswordModal(true)}>
          Change Password
          <span>{'>'}</span>
        </button>
        <button className={`${styles['account-card-btn']} body1`} onClick={handleSignOut}>
          Sign Out
          <span>{'>'}</span>
        </button>
      </div>
      <div className={styles['account-footer-bar']}>
        <span className="h4">Privacy Notice</span>
        <span className="h4">About</span>
        <span className="h4">Delete Account</span>        
      </div>
        <div className={styles.accountFeedback}>
          <span className="h5" style={{color: 'var(--Neutral-Primary-Text, #22221B)', textAlign: 'center'}}>
            We&apos;d love to hear your feedback!<br />Contact us at
          </span>
          <div className={`${styles.accountEmailContact} h5`}>Nutrica.life.app@gmail.com</div>
      </div>
      <EatModal
        open={showEatModal}
        onClose={() => setShowEatModal(false)}
        foods={[]}
        onDescribe={() => {}}
        onEnterValue={() => {}}
      />
      <UserInfoModal
        open={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        initialData={userInfo || {}}
        onSubmit={handleUserInfoSubmit}
        isUpdateMode={true}
      />
      <NutritionGoalModal
        open={showNutritionGoalModal}
        onClose={() => setShowNutritionGoalModal(false)}
        onBack={() => {
          setShowNutritionGoalModal(false);
          setShowUserInfoModal(true);
        }}
        onSave={handleSaveCalories}
        name={userInfo?.name || ''}
        calories={userInfo?.calculatedCalories || latestCalories || 2000}
      />
      <ProfileEditModal 
        open={showProfileEditModal} 
        onClose={() => setShowProfileEditModal(false)} 
        userInfo={{...userInfo, email: userEmail}} 
        onSave={async (data) => {
          const newMeta = { ...userInfo, ...data };
          setUserInfo(newMeta);
          
          // 更新头像
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          } else if (data.avatarUrl === null) {
            // 删除头像时，重新获取用户信息
            setAvatarUrl(null);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const userMeta = user.user_metadata || {};
              setUserInfo(userMeta);
            }
          }
          
          // 更新昵称显示
          if (data.name) {
            // 立即更新昵称显示，无需等待数据库
            setUserInfo(prev => ({ ...prev, name: data.name, lastName: data.lastName }));
          }
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { error } = await supabase.auth.updateUser({ data: newMeta });
          if (error) {
            console.error('保存用户信息失败:', error);
          } else {
            // 更新本地缓存
            const cacheData = {
              userId: user.id,
              data: newMeta,
              timestamp: Date.now()
            };
            localStorage.setItem('nutrica_user_cache', JSON.stringify(cacheData));
          }
        }} 
      />
      <ChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      </div>
    </>
  );
}