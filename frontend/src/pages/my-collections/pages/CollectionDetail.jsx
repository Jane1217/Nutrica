import React, { useMemo, useState, useEffect } from 'react';
import styles from '../styles/CollectionDetail.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { puzzleCategories, colorOrders } from '../../../data/puzzles';
import ShareLinkModal from '../modals/ShareLinkModal';
import ImageShareModal from '../modals/ImageShareModal';
import { getCurrentUser, getAuthToken } from '../../../utils';
import { formatDateString, capitalizePuzzleName, getPuzzleCardBackground, getPageBackground, getNutrientColorsByOrder, NUTRITION_LABELS } from '../../../utils';
import { collectionApi } from '../../../utils';
import { 
  isSpecialPuzzle, 
  getSpecialPuzzleConfig, 
  hasNutritionModule, 
  getPuzzleImageStyle,
  getPuzzleCollectionType,
  getPuzzleImageUrl,
  getPuzzleDescription
} from '../../../utils';





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
  const [showImageShare, setShowImageShare] = useState(false);
  
  // 支持路由参数和props两种方式
  const puzzleName = propPuzzleName || (params.puzzleName ? capitalizePuzzleName(params.puzzleName) : 'Carrot');

  // 查找当前puzzle的配置
  const puzzle = useMemo(() => {
    // 使用puzzleConfig工具查找
    if (isSpecialPuzzle(puzzleName)) {
      return getSpecialPuzzleConfig(puzzleName);
    }
    
    // 查找其他puzzle
    for (const cat of puzzleCategories) {
      const found = cat.puzzles.find(p => p.name.toLowerCase() === puzzleName.toLowerCase());
      if (found) return found;
    }
    return null;
  }, [puzzleName]);

  const collectionType = propCollectionType || getPuzzleCollectionType(puzzleName);
  const iconUrl = propIconUrl || getPuzzleImageUrl(puzzleName, puzzle);
  const description = propDescription || getPuzzleDescription(puzzleName, puzzle);

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

        // 获取认证token
        const token = await getAuthToken();
        if (!token) {
          setError('No authentication token available');
          setLoading(false);
          return;
        }

        // 使用后端API获取collection数据
        const response = await collectionApi.getUserCollections(collectionType, token);
        
        if (response.success && response.data) {
          const collectionData = response.data.find(
            collection => collection.puzzle_name === puzzleName
          );
          setCollectionData(collectionData || null);
        } else {
          console.error('Failed to fetch collection data:', response.error);
          setError('Failed to load collection data');
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
    // 修正：根据puzzle.id动态获取colorOrder
    const colorOrder = colorOrders[puzzle.id]
    return {
      carbs: getNutrientColorsByOrder(puzzle.pixelMap, 1, colorOrder),
      protein: getNutrientColorsByOrder(puzzle.pixelMap, 2, colorOrder),
      fats: getNutrientColorsByOrder(puzzle.pixelMap, 3, colorOrder)
    };
  }, [puzzle]);

  // 获取日期字符串
  const dateStr = useMemo(() => {
    if (collectionData?.first_completed_at) {
      return formatDateString(collectionData.first_completed_at);
    }
    // 如果没有数据，使用props中的date或当前时间
    const fallbackDate = propDate || new Date();
    return formatDateString(fallbackDate);
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
      <div className={styles.detailPage} style={{ background: getPageBackground(collectionType) }}>
        <div className={styles.header}>
          <div className={`${styles.title} h1`}>{puzzleName}</div>
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
      <div className={styles.detailPage} style={{ background: getPageBackground(collectionType) }}>
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

  // puzzleCard渲染片段（与主卡片一致）
  const puzzleCardNode = isSpecialPuzzle(puzzleName) ? (
    // 特殊puzzle使用与CongratulationsModal相同的结构
    <div className={styles.puzzleCard} style={{
      boxShadow:'none', 
      border:'2px solid #22221B', 
      background: '#F6B384'
    }}>
      <div className={`${styles.timestamp} h5`}>{dateStr}</div>
      <div className={styles.headingModule}>
        <div className={`${styles.collectionInfo} label`}>{puzzleName}</div>
        <div className={styles.heading}>
          {description}
        </div>
      </div>
      <img 
        src={iconUrl} 
        alt={puzzleName} 
        className={styles.puzzleImg}
        style={getPuzzleImageStyle(puzzleName)}
      />
    </div>
  ) : (
    // 其他puzzle使用原有结构
    <div className={styles.puzzleCard} style={{
      boxShadow:'none', 
      border:'2px solid #22221B', 
      background: getPuzzleCardBackground(puzzleName, collectionType)
    }}>
          <div className={`${styles.timestamp} h5`}>{dateStr}</div>
          <div className={styles.headingModule}>
            <div className={`${styles.collectionInfo} label`}>{collectionType}・{puzzleName}</div>
            <div className={styles.heading}>{description}</div>
          </div>
          <img src={iconUrl} alt={puzzleName} className={styles.puzzleImg} />
          {/* Nutrition Module - 根据puzzle配置决定是否显示 */}
          {hasNutritionModule(puzzleName) && (
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
          )}
        </div>
  );

  return (
    <div className={styles.detailPage} style={{ background: getPageBackground(collectionType) }}>
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
        {puzzleCardNode}
        {/* Action Module */}
        <div className={styles.actionModule}>
          <button className={styles.ctaBtnSecondary} onClick={() => setShowImageShare(true)}>
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
      <ImageShareModal 
        open={showImageShare} 
        onClose={() => setShowImageShare(false)} 
        puzzleCard={puzzleCardNode} 
        collectionType={collectionType}
      />
    </div>
  );
} 