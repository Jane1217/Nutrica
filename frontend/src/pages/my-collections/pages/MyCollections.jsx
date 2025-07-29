import React, { useEffect, useState } from 'react';
import NavLogo from '../../../components/navbar/Nav-Logo';
import styles from '../styles/MyCollections.module.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../utils/user';
import { collectionApi } from '../../../utils/api';
import { getAuthToken } from '../../../utils/user';
import CongratulationsModal from '../modals/CongratulationsModal';
import { 
  isSpecialPuzzle, 
  getSpecialPuzzleConfig, 
  isSynthesisPuzzle
} from '../../../utils/puzzleConfig';

export default function MyCollections() {
  const [collections, setCollections] = useState([]); // 用户已收集的 puzzle
  const [collectionPuzzles, setCollectionPuzzles] = useState([]); // collection_puzzles配置
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [salmonNigiriFirstCompletedAt, setSalmonNigiriFirstCompletedAt] = useState(null);
  const navigate = useNavigate();

  // 获取puzzle图标路径
  const getPuzzleIconPath = (puzzleName) => {
    const puzzleNameLower = puzzleName.toLowerCase();
    // Replace spaces with underscores for asset paths
    return `/assets/puzzles/puzzle_${puzzleNameLower.replace(/\s+/g, '_')}.svg`;
  };

  // 检查是否应该显示CongratulationsModal并添加特殊puzzle到user_collections
  const checkCongratulationsModal = async (collectionsData) => {
    // 检查所有特殊puzzle的解锁条件
    const specialPuzzles = ['salmon nigiri boy']; // 可以扩展更多特殊puzzle
    
    for (const puzzleName of specialPuzzles) {
      if (!isSynthesisPuzzle(puzzleName)) continue;
      
      const config = getSpecialPuzzleConfig(puzzleName);
      if (!config) continue;
      
      const collectionType = config.collectionType;
      const unlockConditions = config.unlockConditions;
      
      // 检查是否有该主题的收集
      const themeCollections = collectionsData.filter(
        collection => collection.collection_type === collectionType
      );
      
      // 检查是否收集了所有解锁条件
      const allConditionsMet = unlockConditions.every(condition =>
        themeCollections.some(
          collection => collection.puzzle_name.toLowerCase() === condition && (collection.collected || (collection.count && collection.count > 0))
        )
      );
      
      // 检查是否已经有该特殊puzzle的收集记录
      const puzzleAlreadyCollected = themeCollections.some(
        collection => collection.puzzle_name.toLowerCase() === puzzleName
      );
      
      // 如果所有条件都满足了
      if (allConditionsMet) {
        // 如果还没有该特殊puzzle的收集记录，则添加
        if (!puzzleAlreadyCollected) {
          try {
            const token = await getAuthToken();
            if (token) {
              const response = await collectionApi.addPuzzleToCollection({
                puzzle_name: config.name,
                collection_type: collectionType,
                nutrition: { carbs: 0, protein: 0, fats: 0 },
                first_completed_at: new Date().toISOString()
              }, token);
              
              if (response.success) {
                // Puzzle added to user_collections
              } else {
                console.error(`Failed to add ${config.name} to user_collections:`, response.error);
              }
            }
          } catch (error) {
            console.error(`Error adding ${config.name} to user_collections:`, error);
          }
        }
        
        // 检查是否已经显示过CongratulationsModal
        // 这里我们需要查询user_congratulations_shown表
        let hasShownCongratulations = false;
        try {
          const token = await getAuthToken();
          if (token) {
            const response = await collectionApi.getCongratulationsShownStatus(config.name, collectionType, token);
            if (response.success) {
              hasShownCongratulations = response.data && response.data.length > 0;
            }
          }
        } catch (error) {
          console.error('Error checking congratulations shown status:', error);
        }
        
        // 只有在第一次解锁且还没有显示过CongratulationsModal时才显示
        if (!hasShownCongratulations) {
          setShowCongratulations(true);
          
          // 标记为已显示（更新数据库）
          try {
            const token = await getAuthToken();
            if (token) {
              await collectionApi.updateCongratulationsShown(config.name, collectionType, token);
              // CongratulationsModal shown status updated in database
            }
          } catch (error) {
            console.error('Error updating congratulations shown status:', error);
          }
        }
        
        // 设置first_completed_at时间
        if (puzzleAlreadyCollected) {
          const existingPuzzle = themeCollections.find(
            collection => collection.puzzle_name.toLowerCase() === puzzleName
          );
          if (existingPuzzle && existingPuzzle.first_completed_at) {
            setSalmonNigiriFirstCompletedAt(existingPuzzle.first_completed_at);
          } else {
            setSalmonNigiriFirstCompletedAt(new Date().toISOString());
          }
        } else {
          setSalmonNigiriFirstCompletedAt(new Date().toISOString());
        }
        
        break; // 只处理第一个满足条件的特殊puzzle
      }
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
    // 对于特殊puzzle，不需要检查collected状态，因为它们只是解锁显示
    if (isSpecialPuzzle(slot.puzzle_name) || slot.collected) {
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
  const magicGardenCompleted = magicGardenSlots.filter(slot => slot.collected).length;
  
  // 处理特殊puzzle主题
  const specialPuzzleThemes = ['Salmon Nigiri Boy']; // 可以扩展更多特殊主题
  const specialThemeData = {};
  
  for (const theme of specialPuzzleThemes) {
    const themeSlots = slots.filter(slot => slot.collection_type === theme);
    const config = getSpecialPuzzleConfig(theme.toLowerCase());
    
    if (config) {
      const unlockConditions = config.unlockConditions;
      const topSlots = themeSlots.filter(slot => 
        unlockConditions.includes(slot.puzzle_name.toLowerCase())
      );
      const topCompleted = topSlots.every(slot => slot.collected);
      const specialPuzzleSlot = themeSlots.find(slot => 
        slot.puzzle_name.toLowerCase() === theme.toLowerCase()
      );
      
      specialThemeData[theme] = {
        slots: themeSlots,
        topSlots,
        topCompleted,
        specialPuzzleSlot,
        config
      };
    }
  }

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

        {/* 特殊Puzzle主题 */}
        {Object.entries(specialThemeData).map(([theme, data]) => (
          <div className={styles.collectionList} key={theme}>
            <div className={styles.collectionScene}>
              <div className={styles.topGrid}>
                {data.topSlots.map((slot, idx) => (
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
                  {data.topCompleted ? (
                    <div
                      className={styles.puzzleImgWrapper}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePuzzleClick({ 
                        puzzle_name: data.config.name,
                        collection_type: theme,
                        icon_url: data.config.img
                      })}
                    >
                      <img
                        src={data.config.img}
                        alt={data.config.name}
                        className={styles.bottomImg}
                      />
                      {data.specialPuzzleSlot?.count > 1 && (
                        <div className={styles.puzzleCount}>{data.specialPuzzleSlot.count}</div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={data.config.img}
                      alt={data.config.name}
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
                <span className={`${styles.collectionName} h3`}>{theme}</span>
                <span className={`${styles.collectionProgress} h3`}>
                  {data.topSlots.filter(slot => slot.collected).length}/{data.topSlots.length}
                </span>
              </div>
              <div className={`${styles.collectionDescription} body1`}>
                {data.topCompleted
                  ? `Congratulations! ${data.config.name} is fully unlocked!`
                  : data.config.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Congratulations Modal */}
      <CongratulationsModal 
        open={showCongratulations} 
        onClose={() => setShowCongratulations(false)}
        firstCompletedAt={salmonNigiriFirstCompletedAt}
        puzzleName="Salmon Nigiri Boy"
      />
    </div>
  );
} 