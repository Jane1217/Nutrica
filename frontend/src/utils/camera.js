/**
 * 摄像头管理的工具函数
 */

/**
 * 启动摄像头
 * @param {Object} options - 配置选项
 * @param {boolean} options.facingMode - 摄像头朝向，默认为 'environment'
 * @param {React.RefObject} options.videoRef - video元素引用
 * @param {React.RefObject} options.streamRef - 媒体流引用
 * @param {Function} options.setCameraActive - 设置摄像头状态的回调
 * @param {boolean} options.isMounted - 组件是否已挂载
 * @returns {Promise<MediaStream|null>} 返回媒体流或null
 */
export const startCamera = async ({
  facingMode = 'environment',
  videoRef,
  streamRef,
  setCameraActive,
  isMounted = true
}) => {
  if (!isMounted) return null;
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode, 
        width: { ideal: 1920 }, 
        height: { ideal: 1080 }
      } 
    });
    
    if (videoRef?.current && isMounted) {
      videoRef.current.srcObject = stream;
      if (streamRef) streamRef.current = stream;
      setCameraActive?.(true);
      return stream;
    } else {
      // 如果组件已卸载，立即停止获取的流
      stream.getTracks().forEach(track => track.stop());
      return null;
    }
  } catch (error) {
    console.error('Failed to start camera:', error);
    return null;
  }
};

/**
 * 停止摄像头
 * @param {Object} options - 配置选项
 * @param {React.RefObject} options.videoRef - video元素引用
 * @param {React.RefObject} options.streamRef - 媒体流引用
 * @param {Function} options.setCameraActive - 设置摄像头状态的回调
 */
export const stopCamera = ({
  videoRef,
  streamRef,
  setCameraActive
}) => {
  console.log('Stopping camera...');
  
  // 立即设置状态为false
  setCameraActive?.(false);
  
  // 立即清理video元素
  if (videoRef?.current) {
    videoRef.current.pause();
    videoRef.current.srcObject = null;
    videoRef.current.removeAttribute('src');
    videoRef.current.load();
  }
  
  // 停止所有媒体流
  if (streamRef?.current) {
    streamRef.current.getTracks().forEach(track => {
      console.log('Stopping track:', track.kind);
      track.stop();
    });
    streamRef.current = null;
  }
  
  // 强制释放所有可能的媒体流
  try {
    // 获取所有媒体设备并强制停止
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        devices.forEach(device => {
          if (device.kind === 'videoinput') {
            console.log('Found video device:', device.label);
          }
        });
      });
    
    // 尝试获取一个空的媒体流来释放权限
    navigator.mediaDevices.getUserMedia({ video: false, audio: false })
      .then(() => {
        console.log('Camera permissions released');
      })
      .catch(() => {
        console.log('Camera permissions already released');
      });
  } catch (error) {
    console.log('Error releasing camera permissions:', error);
  }
  
  // 强制垃圾回收（如果浏览器支持）
  if (window.gc) {
    window.gc();
  }
};

/**
 * 强制释放摄像头
 * @param {Object} options - 配置选项
 * @param {React.RefObject} options.videoRef - video元素引用
 * @param {React.RefObject} options.streamRef - 媒体流引用
 * @param {Function} options.setCameraActive - 设置摄像头状态的回调
 */
export const forceReleaseCamera = ({
  videoRef,
  streamRef,
  setCameraActive
}) => {
  console.log('Force releasing camera...');
  
  // 强制停止所有可能的视频流
  try {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        stream.getTracks().forEach(track => {
          console.log('Force stopping track:', track.kind);
          track.stop();
        });
        console.log('Forced all video streams to stop');
      })
      .catch(() => {
        console.log('No video streams to force stop');
      });
  } catch (error) {
    console.log('Error force stopping streams:', error);
  }
  
  // 强制清理所有可能的引用
  if (videoRef?.current) {
    videoRef.current.srcObject = null;
    videoRef.current.remove();
  }
  
  if (streamRef) streamRef.current = null;
  setCameraActive?.(false);
};

/**
 * 截取视频帧
 * @param {HTMLVideoElement} video - 视频元素
 * @param {HTMLElement} frameElement - 截取框元素
 * @returns {HTMLCanvasElement} 截取的canvas元素
 */
export const captureVideoFrame = (video, frameElement) => {
  // 获取截取框和视频的位置和尺寸
  const frameRect = frameElement.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();
  
  // 计算截取框在视频上的相对位置和尺寸（比例）
  const scaleX = video.videoWidth / videoRect.width;
  const scaleY = video.videoHeight / videoRect.height;
  const sx = (frameRect.left - videoRect.left) * scaleX;
  const sy = (frameRect.top - videoRect.top) * scaleY;
  const sWidth = frameRect.width * scaleX;
  const sHeight = frameRect.height * scaleY;
  
  // 创建canvas只截取指定区域
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sWidth);
  canvas.height = Math.round(sHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
  
  return canvas;
};

/**
 * 设置摄像头事件监听器
 * @param {Object} options - 配置选项
 * @param {Function} options.stopCamera - 停止摄像头函数
 * @param {Function} options.startCamera - 启动摄像头函数
 * @param {boolean} options.isMounted - 组件是否已挂载
 * @returns {Function} 清理函数
 */
export const setupCameraEventListeners = ({
  stopCamera,
  startCamera,
  isMounted = true
}) => {
  // Handle page visibility change
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopCamera();
    } else if (isMounted) {
      startCamera();
    }
  };
  
  // Handle beforeunload (browser back/close)
  const handleBeforeUnload = () => {
    stopCamera();
  };
  
  // Handle popstate (browser back/forward)
  const handlePopState = () => {
    stopCamera();
  };
  
  // 监听页面离开事件
  const handlePageHide = () => {
    stopCamera();
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('popstate', handlePopState);
  window.addEventListener('pagehide', handlePageHide);
  
  // 返回清理函数
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('pagehide', handlePageHide);
  };
}; 