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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18.3332 2.36119V5.83341C18.3332 6.01759 18.26 6.19423 18.1298 6.32446C17.9995 6.45469 17.8229 6.52786 17.6387 6.52786C17.4545 6.52786 17.2779 6.45469 17.1477 6.32446C17.0174 6.19423 16.9443 6.01759 16.9443 5.83341V3.05564H14.1665C13.9823 3.05564 13.8057 2.98247 13.6755 2.85224C13.5452 2.72201 13.4721 2.54537 13.4721 2.36119C13.4721 2.17701 13.5452 2.00038 13.6755 1.87015C13.8057 1.73991 13.9823 1.66675 14.1665 1.66675H17.6387C17.8229 1.66675 17.9995 1.73991 18.1298 1.87015C18.26 2.00038 18.3332 2.17701 18.3332 2.36119ZM5.83317 16.9445H3.05539V14.1667C3.05539 13.9826 2.98223 13.8059 2.85199 13.6757C2.72176 13.5455 2.54513 13.4723 2.36095 13.4723C2.17677 13.4723 2.00014 13.5455 1.8699 13.6757C1.73967 13.8059 1.6665 13.9826 1.6665 14.1667V17.639C1.6665 17.8231 1.73967 17.9998 1.8699 18.13C2.00014 18.2603 2.17677 18.3334 2.36095 18.3334H5.83317C6.01735 18.3334 6.19398 18.2603 6.32422 18.13C6.45445 17.9998 6.52761 17.8231 6.52761 17.639C6.52761 17.4548 6.45445 17.2782 6.32422 17.1479C6.19398 17.0177 6.01735 16.9445 5.83317 16.9445ZM17.6387 13.4723C17.4545 13.4723 17.2779 13.5455 17.1477 13.6757C17.0174 13.8059 16.9443 13.9826 16.9443 14.1667V16.9445H14.1665C13.9823 16.9445 13.8057 17.0177 13.6755 17.1479C13.5452 17.2782 13.4721 17.4548 13.4721 17.639C13.4721 17.8231 13.5452 17.9998 13.6755 18.13C13.8057 18.2603 13.9823 18.3334 14.1665 18.3334H17.6387C17.8229 18.3334 17.9995 18.2603 18.1298 18.13C18.26 17.9998 18.3332 17.8231 18.3332 17.639V14.1667C18.3332 13.9826 18.26 13.8059 18.1298 13.6757C17.9995 13.5455 17.8229 13.4723 17.6387 13.4723ZM2.36095 6.52786C2.54513 6.52786 2.72176 6.45469 2.85199 6.32446C2.98223 6.19423 3.05539 6.01759 3.05539 5.83341V3.05564H5.83317C6.01735 3.05564 6.19398 2.98247 6.32422 2.85224C6.45445 2.72201 6.52761 2.54537 6.52761 2.36119C6.52761 2.17701 6.45445 2.00038 6.32422 1.87015C6.19398 1.73991 6.01735 1.66675 5.83317 1.66675H2.36095C2.17677 1.66675 2.00014 1.73991 1.8699 1.87015C1.73967 2.00038 1.6665 2.17701 1.6665 2.36119V5.83341C1.6665 6.01759 1.73967 6.19423 1.8699 6.32446C2.00014 6.45469 2.17677 6.52786 2.36095 6.52786ZM5.13873 5.83341V14.1667C5.13873 14.3509 5.21189 14.5276 5.34212 14.6578C5.47236 14.788 5.64899 14.8612 5.83317 14.8612H14.1665C14.3507 14.8612 14.5273 14.788 14.6575 14.6578C14.7878 14.5276 14.8609 14.3509 14.8609 14.1667V5.83341C14.8609 5.64924 14.7878 5.4726 14.6575 5.34237C14.5273 5.21213 14.3507 5.13897 14.1665 5.13897H5.83317C5.64899 5.13897 5.47236 5.21213 5.34212 5.34237C5.21189 5.4726 5.13873 5.64924 5.13873 5.83341Z" fill="white"/>
              </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.9996 14.122L17.3026 19.425C17.584 19.7064 17.9657 19.8645 18.3636 19.8645C18.7616 19.8645 19.1432 19.7064 19.4246 19.425C19.706 19.1436 19.8641 18.7619 19.8641 18.364C19.8641 17.966 19.706 17.5844 19.4246 17.303L14.1196 12L19.4236 6.69699C19.5629 6.55766 19.6733 6.39226 19.7487 6.21024C19.824 6.02821 19.8628 5.83313 19.8627 5.63613C19.8627 5.43914 19.8238 5.24407 19.7484 5.06209C19.673 4.8801 19.5624 4.71475 19.4231 4.57549C19.2838 4.43622 19.1184 4.32576 18.9364 4.25042C18.7543 4.17507 18.5592 4.13631 18.3623 4.13636C18.1653 4.13641 17.9702 4.17526 17.7882 4.25069C17.6062 4.32612 17.4409 4.43666 17.3016 4.57599L11.9996 9.87899L6.6966 4.57599C6.5583 4.43266 6.39284 4.31831 6.20987 4.23961C6.0269 4.16091 5.83009 4.11944 5.63092 4.11762C5.43176 4.11579 5.23422 4.15365 5.04984 4.22899C4.86546 4.30432 4.69793 4.41562 4.55703 4.55639C4.41612 4.69717 4.30466 4.86459 4.22916 5.0489C4.15365 5.23321 4.1156 5.43071 4.11724 5.62988C4.11887 5.82905 4.16016 6.02589 4.23869 6.20894C4.31721 6.39198 4.43141 6.55755 4.5746 6.69599L9.8796 12L4.5756 17.304C4.43241 17.4424 4.31821 17.608 4.23969 17.791C4.16116 17.9741 4.11987 18.1709 4.11824 18.3701C4.1166 18.5693 4.15465 18.7668 4.23016 18.9511C4.30566 19.1354 4.41712 19.3028 4.55803 19.4436C4.69893 19.5844 4.86646 19.6957 5.05084 19.771C5.23522 19.8463 5.43276 19.8842 5.63192 19.8824C5.83109 19.8805 6.0279 19.8391 6.21087 19.7604C6.39384 19.6817 6.5593 19.5673 6.6976 19.424L11.9996 14.122Z" fill="white"/>
          </svg>
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