import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './SharePage.module.css';

export default function SharePage() {
  const { userId, puzzleName } = useParams();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        setLoading(true);
        
        // 查询用户收藏数据
        const { data: collectionData, error: collectionError } = await supabase
          .from('user_collections')
          .select(`
            first_completed_at,
            nutrition,
            user_id,
            collection_type
          `)
          .eq('user_id', userId)
          .eq('puzzle_name', puzzleName.charAt(0).toUpperCase() + puzzleName.slice(1))
          .eq('collection_type', 'Magic Garden')
          .single();

        if (collectionError) {
          console.error('Failed to fetch collection data:', collectionError);
          setError('Collection not found');
          setLoading(false);
          return;
        }

        // 查询用户信息 - 使用管理员API获取用户元数据
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError) {
          console.error('Failed to fetch user data:', userError);
          // 如果获取用户数据失败，仍然显示收藏数据，只是用户名显示为默认值
          setShareData({
            collection: collectionData,
            user: null
          });
        } else {
          setShareData({
            collection: collectionData,
            user: userData
          });
        }
      } catch (err) {
        console.error('Error fetching share data:', err);
        setError('Failed to load share data');
      } finally {
        setLoading(false);
      }
    };

    if (userId && puzzleName) {
      fetchShareData();
    }
  }, [userId, puzzleName]);

  // 获取日期字符串
  const getDateString = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // 获取用户名 - 参考Account页面的方式
  const getUserName = () => {
    if (!shareData?.user?.user_metadata?.name) {
      // 如果没有name，尝试使用email的第一个字符
      const email = shareData?.user?.email;
      if (email && email[0]) {
        return email[0].toUpperCase();
      }
      return 'Someone';
    }
    return shareData.user.user_metadata.name;
  };

  // 获取营养数据
  const getNutritionData = () => {
    if (!shareData?.collection?.nutrition) {
      return { carbs: 0, protein: 0, fats: 0 };
    }
    return {
      carbs: shareData.collection.nutrition.carbs || 0,
      protein: shareData.collection.nutrition.protein || 0,
      fats: shareData.collection.nutrition.fats || 0
    };
  };

  // 营养标签
  const NUTRITION_LABELS = [
    { key: 'carbs', label: 'Carbs', nutrient: 1 },
    { key: 'protein', label: 'Protein', nutrient: 2 },
    { key: 'fats', label: 'Fats', nutrient: 3 }
  ];

  // 默认颜色配置
  const paletteColors = {
    carbs: ['#FF9F58', '#FB6D03', '#FB3503', '#B92F17'],
    protein: ['#3B0E09'],
    fats: ['#98E673', '#60BF32', '#0FA23A', '#1D793B']
  };

  if (loading) {
    return (
      <div className={styles.sharePage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span className="body1">Loading shared puzzle...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.sharePage}>
        <div className={styles.errorContainer}>
          <span className="body1">This puzzle collection is not available</span>
        </div>
      </div>
    );
  }

  const nutritionData = getNutritionData();
  const dateStr = getDateString(shareData?.collection?.first_completed_at);

  return (
    <div className={styles.sharePage}>
      {/* Nav Bar */}
      <div className={styles.navBar}>
        <div className={styles.logoModule}>
          <img src="/assets/logo.svg" alt="Logo" className={styles.logo} />
        </div>
      </div>

      {/* Container */}
      <div className={styles.container}>
        {/* Title */}
        <h2 className={styles.title}>
          {getUserName()} collected a nutrition puzzle!
        </h2>

        {/* Puzzle Card */}
        <div className={styles.puzzleCard}>
          <div className={`${styles.timestamp} h5`}>{dateStr}</div>
          <div className={styles.headingModule}>
            <div className={`${styles.collectionInfo} label`}>
              {shareData?.collection?.collection_type}・{puzzleName.charAt(0).toUpperCase() + puzzleName.slice(1)}
            </div>
            <div className={styles.heading}>
              Bright, balanced, and well-fed. That's the {puzzleName} energy we love to see.
            </div>
          </div>
          <img 
            src={`https://rejsoyzhhukatdaebgtq.supabase.co/storage/v1/object/public/puzzle-icons//${puzzleName}.svg`} 
            alt={puzzleName} 
            className={styles.puzzleImg} 
          />
          
          {/* Nutrition Module */}
          <div className={styles.nutritionModule}>
            {NUTRITION_LABELS.map((item) => (
              <div className={styles.nutritionItem} key={item.key}>
                <div className={styles.palette}>
                  {(paletteColors[item.key] || ['#EEE']).map((color, i, arr) => (
                    <div
                      key={i}
                      className={styles.paletteSegment}
                      style={{
                        background: color,
                        height: `${24 / arr.length}px`,
                        borderTopLeftRadius: i === 0 ? 4 : 0,
                        borderTopRightRadius: i === 0 ? 4 : 0,
                        borderBottomLeftRadius: i === arr.length - 1 ? 4 : 0,
                        borderBottomRightRadius: i === arr.length - 1 ? 4 : 0,
                      }}
                    />
                  ))}
                </div>
                <div className={styles.nutritionValueWrapper}>
                  <div className={`${styles.nutritionValue} h5`}>{nutritionData[item.key]}g</div>
                  <div className={`${styles.nutritionLabel} label`}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Module */}
        <div className={styles.actionModule}>
          <h4 className={styles.actionText}>
            Collect your nutrition puzzles on
          </h4>
          <a 
            href="https://my-nutrition-demo-openai-frontend.vercel.app/" 
            className={styles.ctaButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h4 className={styles.ctaLabel}>Nutrica.life</h4>
          </a>
        </div>
      </div>
    </div>
  );
} 