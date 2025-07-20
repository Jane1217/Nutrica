import React, { useState } from 'react';
import ModalWrapper from '../../../components/common/ModalWrapper';
import { supabase } from '../../../supabaseClient';
import { userApi } from '../../../utils/api';
import styles from '../styles/Auth.module.css';

export default function DeleteAccountModal({ open, onClose, userEmail }) {
  const [isLoading, setIsLoading] = useState(false);

  // 当弹窗打开时重置状态
  React.useEffect(() => {
    if (open) {
      setIsLoading(false);
    }
  }, [open]);

  const handleDeleteAccount = async () => {
    setIsLoading(true);

    try {
      // 1. 获取当前用户信息
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('用户未登录');
        return;
      }

      // 2. 调用后端API删除用户账号
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        console.error('无法获取访问令牌');
        alert('无法获取访问令牌，请重新登录');
        return;
      }

      try {
        await userApi.deleteAccount(user.id, accessToken);
        console.log('删除账号成功');
      } catch (error) {
        console.error('删除账号失败:', error);
        alert('删除账号失败: ' + error.message);
        return;
      }

      // 3. 清除本地存储
      localStorage.removeItem('nutrica_userinfo_shown');
      localStorage.removeItem('nutrica_user_cache');

      // 4. 登出用户
      await supabase.auth.signOut();

      // 5. 关闭弹窗并跳转到欢迎页面
      onClose();
      window.location.href = '/';

    } catch (err) {
      console.error('删除账号时出错:', err);
      alert('删除账号时出错: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose} centered={true}>
      <div className={styles.deleteAccountModal}>
        <div className={styles.deleteAccountHeader}>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.deleteAccountContent}>
          <div className={styles.deleteAccountIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
              <path d="M20.5 5C20.7652 5 21.0196 5.10536 21.2071 5.29289C21.3946 5.48043 21.5 5.73478 21.5 6C21.5 6.26522 21.3946 6.51957 21.2071 6.70711C21.0196 6.89464 20.7652 7 20.5 7H19.5L19.497 7.071L18.564 20.142C18.5281 20.6466 18.3023 21.1188 17.9321 21.4636C17.5619 21.8083 17.0749 22 16.569 22H8.43C7.92414 22 7.43707 21.8083 7.06688 21.4636C6.6967 21.1188 6.47092 20.6466 6.435 20.142L5.502 7.072L5.5 7H4.5C4.23478 7 3.98043 6.89464 3.79289 6.70711C3.60536 6.51957 3.5 6.26522 3.5 6C3.5 5.73478 3.60536 5.48043 3.79289 5.29289C3.98043 5.10536 4.23478 5 4.5 5H20.5ZM14.5 2C14.7652 2 15.0196 2.10536 15.2071 2.29289C15.3946 2.48043 15.5 2.73478 15.5 3C15.5 3.26522 15.3946 3.51957 15.2071 3.70711C15.0196 3.89464 14.7652 4 14.5 4H10.5C10.2348 4 9.98043 3.89464 9.79289 3.70711C9.60536 3.51957 9.5 3.26522 9.5 3C9.5 2.73478 9.60536 2.48043 9.79289 2.29289C9.98043 2.10536 10.2348 2 10.5 2H14.5Z" fill="#D03535"/>
            </svg>
          </div>
          
          <h2 className={`h2 ${styles.deleteAccountTitle}`}>Delete Account</h2>
          
          <div className={styles.deleteAccountDivider}>
            <svg xmlns="http://www.w3.org/2000/svg" width="69" height="4" viewBox="0 0 69 4" fill="none">
              <path d="M2.5 2H66.5" stroke="#DBE2D0" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          
          <div className={styles.deleteAccountText}>
            <p className="body1">Are you sure you want to delete the account linked to <strong>{userEmail}</strong>?</p>
            <p className="body1">All your data will be permanently lost. This action cannot be undone.</p>
          </div>
          
          <div className={styles.deleteAccountActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              <span className="h4" style={{color: 'var(--Neutral-Primary-Text, #22221B)'}}>Cancel</span>
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              <span className="h4" style={{color: 'var(--Brand-Background, #F3F3EC)'}}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
} 