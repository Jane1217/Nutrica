import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodModal from '../../modals/FoodModal';
import { foodApi, handleApiError } from '../../../../utils/api';
import { 
  startCamera, 
  stopCamera, 
  forceReleaseCamera, 
  captureVideoFrame,
  setupCameraEventListeners 
} from '../../../../utils/camera';
import './ScanLabelPage.css';
import CameraPermissionModal from '../../modals/CameraPermissionModal';
import { icons } from '../../../../utils';

// 组件外部，避免多次挂载重复判断
const CAMERA_PERMISSION_KEY = 'nutrica_camera_permission_shown';
const isCameraPermissionShown = () => !!localStorage.getItem(CAMERA_PERMISSION_KEY);
const setCameraPermissionShown = () => localStorage.setItem(CAMERA_PERMISSION_KEY, '1');

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
  const [showPermission, setShowPermission] = useState(!isCameraPermissionShown());
  const [cameraFeatureTip, setCameraFeatureTip] = useState('');

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
    
    // 只在首次进入时弹窗
    if (!isCameraPermissionShown()) {
      setShowPermission(true);
      setCameraPermissionShown();
    } else {
      setShowPermission(false);
    }

    // 检查摄像头能力
    setTimeout(() => {
      const video = videoRef.current;
      if (video && video.srcObject) {
        const track = video.srcObject.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities();
          const supportZoom = !!caps.zoom;
          const supportFocus = !!caps.focusMode && caps.focusMode.includes('single-shot');
          if (!supportZoom && !supportFocus) {
            setCameraFeatureTip('Camera zoom and focus are not supported on this device/browser.');
          } else if (!supportZoom) {
            setCameraFeatureTip('Camera zoom is not supported on this device/browser.');
          } else if (!supportFocus) {
            setCameraFeatureTip('Camera focus is not supported on this device/browser.');
          } else {
            setCameraFeatureTip('');
          }
        } else {
          setCameraFeatureTip('Camera zoom and focus are not supported on this device/browser.');
        }
      }
    }, 1200);

    // 监听手势缩放和点击对焦（仅支持的设备才启用）
    const video = videoRef.current;
    let lastDistance = null;
    let zooming = false;
    let track = null;
    let maxZoom = 1;
    let minZoom = 1;
    let currentZoom = 1;
    const setupZoom = () => {
      if (!video || !video.srcObject) return;
      track = video.srcObject.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const caps = track.getCapabilities();
        if (caps.zoom) {
          maxZoom = caps.zoom.max;
          minZoom = caps.zoom.min;
          currentZoom = track.getSettings().zoom || 1;
        }
      }
    };
    const onTouchStart = e => {
      if (e.touches.length === 2) {
        zooming = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDistance = Math.sqrt(dx * dx + dy * dy);
        setupZoom();
      }
    };
    const onTouchMove = e => {
      if (zooming && e.touches.length === 2 && track && track.applyConstraints) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        let delta = (newDistance - lastDistance) / 100; // 缩放灵敏度
        let newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
        track.applyConstraints({ advanced: [{ zoom: newZoom }] });
      }
    };
    const onTouchEnd = e => {
      zooming = false;
      lastDistance = null;
    };
    const onClick = async e => {
      // 点击对焦
      if (!video || !video.srcObject) return;
      const track = video.srcObject.getVideoTracks()[0];
      if (track && track.getCapabilities && track.applyConstraints) {
        const caps = track.getCapabilities();
        if (caps.focusMode && caps.focusMode.includes('single-shot')) {
          try {
            await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
          } catch (err) {
            // 忽略不支持
          }
        }
      }
    };
    // 仅支持的设备才绑定事件
    setTimeout(() => {
      if (video && video.srcObject) {
        const track = video.srcObject.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities();
          if (caps.zoom || (caps.focusMode && caps.focusMode.includes('single-shot'))) {
            video.addEventListener('touchstart', onTouchStart, { passive: false });
            video.addEventListener('touchmove', onTouchMove, { passive: false });
            video.addEventListener('touchend', onTouchEnd, { passive: false });
            video.addEventListener('click', onClick);
          }
        }
      }
    }, 1500);
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
      if (video) {
        video.removeEventListener('touchstart', onTouchStart);
        video.removeEventListener('touchmove', onTouchMove);
        video.removeEventListener('touchend', onTouchEnd);
        video.removeEventListener('click', onClick);
      }
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
      {/* 只在首次弹出权限弹窗，复用CameraPermissionModal */}
      {showPermission && (
        <CameraPermissionModal 
          onClose={() => setShowPermission(false)} 
          onOk={() => setShowPermission(false)} 
        />
      )}
      {cameraFeatureTip && (
        <div style={{position:'absolute',top:0,left:0,right:0,zIndex:9999,background:'rgba(0,0,0,0.7)',color:'#fff',textAlign:'center',padding:8,fontSize:14}}>{cameraFeatureTip}</div>
      )}
      <video ref={videoRef} className="scan-video" autoPlay playsInline muted></video>
      <div className="scan-overlay"></div>
      <div className="scan-center">
        <div className="scan-tip">
          <div className="scan-tip-heading">
            <span className="scan-tip-icon">
              <img src={icons.scanFrame} alt="scan" width="20" height="20" />
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
          <img src={icons.closeFill} alt="close" width="24" height="24" />
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