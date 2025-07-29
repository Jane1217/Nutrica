import React, { useEffect, useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import styles from './MyCollections.module.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/user';
import { collectionApi } from '../../utils/api';
import { getAuthToken } from '../../utils/user';
import CongratulationsModal from './CongratulationsModal';

export default function MyCollections() {
  const [collections, setCollections] = useState([]); // 用户已收集的 puzzle
  const [collectionPuzzles, setCollectionPuzzles] = useState([]); // collection_puzzles配置
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [hasShownCongratulations, setHasShownCongratulations] = useState(false);
  const [salmonNigiriFirstCompletedAt, setSalmonNigiriFirstCompletedAt] = useState(null);
  const navigate = useNavigate();

  // 获取puzzle图标路径
  const getPuzzleIconPath = (puzzleName) => {
    const puzzleNameLower = puzzleName.toLowerCase();
    // Replace spaces with underscores for asset paths
    return `/assets/puzzles/puzzle_${puzzleNameLower.replace(/\s+/g, '_')}.svg`;
  };

  // 检查是否应该显示CongratulationsModal并添加Salmon Nigiri Boy到user_collections
  const checkCongratulationsModal = async (collectionsData) => {
    if (hasShownCongratulations) return;
    
    // 检查是否有Salmon Nigiri Boy主题的收集
    const salmonNigiriCollections = collectionsData.filter(
      collection => collection.collection_type === 'Salmon Nigiri Boy'
    );
    
    // 检查是否收集了Salmon和Sushi Rice
    const salmonCollected = salmonNigiriCollections.some(
      collection => collection.puzzle_name === 'Salmon' && collection.collected
    );
    const sushiRiceCollected = salmonNigiriCollections.some(
      collection => collection.puzzle_name === 'Sushi Rice' && collection.collected
    );
    
    // 检查是否已经有Salmon Nigiri Boy的收集记录
    const salmonNigiriBoyCollected = salmonNigiriCollections.some(
      collection => collection.puzzle_name === 'Salmon Nigiri Boy'
    );
    
    // 如果两个都收集了且还没显示过Congratulations，则显示并添加到user_collections
    if (salmonCollected && sushiRiceCollected) {
      // 如果还没有Salmon Nigiri Boy的收集记录，则添加
      if (!salmonNigiriBoyCollected) {
        try {
          const token = await getAuthToken();
          if (token) {
            const response = await collectionApi.addPuzzleToCollection({
              puzzle_name: 'Salmon Nigiri Boy',
              collection_type: 'Salmon Nigiri Boy',
              nutrition: { carbs: 0, protein: 0, fats: 0 },
              first_completed_at: new Date().toISOString()
            }, token);
            
            if (response.success) {
              console.log('Salmon Nigiri Boy added to user_collections');
            } else {
              console.error('Failed to add Salmon Nigiri Boy to user_collections:', response.error);
            }
          }
        } catch (error) {
          console.error('Error adding Salmon Nigiri Boy to user_collections:', error);
        }
      }
      
      setShowCongratulations(true);
      setHasShownCongratulations(true);
      setSalmonNigiriFirstCompletedAt(new Date().toISOString());
    }
  };

  // 获取当前登录用户
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // 用户未登录，跳转到登录页
        navigate('/log-in');
        return;
      }
      setUser(currentUser);
      setUserId(currentUser.id);
    };
    fetchUser();
  }, [navigate]);

  // 获取collection_puzzles配置
  useEffect(() => {
    const fetchCollectionPuzzles = async () => {
      try {
        const response = await collectionApi.getCollectionPuzzles();
        if (response.success) {
          setCollectionPuzzles(response.data || []);
        } else {
          console.error('Failed to fetch collection puzzles:', response.error);
          setCollectionPuzzles([]);
        }
      } catch (error) {
        console.error('Error fetching collection puzzles:', error);
        setCollectionPuzzles([]);
      }
    };

    fetchCollectionPuzzles();
  }, []);

  useEffect(() => {
    async function fetchCollections() {
      if (!userId) return;
      
      setLoading(true);
      try {
        // 获取认证token
        const token = await getAuthToken();
        if (!token) {
          console.error('No authentication token available');
          setCollections([]);
          setLoading(false);
          return;
        }

        // 使用后端API查询用户在所有主题下的收集
        const magicGardenResponse = await collectionApi.getUserCollections('Magic Garden', token);
        const salmonNigiriResponse = await collectionApi.getUserCollections('Salmon Nigiri Boy', token);
        
        console.log('Magic Garden response:', magicGardenResponse);
        console.log('Salmon Nigiri response:', salmonNigiriResponse);
        
        let allCollections = [];
        
        if (magicGardenResponse.success) {
          allCollections = allCollections.concat(magicGardenResponse.data || []);
        } else {
          console.error('Magic Garden API failed:', magicGardenResponse.error);
        }
        
        if (salmonNigiriResponse.success) {
          allCollections = allCollections.concat(salmonNigiriResponse.data || []);
        } else {
          console.error('Salmon Nigiri API failed:', salmonNigiriResponse.error);
        }
        
        console.log('All collections:', allCollections);
        setCollections(allCollections);
        
        // 检查是否应该显示CongratulationsModal
        await checkCongratulationsModal(allCollections);
      } catch (error) {
        console.error('Error fetching collection data:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, [userId]);

  // 计算每个 slot 的收集情况
  const slots = collectionPuzzles.map((puzzle) => {
    const found = collections.find(
      (item) => item.puzzle_name === puzzle.puzzle_name
    );
    return {
      ...puzzle,
      collected: !!found,
      count: found ? found.count : 0,
      icon_url: getPuzzleIconPath(puzzle.puzzle_name), // 动态生成图标路径
    };
  });

  // 计算已收集的种类数
  const collectedKinds = slots.filter((slot) => slot.collected).length;
  const totalKinds = collectionPuzzles.length;

  // 点击 puzzle 跳转到详情页
  const handlePuzzleClick = (slot) => {
    // 对于Salmon Nigiri Boy，不需要检查collected状态，因为它只是解锁显示
    if (slot.puzzle_name === 'Salmon Nigiri Boy' || slot.collected) {
      navigate(`/my-collections/detail/${slot.puzzle_name.toLowerCase()}`);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
      return (
    <div className={styles.myCollectionsPage}>
      <NavLogo isLoggedIn={true} isAuth={false} />
      <div className={styles.container}>
        <h1 className={`${styles.title} h1`}>My Collections</h1>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span className="body1">Loading collections...</span>
        </div>
      </div>
    </div>
  );
  }

  // 如果用户未登录，不渲染内容（会跳转到登录页）
  if (!user) {
    return null;
  }

  // 如果没有任何collection，显示空状态
  if (collections.length === 0) {
      return (
    <div className={styles.myCollectionsPage}>
      <NavLogo isLoggedIn={true} isAuth={false} />
      <div className={styles.container}>
        <h1 className={`${styles.title} h1`}>My Collections</h1>
        <div className={styles.emptyContainer}>
          <span className={`${styles.emptyHeading} h3`}>No puzzle collection yet!</span>
          <span className={`${styles.emptyText} body2`}>
            Choose a nutrition puzzle from homepage and reach your daily nutrition goal to collect puzzles.
          </span>
        </div>
      </div>
    </div>
  );
  }

  // 按主题分组显示
  const magicGardenSlots = slots.filter(slot => slot.collection_type === 'Magic Garden');
  const salmonNigiriSlots = slots.filter(slot => slot.collection_type === 'Salmon Nigiri Boy');
  
  const magicGardenCompleted = magicGardenSlots.filter(slot => slot.collected).length;
  
  // 只显示Salmon和Sushi Rice，不显示Salmon Nigiri Boy本身
  const salmonNigiriTopSlots = salmonNigiriSlots.filter(slot => 
    slot.puzzle_name === 'Salmon' || slot.puzzle_name === 'Sushi Rice'
  );
  const salmonNigiriTopCompleted = salmonNigiriTopSlots.every(slot => slot.collected);
  
  // 获取Salmon Nigiri Boy的收集数据
  const salmonNigiriBoySlot = salmonNigiriSlots.find(slot => slot.puzzle_name === 'Salmon Nigiri Boy');

  return (
    <div className={styles.myCollectionsPage}>
      <NavLogo isLoggedIn={true} isAuth={false} />
      <div className={styles.container}>
        <h1 className={`${styles.title} h1`}>My Collections</h1>
        
        {/* Magic Garden Theme */}
        {magicGardenSlots.length > 0 && (
          <div className={styles.collectionList}>
            <div className={styles.collectionScene}>
              <div className={styles.puzzleGrid}>
                {magicGardenSlots.map((slot, idx) => (
                  <div className={styles.puzzleSlot} key={idx}>
                    {slot.collected && (
                      <div
                        className={styles.puzzleImgWrapper}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handlePuzzleClick(slot)}
                      >
                        <img
                          src={slot.icon_url}
                          alt={slot.puzzle_name}
                          className={styles.puzzleImg}
                        />
                        {slot.count > 1 && (
                          <div className={styles.puzzleCount}>{slot.count}</div>
                        )}
                      </div>
                    )}
                    <img src="/assets/shadow.svg" alt="shadow" className={styles.shadow} />
                  </div>
                ))}
              </div>
            </div>
            {/* text module */}
            <div className={styles.textModule}>
              <div className={styles.headingModule}>
                <span className={`${styles.collectionName} h3`}>Magic Garden</span>
                <span className={`${styles.collectionProgress} h3`}>
                  {magicGardenCompleted}/{magicGardenSlots.length}
                </span>
              </div>
              <div className={`${styles.collectionDescription} body1`}>
                Complete daily nutrition challenge and collect 5 nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care.
              </div>
            </div>
          </div>
        )}

        {/* Salmon Nigiri Boy Theme */}
        <div className={styles.collectionList}>
          <div className={styles.collectionScene}>
            <div className={styles.topGrid}>
              {salmonNigiriTopSlots.map((slot, idx) => (
                <div className={styles.puzzleSlot} key={idx}>
                  {slot.collected && (
                    <div
                      className={styles.puzzleImgWrapper}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePuzzleClick(slot)}
                    >
                      <img
                        src={slot.icon_url}
                        alt={slot.puzzle_name}
                        className={styles.puzzleImg}
                      />
                      {slot.count > 1 && (
                        <div className={styles.puzzleCount}>{slot.count}</div>
                      )}
                    </div>
                  )}
                  <img src="/assets/shadow (1).svg" alt="shadow" className={styles.shadow} />
                </div>
              ))}
            </div>
            <div className={styles.bottomWrapper}>
              <div className={styles.bottomImgWrapper}>
                {salmonNigiriTopCompleted ? (
                  <div
                    className={styles.puzzleImgWrapper}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handlePuzzleClick({ 
                      puzzle_name: 'Salmon Nigiri Boy',
                      collection_type: 'Salmon Nigiri Boy',
                      icon_url: '/assets/puzzles/salmon_nigiri_boy.svg'
                    })}
                  >
                    <img
                      src="/assets/puzzles/salmon_nigiri_boy.svg"
                      alt="Salmon Nigiri Boy"
                      className={styles.bottomImg}
                    />
                    {salmonNigiriBoySlot?.count > 1 && (
                      <div className={styles.puzzleCount}>{salmonNigiriBoySlot.count}</div>
                    )}
                  </div>
                ) : (
                  <img
                    src="/assets/puzzles/salmon_nigiri_boy.svg"
                    alt="Salmon Nigiri Boy"
                    className={styles.bottomImg}
                    style={{ opacity: 0.4 }}
                  />
                )}
                <img src="/assets/shadow (2).svg" alt="shadow" className={styles.bottomShadow} />
              </div>
            </div>
          </div>
          {/* text module */}
          <div className={styles.textModule}>
            <div className={styles.headingModule}>
              <span className={`${styles.collectionName} h3`}>Salmon Nigiri Boy</span>
              <span className={`${styles.collectionProgress} h3`}>
                {salmonNigiriTopSlots.filter(slot => slot.collected).length}/{salmonNigiriTopSlots.length}
              </span>
            </div>
            <div className={`${styles.collectionDescription} body1`}>
              {salmonNigiriTopCompleted
                ? "Congratulations! Salmon Nigiri Boy is fully unlocked!"
                : "Collect two puzzles to unlock Salmon Nigiri Boy! The cutest sushi sidekick with a wink and a salmon-sized heart!"}
            </div>
          </div>
        </div>
      </div>
      
      {/* Congratulations Modal */}
      <CongratulationsModal 
        open={showCongratulations} 
        onClose={() => setShowCongratulations(false)} 
        firstCompletedAt={salmonNigiriFirstCompletedAt}
      />
    </div>
  );
} 