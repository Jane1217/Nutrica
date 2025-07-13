import React, { useEffect, useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import DateDisplayBox from '../../components/home/DateDisplayBox';
import EatModal from '../../components/eat/EatModal';
import UserInfoModal from '../auth/UserInfoModal';
import { useSearchParams } from 'react-router-dom';

export default function Home(props) {
  const [showEatModal, setShowEatModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('eat') === '1') {
      setShowEatModal(true);
    }
  }, [searchParams]);

  // 检查用户信息是否缺失，缺失则弹窗
  useEffect(() => {
    const info = props.userInfo || {};
    const hasShown = localStorage.getItem('nutrica_userinfo_shown');
    if (!hasShown && (!info.name || !info.gender || !info.age || !info.height || !info.weight)) {
      setShowUserInfoModal(true);
      localStorage.setItem('nutrica_userinfo_shown', '1');
    }
  }, [props.userInfo]);

  const handleUserInfoSubmit = (data) => {
    // TODO: 保存用户信息到数据库
    setShowUserInfoModal(false);
  };

  return (
    <div className="app-root">
      <NavLogo onEatClick={() => setShowEatModal(true)} isLoggedIn={props.isLoggedIn} />
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
        initialData={props.userInfo || {}}
      />
    </div>
  );
} 