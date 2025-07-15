import React, { useEffect, useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import DateDisplayBox from '../../components/home/DateDisplayBox';
import EatModal from '../../components/eat/EatModal';
import { useSearchParams } from 'react-router-dom';

export default function Home(props) {
  const [showEatModal, setShowEatModal] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('eat') === '1') {
      setShowEatModal(true);
    }
  }, [searchParams]);

  return (
    <div className="app-root">
      <NavLogo onEatClick={() => setShowEatModal(true)} />
      <DateDisplayBox />
      {showEatModal && (
        <EatModal
          onClose={() => setShowEatModal(false)}
          // foods 数据来自 supabase，暂时传空数组
          foods={[]}
          onDescribe={() => alert('Describe')}
          onEnterValue={() => alert('Enter Value')}
          onScanLabel={() => alert('Scan Label')}
          userId={props.userId || 'default-user-id'}
        />
      )}
    </div>
  );
} 