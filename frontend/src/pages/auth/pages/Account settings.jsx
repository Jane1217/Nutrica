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
import DeleteAccountModal from '../modals/DeleteAccountModal';
import ModalWrapper from '../../../components/common/ModalWrapper';

export default function AccountSettings({ userEmail }) {
  const navigate = useNavigate();
  const [showEatModal, setShowEatModal] = useState(false);
  const [showSafariSetup, setShowSafariSetup] = useState(true);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showNutritionGoalModal, setShowNutritionGoalModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
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
        console.error('Failed to parse cached data:', error);
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
        console.error('Failed to parse cached data:', error);
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
      console.error('Failed to save user info:', error);
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

    // 使用 upsert 保存到 nutrition_goal 表，避免唯一约束冲突
    const { error } = await supabase
      .from('nutrition_goal')
      .upsert([
        {
          user_id: user.id,
          calories,
          carbs,
          fats,
          protein,
          created_at: new Date().toISOString()
        }
      ], { onConflict: ['user_id'] });
    if (error) {
      console.error('Failed to save:', error);
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
        <div className={styles['account-info-box']} onClick={() => {
          console.log('Safari setup clicked');
          // 先尝试在当前页面打开，如果不行再尝试新标签页
          try {
            window.open('/safari-camera-permission', '_blank');
          } catch (error) {
            console.error('Failed to open new tab:', error);
            // 如果新标签页被阻止，尝试在当前页面打开
            window.location.href = '/safari-camera-permission';
          }
        }} style={{cursor: 'pointer'}}>
            <div className={styles.accountInfoBoxHeader}>
              <span className={`${styles.accountInfoBoxTitle} body1`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.accountInfoBoxIcon}>
                  <rect width="24" height="24" rx="8" fill="white"/>
                  <path d="M21.7636 12.078C21.7636 13.364 21.5117 14.6374 21.0222 15.8255C20.5328 17.0136 19.8154 18.0932 18.911 19.0025C18.0067 19.9119 16.933 20.6332 15.7514 21.1253C14.5698 21.6175 13.3033 21.8708 12.0244 21.8708C9.44137 21.8708 6.96416 20.839 5.13771 19.0025C3.31125 17.166 2.28516 14.6752 2.28516 12.078C2.28516 9.48075 3.31125 6.98991 5.13771 5.15341C6.96416 3.3169 9.44137 2.28516 12.0244 2.28516C13.3033 2.28516 14.5698 2.53846 15.7514 3.03059C16.933 3.52272 18.0067 4.24406 18.911 5.15341C19.8154 6.06275 20.5328 7.1423 21.0222 8.33042C21.5117 9.51854 21.7636 10.792 21.7636 12.078Z" fill="url(#paint0_linear_660_3534)" stroke="#CDCDCD" strokeWidth="0.351543" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.999 12.0782C20.999 14.4719 20.0533 16.7675 18.37 18.4601C16.6866 20.1527 14.4035 21.1036 12.0229 21.1036C9.64234 21.1036 7.35924 20.1527 5.6759 18.4601C3.99256 16.7675 3.04688 14.4719 3.04688 12.0782C3.04688 9.68449 3.99256 7.38883 5.6759 5.69623C7.35924 4.00363 9.64234 3.05273 12.0229 3.05273C14.4035 3.05273 16.6866 4.00363 18.37 5.69623C20.0533 7.38883 20.999 9.68449 20.999 12.0782Z" fill="url(#paint1_radial_660_3534)"/>
                  <path d="M13.0503 13.1586L10.998 10.9976L18.2783 6.07324L13.0503 13.1586Z" fill="#FF5150"/>
                  <path d="M13.0498 13.1581L10.9975 10.9971L5.76953 18.0825L13.0498 13.1581Z" fill="#F1F1F1"/>
                  <path opacity="0.243" d="M5.76953 18.083L13.0498 13.1586L18.2777 6.07324L5.76953 18.083Z" fill="#22221B"/>
                  <defs>
                    <filter id="filter0_f_660_3534" x="3.92587" y="4.26962" width="16.7762" height="16.4385" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                      <feGaussianBlur stdDeviation="1.27242" result="effect1_foregroundBlur_660_3534"/>
                    </filter>
                    <linearGradient id="paint0_linear_660_3534" x1="12.024" y1="21.8706" x2="12.024" y2="2.2851" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#BDBDBD"/>
                      <stop offset="1" stopColor="white"/>
                    </linearGradient>
                    <radialGradient id="paint1_radial_660_3534" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12.0634 10.7622) scale(9.73919 9.79277)">
                      <stop stopColor="#06C2E7"/>
                      <stop offset="0.25" stopColor="#0DB8EC"/>
                      <stop offset="0.5" stopColor="#12AEF1"/>
                      <stop offset="0.75" stopColor="#1F86F9"/>
                      <stop offset="1" stopColor="#107DDD"/>
                    </radialGradient>
                  </defs>
                </svg>
              Safari Camera Permission Setup
            </span>
              <span className={styles.accountInfoBoxClose} onClick={(e) => {
                e.stopPropagation();
                setShowSafariSetup(false);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12.0008 13.3998L7.10078 18.2998C6.91745 18.4831 6.68411 18.5748 6.40078 18.5748C6.11745 18.5748 5.88411 18.4831 5.70078 18.2998C5.51745 18.1165 5.42578 17.8831 5.42578 17.5998C5.42578 17.3165 5.51745 17.0831 5.70078 16.8998L10.6008 11.9998L5.70078 7.0998C5.51745 6.91647 5.42578 6.68314 5.42578 6.3998C5.42578 6.11647 5.51745 5.88314 5.70078 5.6998C5.88411 5.51647 6.11745 5.4248 6.40078 5.4248C6.68411 5.4248 6.91745 5.51647 7.10078 5.6998L12.0008 10.5998L16.9008 5.6998C17.0841 5.51647 17.3174 5.4248 17.6008 5.4248C17.8841 5.4248 18.1174 5.51647 18.3008 5.6998C18.4841 5.88314 18.5758 6.11647 18.5758 6.3998C18.5758 6.68314 18.4841 6.91647 18.3008 7.0998L13.4008 11.9998L18.3008 16.8998C18.4841 17.0831 18.5758 17.3165 18.5758 17.5998C18.5758 17.8831 18.4841 18.1165 18.3008 18.2998C18.1174 18.4831 17.8841 18.5748 17.6008 18.5748C17.3174 18.5748 17.0841 18.4831 16.9008 18.2998L12.0008 13.3998Z" fill="#6A6A61"/>
                </svg>
              </span>
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
        <span className="h4" onClick={() => setShowDeleteAccountModal(true)} style={{cursor: 'pointer'}}>Delete Account</span>        
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
            console.error('Failed to save user info:', error);
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
      <DeleteAccountModal
        open={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        userEmail={userEmail}
      />
      </div>
    </>
  );
}