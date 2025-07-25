import React, { useState, useEffect } from 'react';
import CameraPermissionModal from './CameraPermissionModal';
import EnterValueModal from './EnterValueModal';
import DescribeModal from './DescribeModal';
import DescribeFoodModal from './DescribeFoodModal';
// 移除本地ScanLabelPage引用，后续用路由跳转
import '../styles/EatModal.css';
import { useNavigate } from 'react-router-dom';
import { formatFoodTime, formatFoodTimeSmart } from '../../../utils/format';
import { parseFoodDescription } from '../../../utils';
import ModalWrapper from '../../../components/common/ModalWrapper';
import { icons } from '../../../utils';

export default function EatModal({ onClose, foods = [], foodsLoading = false, onDescribe, onEnterValue, userId, onDataChange, onFoodsScroll, open }) {
  const [step, setStep] = useState('main'); // 'main' | 'camera-permission' | 'scan' | 'enter-value' | 'describe' | 'describe-food'
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foodsState, setFoodsState] = useState(foods);
  const navigate = useNavigate();

  // foods数据变化时自动刷新
  useEffect(() => {
    setFoodsState(foods);
  }, [foods]);

  // 当EatModal关闭时重置step状态
  useEffect(() => {
    if (!open) {
      setStep('main');
    }
  }, [open]);

  // 监听弹窗内容区滚动，触发加载更多
  const group2Ref = React.useRef(null);
  useEffect(() => {
    const el = group2Ref.current;
    if (!el || !onFoodsScroll) return;
    const handler = (e) => onFoodsScroll(e);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [onFoodsScroll]);

  // 新增/修改后调用onDataChange
  const handleDataChange = () => {
    if (onDataChange) onDataChange();
  };

  const handleScanLabel = () => setStep('camera-permission');
  const handleCameraPermissionOk = () => {
    // 跳转到 scan label 页面
    navigate('/eat/scan-label');
  };
  const handleCloseScan = () => setStep('main');
  const handleEnterValue = () => setStep('enter-value');
  const handleCloseEnterValue = () => setStep('main');
  const handleDescribe = () => setStep('describe');
  const handleCloseDescribe = () => setStep('main');
  const handleCloseDescribeFood = () => setStep('main');
  const handleBackDescribeFood = () => setStep('describe');
  const handleBackEnterValue = () => setStep('main');
  const handleBackDescribe = () => setStep('main');
  
  const handleDescribeNext = async (description) => {
    setLoading(true);
    setError('');
    try {
      const response = await parseFoodDescription(description);
      if (response.success) {
        setAiData(response.data);
        setStep('describe-food');
      } else {
        setError(response.error || 'AI analysis failed');
      }
    } catch (error) {
      setError(error.message || 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // 在EatModal内部定义CloseButton
  function CloseButton({ onClick }) {
    return (
      <button className="eat-modal-close-btn" onClick={onClick}>
        <span className="close-fill">
          <img src={icons.closeFillBlack} alt="close" width="24" height="24" />
        </span>
      </button>
    );
  }

  return (
    <>
      {/* 主EatModal */}
      <ModalWrapper open={open && step === 'main'} onClose={onClose}>
        <div className="eat-modal">
          <div className="eat-modal-group1">
            <span className="eat-modal-title">Eat</span>
            <CloseButton onClick={onClose} />
          </div>
          {/* group2: 最近食物 */}
          <div className="eat-modal-group2">
            <div className="eat-modal-group2-1">
              <span className="eat-modal-recent-text h3">Recent</span>
              <span className="eat-modal-history-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C9.9 21 8.04167 20.3627 6.425 19.088C4.80833 17.8133 3.75833 16.184 3.275 14.2C3.20833 13.95 3.25833 13.721 3.425 13.513C3.59167 13.305 3.81667 13.184 4.1 13.15C4.36667 13.1167 4.60833 13.1667 4.825 13.3C5.04167 13.4333 5.19167 13.6333 5.275 13.9C5.675 15.4 6.5 16.625 7.75 17.575C9 18.525 10.4167 19 12 19C13.95 19 15.6043 18.321 16.963 16.963C18.3217 15.605 19.0007 13.9507 19 12C18.9993 10.0493 18.3203 8.39533 16.963 7.038C15.6057 5.68067 13.9513 5.00133 12 5C10.85 5 9.775 5.26667 8.775 5.8C7.775 6.33333 6.93333 7.06667 6.25 8H8C8.28333 8 8.521 8.096 8.713 8.288C8.905 8.48 9.00067 8.71733 9 9C8.99933 9.28267 8.90333 9.52033 8.712 9.713C8.52067 9.90567 8.28333 10.0013 8 10H4C3.71667 10 3.47933 9.904 3.288 9.712C3.09667 9.52 3.00067 9.28267 3 9V5C3 4.71667 3.096 4.47933 3.288 4.288C3.48 4.09667 3.71733 4.00067 4 4C4.28267 3.99933 4.52033 4.09533 4.713 4.288C4.90567 4.48067 5.00133 4.718 5 5V6.35C5.85 5.28333 6.88767 4.45833 8.113 3.875C9.33833 3.29167 10.634 3 12 3C13.25 3 14.421 3.23767 15.513 3.713C16.605 4.18833 17.555 4.82967 18.363 5.637C19.171 6.44433 19.8127 7.39433 20.288 8.487C20.7633 9.57967 21.0007 10.7507 21 12C20.9993 13.2493 20.762 14.4203 20.288 15.513C19.814 16.6057 19.1723 17.5557 18.363 18.363C17.5537 19.1703 16.6037 19.812 15.513 20.288C14.4223 20.764 13.2513 21.0013 12 21ZM13 11.6L15.5 14.1C15.6833 14.2833 15.775 14.5167 15.775 14.8C15.775 15.0833 15.6833 15.3167 15.5 15.5C15.3167 15.6833 15.0833 15.775 14.8 15.775C14.5167 15.775 14.2833 15.6833 14.1 15.5L11.3 12.7C11.2 12.6 11.125 12.4877 11.075 12.363C11.025 12.2383 11 12.109 11 11.975V8C11 7.71667 11.096 7.47933 11.288 7.288C11.48 7.09667 11.7173 7.00067 12 7C12.2827 6.99933 12.5203 7.09533 12.713 7.288C12.9057 7.48067 13.0013 7.718 13 8V11.6Z" fill="#22221B"/>
                </svg>
              </span>
            </div>
            <div className="eat-modal-group2-2" ref={group2Ref}>
              {foodsLoading && foodsState.length === 0 ? (
                <div className="eat-modal-loading">
                  <div className="eat-modal-loading-spinner"></div>
                  <span className="eat-modal-loading-text">Loading...</span>
                </div>
              ) : !foodsLoading && foodsState.length === 0 ? (
                <div className="eat-modal-empty">
                  <span className="eat-modal-empty-text">No food records yet</span>
                </div>
              ) : (
                foodsState.map((food, idx) => (
                <div className="eat-modal-food-card" key={idx}>
                  <div className="eat-modal-food-wrapper">
                    <div className="eat-modal-food-heading">
                        <span className="eat-modal-food-icon">{food.emoji}</span>
                        <span className="eat-modal-food-name h5" style={{color:'#000'}}>{food.name}</span>
                    </div>
                      <span className="eat-modal-food-time label" style={{color:'rgba(0,0,0,0.60)',textAlign:'right'}}>{formatFoodTimeSmart(food.time)}</span>
                  </div>
                  <div className="eat-modal-nutrition-facts">
                    {food.nutrition.map((item, i) => (
                      <div className="eat-modal-nutrition-item" key={i} style={{borderRight: i === food.nutrition.length-1 ? 'none' : undefined}}>
                          <span className="eat-modal-nutrition-type label" style={{alignSelf:'stretch',color:'rgba(0,0,0,0.60)',textAlign:'center'}}>{item.type}</span>
                          <span className="eat-modal-nutrition-value h6" style={{alignSelf:'stretch',color:'#000',textAlign:'center'}}>{item.value}</span>
                      </div>
                    ))}
                    </div>
                  </div>
                ))
              )}
              {foodsLoading && foodsState.length > 0 && (
                <div className="eat-modal-loading-more">
                  <div className="eat-modal-loading-spinner"></div>
                  <span className="eat-modal-loading-text">Loading more...</span>
                </div>
              )}
            </div>
          </div>
          {/* group3: 横线和AI按钮 */}
          <div className="eat-modal-group3" style={{marginBottom:0}}>
            <div className="eat-modal-divider"></div>
            <div className="eat-modal-group3-1" style={{display:'flex',gap:8}}>
            <button className="eat-modal-ai-btn" onClick={handleDescribe}>
              <span className="eat-modal-ai-icon">
                <img src={icons.message} alt="describe" width="24" height="24" />
              </span>
                <span className="eat-modal-ai-text h5">Describe</span>
            </button>
            <button className="eat-modal-ai-btn" onClick={handleEnterValue}>
              <span className="eat-modal-ai-icon">
                <img src={icons.inputBox} alt="enter value" width="24" height="24" />
              </span>
                <span className="eat-modal-ai-text h5">Enter Value</span>
            </button>
            <button className="eat-modal-ai-btn" onClick={handleScanLabel}>
              <span className="eat-modal-ai-icon">
                <img src={icons.scan} alt="scan label" width="24" height="24" />
              </span>
                <span className="eat-modal-ai-text h5">Scan Label</span>
            </button>
            </div>
          </div>
        </div>
      </ModalWrapper>
      
      {/* 子模态框 */}
      {step === 'camera-permission' && (
        <CameraPermissionModal onClose={() => setStep('main')} onOk={handleCameraPermissionOk} />
      )}
      <EnterValueModal 
        open={open && step === 'enter-value'} 
        onClose={handleCloseEnterValue}
        onBack={handleBackEnterValue}
        onCloseModal={onClose}
        userId={userId}
        onDataChange={handleDataChange}
      />
      <DescribeModal 
        open={open && step === 'describe'} 
        onClose={handleCloseDescribe}
        onBack={handleBackDescribe}
        onCloseModal={onClose}
        onNext={handleDescribeNext}
      />
      <DescribeFoodModal 
        open={open && step === 'describe-food'} 
        onClose={handleCloseDescribeFood}
        onBack={handleBackDescribeFood}
        onCloseModal={onClose}
        aiData={aiData}
        userId={userId}
        onDataChange={handleDataChange}
      />
    </>
  );
} 