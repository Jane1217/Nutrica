import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styles from './SharePage.module.css';
import { formatDateString, normalizeNutritionData, getUserNameFromQuery, capitalizePuzzleName } from '../../utils';
import { collectionApi } from '../../utils/api';
import { puzzleCategories } from '../../data/puzzles';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SharePage() {
  const { userId, puzzleName } = useParams();
  const query = useQuery();
  const [nutritionData, setNutritionData] = useState(null);
  const [firstCompletedAt, setFirstCompletedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 优先从URL参数获取nickname
  const nicknameFromQuery = query.get('nickname');

  // 查找当前puzzle的配置
  const puzzle = useMemo(() => {
    for (const cat of puzzleCategories) {
      const found = cat.puzzles.find(p => p.name.toLowerCase() === puzzleName.toLowerCase());
      if (found) return found;
    }
    return null;
  }, [puzzleName]);

  // 获取图片路径和描述
  const iconUrl = puzzle?.img || '/assets/puzzles/puzzle_carrot.svg';
  const description = puzzle?.description || "Bright, balanced, and well-fed. That's the carrot energy we love to see.";

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        setLoading(true);
        // 将puzzle_name首字母大写以匹配数据库格式
        const puzzleNameFormatted = puzzleName.charAt(0).toUpperCase() + puzzleName.slice(1).toLowerCase();
        // 使用公开API获取collection数据
        const response = await collectionApi.getPublicCollection(userId, puzzleNameFormatted);
        
        if (response.success && response.data) {
          setNutritionData(response.data.nutrition);
          setFirstCompletedAt(response.data.first_completed_at);
        } else {
          console.error('Failed to fetch collection data:', response.error);
          setError('Collection not found');
          setLoading(false);
          return;
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

  // 获取昵称，优先用URL参数
  const getUserName = () => {
    return nicknameFromQuery || '';
  };

  // 获取营养数据
  const getNutritionData = () => {
    if (!nutritionData) {
      return { carbs: 0, protein: 0, fats: 0 };
    }
    return {
      carbs: nutritionData.carbs || 0,
      protein: nutritionData.protein || 0,
      fats: nutritionData.fats || 0
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

  const nutrition = normalizeNutritionData(nutritionData);
  const dateStr = formatDateString(firstCompletedAt);
  const userName = getUserNameFromQuery(query);
  const puzzleNameCap = capitalizePuzzleName(puzzleName);

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
        <div className={`h2 ${styles.title}`}>
          {userName} collected a nutrition puzzle!
        </div>

        {/* Puzzle Card */}
        <div className={styles.puzzleCard}>
          <div className={`${styles.timestamp} h5`}>{dateStr}</div>
          <div className={styles.headingModule}>
            <div className={`${styles.collectionInfo} label`}>
              Magic Garden・{puzzleNameCap}
            </div>
            <div className={styles.heading}>
              {description}
            </div>
          </div>
          <img 
            src={iconUrl} 
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
                  <div className={`${styles.nutritionValue} h5`}>{nutrition[item.key]}g</div>
                  <div className={`${styles.nutritionLabel} label`}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Module */}
        <div className={styles.actionModule}>
          <div className={`${styles.actionText} h4`}>
            Collect your nutrition puzzles on
          </div>
          <a 
            href="https://my-nutrition-demo-openai-frontend.vercel.app/" 
            className={styles.ctaButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={`${styles.ctaLabel} h4`}>Nutrica.life</span>
          </a>
        </div>
      </div>
    </div>
  );
} 