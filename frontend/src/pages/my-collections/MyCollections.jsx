import React, { useEffect, useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import styles from './MyCollections.module.css';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/user';
import { collectionApi } from '../../utils/api';

export default function MyCollections() {
  const [collections, setCollections] = useState([]); // 用户已收集的 puzzle
  const [collectionPuzzles, setCollectionPuzzles] = useState([]); // collection_puzzles配置
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 获取puzzle图标路径
  const getPuzzleIconPath = (puzzleName) => {
    const puzzleNameLower = puzzleName.toLowerCase();
    return `/assets/puzzles/puzzle_${puzzleNameLower}.svg`;
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
          // 如果API失败，使用默认配置
          setCollectionPuzzles([
            { puzzle_name: 'Carrot', slot: 1 },
            { puzzle_name: 'Avocado', slot: 2 },
            { puzzle_name: 'Corn', slot: 3 },
            { puzzle_name: 'Tomato', slot: 4 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching collection puzzles:', error);
        // 使用默认配置
        setCollectionPuzzles([
          { puzzle_name: 'Carrot', slot: 1 },
          { puzzle_name: 'Avocado', slot: 2 },
          { puzzle_name: 'Corn', slot: 3 },
          { puzzle_name: 'Tomato', slot: 4 },
        ]);
      }
    };

    fetchCollectionPuzzles();
  }, []);

  useEffect(() => {
    async function fetchCollections() {
      if (!userId) return;
      
      setLoading(true);
      try {
        // 使用后端API查询用户在 Magic Garden 下所有收集
        const response = await collectionApi.getUserCollections('Magic Garden');
        
        if (response.success) {
          setCollections(response.data || []);
        } else {
          console.error('Failed to fetch collection data:', response.error);
          setCollections([]);
        }
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
    if (!slot.collected) return;
    navigate(`/my-collections/detail/${slot.puzzle_name.toLowerCase()}`);
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className={styles.myCollectionsPage}>
        <NavLogo hideEat hideMenu isLoggedIn={true} />
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
        <NavLogo hideEat hideMenu isLoggedIn={true} />
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

  return (
    <div className={styles.myCollectionsPage}>
      <NavLogo hideEat hideMenu isLoggedIn={true} />
      <div className={styles.container}>
        <h1 className={`${styles.title} h1`}>My Collections</h1>
        {/* Collection 展示区 */}
        <div className={styles.collectionList}>
          <div className={styles.collectionScene}>
            <div className={styles.elementWrapper}>
              <div className={styles.puzzleGrid}>
                {slots.map((slot, idx) => (
                  <div className={styles.puzzleSlot} key={idx}>
                    {/* puzzle 图标 */}
                    {slot.collected && slot.icon_url && (
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
                          <span className={styles.puzzleCount}>×{slot.count}</span>
                        )}
                      </div>
                    )}
                    {/* shadow 始终显示 */}
                    <img
                      src="/assets/shadow.svg"
                      alt="shadow"
                      className={styles.shadow}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* text module */}
          <div className={styles.textModule}>
            <div className={styles.headingModule}>
              <span className={`${styles.collectionName} h3`}>Magic Garden</span>
              <span className={`${styles.collectionProgress} h3`}>
                {collectedKinds}/{totalKinds}
              </span>
            </div>
            <div className={`${styles.collectionDescription} body1`}>
              {collectedKinds === totalKinds
                ? "Congratulations! Your Magic Garden is complete and thriving!"
                : "Little by little, your garden is coming alive. Keep tending to it with care."
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 