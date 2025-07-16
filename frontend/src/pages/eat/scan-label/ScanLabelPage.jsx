import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodModal from '../modals/FoodModal';
import { foodApi, handleApiError } from '../../../utils/api';
import { 
  startCamera, 
  stopCamera, 
  forceReleaseCamera, 
  captureVideoFrame,
  setupCameraEventListeners 
} from '../../../utils/camera';
import './ScanLabelPage.css';

export default function ScanLabelPage({ onClose, userId }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);
  const isMountedRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [foodResult, setFoodResult] = useState(null);
  const navigate = useNavigate();

  // 摄像头管理函数
  const handleStartCamera = () => {
    return startCamera({
      videoRef,
      streamRef,
      setCameraActive,
      isMounted: isMountedRef.current
    });
  };

  const handleStopCamera = () => {
    stopCamera({
      videoRef,
      streamRef,
      setCameraActive
    });
  };

  const handleForceReleaseCamera = () => {
    forceReleaseCamera({
      videoRef,
      streamRef,
      setCameraActive
    });
  };

  // 拍照并只截取 scan-frame 区域
  const handleCapture = async () => {
    if (!videoRef.current || !cameraActive) return;
    
    setLoading(true);
    const video = videoRef.current;
    
    // 使用工具函数截取视频帧
    const canvas = captureVideoFrame(video, scanFrameRef.current);
    
    // 停止摄像头
    handleStopCamera();
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setLoading(false);
        if (isMountedRef.current) {
          handleStartCamera(); // 拍照失败也重启摄像头
        }
        return;
      }
      
      try {
        const data = await foodApi.parseFoodImage(blob);
        if (data.success) {
          // 识别成功，弹出 FoodModal
          const foodName = data.data.name;
          setFoodResult({
            'Food name': foodName,
            'Number of Servings': 1, // 默认 1
            Calories: data.data.nutrition.calories,
            Carbs: data.data.nutrition.carbs,
            Fats: data.data.nutrition.fats,
            Protein: data.data.nutrition.protein,
            emoji: data.data.emoji || '🍽️'
          });
          setFoodModalOpen(true);
        } else {
          alert('Image parsing failed: ' + data.error);
          if (isMountedRef.current) {
            handleStartCamera();
          }
        }
      } catch (error) {
        alert('Image parsing failed: ' + handleApiError(error, 'Image parsing failed'));
        if (isMountedRef.current) {
          handleStartCamera();
        }
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.95);
  };

  // 关闭 FoodModal 时重启摄像头
  const handleFoodModalClose = () => {
    setFoodModalOpen(false);
    setFoodResult(null);
  };

  // 组件挂载时启动摄像头
  useEffect(() => {
    handleStartCamera();
    
    // 设置事件监听器
    const cleanupListeners = setupCameraEventListeners({
      stopCamera: handleStopCamera,
      startCamera: handleStartCamera,
      isMounted: isMountedRef.current
    });
    
    // 监听路由变化
    const unlisten = navigate(handleStopCamera);
    
    // 清理函数
    return () => {
      console.log('Component unmounting, cleaning up camera...');
      isMountedRef.current = false;
      
      // 清理事件监听器
      cleanupListeners();
      if (unlisten) unlisten();
      
      // 停止摄像头
      handleStopCamera();
      handleForceReleaseCamera();
      
      console.log('Camera cleanup completed');
    };
  }, [navigate]);

  // 监听foodModalOpen变化，弹窗打开时关闭摄像头，关闭时重启摄像头
  useEffect(() => {
    if (foodModalOpen) {
      handleStopCamera();
    } else if (isMountedRef.current) {
      handleStartCamera();
    }
  }, [foodModalOpen]);

  return (
    <div className="scan-label-page">
      <video ref={videoRef} className="scan-video" autoPlay playsInline muted></video>
      <div className="scan-overlay"></div>
      <div className="scan-center">
        <div className="scan-tip">
          <div className="scan-tip-heading">
            <span className="scan-tip-icon">
              <img src="/assets/Frame 79.svg" alt="scan" width="20" height="20" />
            </span>
            <span className="scan-tip-text h6">Place the food label inside the frame</span>
          </div>
        </div>
        <div className="scan-frame" ref={scanFrameRef}></div>
      </div>
      <button className="scan-close-btn" onClick={() => {
        console.log('Close button clicked, stopping camera and navigating...');
        handleStopCamera();
        handleForceReleaseCamera();
        navigate('/?eat=1');
      }}>
        <span className="close-fill">
          <img src="/assets/mingcute_close-fill.svg" alt="close" width="24" height="24" />
        </span>
      </button>
      <button className="scan-shutter" onClick={handleCapture} disabled={loading}>
        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
          <rect x="2" y="2" width="92" height="92" rx="46" stroke="white" strokeWidth="4"/>
          <circle cx="36" cy="36" r="36" transform="matrix(1 0 0 -1 12 84)" fill="white"/>
        </svg>
      </button>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3000,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 24
        }}>
          Analyzing...
        </div>
      )}
      <FoodModal
        open={foodModalOpen}
        onClose={handleFoodModalClose}
        initialData={foodResult}
        userId={userId}
      />
    </div>
  );
} 