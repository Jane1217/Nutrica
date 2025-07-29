import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../../utils';

export const useUserData = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.id);
        
        if (currentUser.user_metadata) {
          setNickname(currentUser.user_metadata.name || '');
          setAvatarUrl(currentUser.user_metadata.avatarUrl || '');
        }
      }
    };

    fetchUserData();
  }, []);

  return { user, userId, nickname, avatarUrl };
}; 