import React, { useMemo, useState, useEffect } from 'react';
import styles from './CollectionDetail.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { puzzleCategories, colorOrders } from '../../data/puzzles';
import ShareLinkModal from './ShareLinkModal';
import { supabase } from '../../supabaseClient';
import { getCurrentUser } from '../../utils/user';

// 默认营养素标签
const NUTRITION_LABELS = [
  { key: 'carbs', label: 'Carbs', nutrient: 1 },
  { key: 'protein', label: 'Protein', nutrient: 2 },
  { key: 'fats', label: 'Fats', nutrient: 3 }
];

// 工具函数：按顺序提取某营养素的所有颜色
function getNutrientColorsByOrder(pixelMap, nutrientType, colorOrder) {
  if (!pixelMap) return [];
  const colorSet = new Set();
  for (let y = 0; y < pixelMap.length; y++) {
    for (let x = 0; x < pixelMap[y].length; x++) {
      const pix = pixelMap[y][x];
      if (pix.nutrient === nutrientType) {
        colorSet.add(pix.color);
      }
    }
  }
  return colorOrder.filter(color => colorSet.has(color));
}

export default function CollectionDetail({
  puzzleName: propPuzzleName,
  collectionType: propCollectionType,
  iconUrl: propIconUrl,
  description: propDescription,
  date: propDate,
  nutritionGoals = { carbs: 200, protein: 150, fats: 80 },
  onClose
}) {
  const navigate = useNavigate();
  const params = useParams();
  const [showShareModal, setShowShareModal] = useState(false);
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 支持路由参数和props两种方式
  const puzzleName = propPuzzleName || (params.puzzleName ? params.puzzleName.charAt(0).toUpperCase() + params.puzzleName.slice(1) : 'Carrot');

  // 查找当前puzzle的配置
  const puzzle = useMemo(() => {
    for (const cat of puzzleCategories) {
      const found = cat.puzzles.find(p => p.name.toLowerCase() === puzzleName.toLowerCase());
      if (found) return found;
    }
    return null;
  }, [puzzleName]);

  const collectionType = propCollectionType || (puzzle?.category || 'Magic Garden');
  const iconUrl = propIconUrl || puzzle?.iconUrl || 'https://rejsoyzhhukatdaebgtq.supabase.co/storage/v1/object/public/puzzle-icons//carrot.svg';
  const description = propDescription || puzzle?.description || "Bright, balanced, and well-fed. That's the carrot energy we love to see.";

  // 从数据库获取collection数据
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_collections')
          .select('first_completed_at, nutrition')
          .eq('user_id', user.id)
          .eq('collection_type', collectionType)
          .eq('puzzle_name', puzzleName)
          .single();

        if (error) {
          console.error('Failed to fetch collection data:', error);
          setError('Failed to load collection data');
        } else {
          setCollectionData(data || []);
        }
      } catch (error) {
        console.error('Error fetching collection data:', error);
        setError('Failed to load collection data');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [puzzleName, collectionType]);

  // 动态生成palette颜色，兼容不同puzzle
  const paletteColors = useMemo(() => {
    if (!puzzle?.pixelMap) return {
      carbs: ['#FF9F58', '#FB6D03', '#FB3503', '#B92F17'],
      protein: ['#3B0E09'],
      fats: ['#98E673', '#60BF32', '#0FA23A', '#1D793B']
    };
    return {
      carbs: getNutrientColorsByOrder(puzzle.pixelMap, 1, colorOrders['C']),
      protein: getNutrientColorsByOrder(puzzle.pixelMap, 2, colorOrders['P']),
      fats: getNutrientColorsByOrder(puzzle.pixelMap, 3, colorOrders['F'])
    };
  }, [puzzle]);

  // 获取日期字符串
  const dateStr = useMemo(() => {
    if (collectionData?.first_completed_at) {
      const date = new Date(collectionData.first_completed_at);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    }
    // 如果没有数据，使用props中的date或当前时间
    const fallbackDate = propDate || new Date();
    return fallbackDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }, [collectionData, propDate]);

  // 获取营养数据
  const nutritionData = useMemo(() => {
    if (collectionData?.nutrition) {
      return {
        carbs: collectionData.nutrition.carbs || 0,
        protein: collectionData.nutrition.protein || 0,
        fats: collectionData.nutrition.fats || 0
      };
    }
    // 如果没有数据，使用默认值
    return { carbs: 0, protein: 0, fats: 0 };
  }, [collectionData]);

  // 获取当前用户昵称和头像（与Account页面一致）
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  useEffect(() => {
    async function fetchUserMeta() {
      const user = await getCurrentUser();
      if (user && user.user_metadata) {
        setNickname(user.user_metadata.name || '');
        setAvatarUrl(user.user_metadata.avatarUrl || '');
      }
    }
    fetchUserMeta();
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.header}>
          <h1 className={`${styles.title} h1`}>{puzzleName}</h1>
          <div className={styles.closeBtn} onClick={handleClose}>
            <img src="/assets/close (1).svg" alt="close" className={styles.closeIcon} />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <span className="body1">Loading collection details...</span>
          </div>
        </div>
      </div>
    );
  }

  // 如果有错误，显示错误状态
  if (error) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.header}>
          <h1 className={`${styles.title} h1`}>{puzzleName}</h1>
          <div className={styles.closeBtn} onClick={handleClose}>
            <img src="/assets/close (1).svg" alt="close" className={styles.closeIcon} />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <span className="body1">Failed to load collection data</span>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={`${styles.title} h1`}>{puzzleName}</h1>
        <div className={styles.closeBtn} onClick={handleClose}>
          <img src="/assets/close (1).svg" alt="close" className={styles.closeIcon} />
        </div>
      </div>
      {/* Container */}
      <div className={styles.container}>
        {/* Puzzle Card */}
        <div className={styles.puzzleCard}>
          <div className={`${styles.timestamp} h5`}>{dateStr}</div>
          <div className={styles.headingModule}>
            <div className={`${styles.collectionInfo} label`}>{collectionType}・{puzzleName}</div>
            <div className={styles.heading}>{description}</div>
          </div>
          <img src={iconUrl} alt={puzzleName} className={styles.puzzleImg} />
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
          <button className={styles.ctaBtnSecondary}>
            <span className="h4" style={{ color: 'var(--Neutral-Primary-Text, #22221B)' }}>Save</span>
            <img src="/assets/Download.svg" alt="Download" className={styles.ctaIcon} />
          </button>
          <button className={styles.ctaBtnPrimary} onClick={() => setShowShareModal(true)}>
            <span className="h4" style={{ color: 'var(--Neutral-White, #FFF)' }}>Share</span>
            <img src="/assets/Share.svg" alt="Share" className={styles.ctaIcon} />
          </button>
        </div>
      </div>
      {/* Share Link Modal */}
      <ShareLinkModal 
        open={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        puzzleName={puzzleName} 
        nickname={nickname} 
      />
    </div>
  );
} 