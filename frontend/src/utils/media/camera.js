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
    // 更完整的摄像头配置
    const constraints = {
      video: {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        // 添加对焦配置
        focusMode: { ideal: 'continuous' }, // 优先使用连续对焦
        // 添加曝光配置
        exposureMode: { ideal: 'continuous' },
        // 添加白平衡配置
        whiteBalanceMode: { ideal: 'continuous' },
        // 添加缩放配置
        zoom: { ideal: 1.0 },
        // 添加高级配置
        advanced: [
          // 尝试启用连续对焦
          { focusMode: 'continuous' },
          // 尝试启用自动曝光
          { exposureMode: 'continuous' },
          // 尝试启用自动白平衡
          { whiteBalanceMode: 'continuous' },
          // 尝试启用自动对焦
          { focusMode: 'auto' },
          // 尝试启用单次对焦
          { focusMode: 'single-shot' }
        ]
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (videoRef?.current && isMounted) {
      videoRef.current.srcObject = stream;
      if (streamRef) streamRef.current = stream;
      setCameraActive?.(true);
      
      // 等待视频加载完成后设置摄像头参数
      videoRef.current.onloadedmetadata = () => {
        if (isMounted && videoRef.current) {
          setupCameraCapabilities(stream);
        }
      };
      
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
 * 设置摄像头功能
 * @param {MediaStream} stream - 媒体流
 */
const setupCameraCapabilities = (stream) => {
  const track = stream.getVideoTracks()[0];
  if (!track || !track.getCapabilities) return;

  const capabilities = track.getCapabilities();
  const settings = track.getSettings();
  
  console.log('Camera capabilities:', capabilities);
  console.log('Camera settings:', settings);

  // 尝试设置连续对焦
  if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
    track.applyConstraints({
      advanced: [{ focusMode: 'continuous' }]
    }).catch(err => console.log('Failed to set continuous focus:', err));
  }
  
  // 尝试设置自动对焦
  if (capabilities.focusMode && capabilities.focusMode.includes('auto')) {
    track.applyConstraints({
      advanced: [{ focusMode: 'auto' }]
    }).catch(err => console.log('Failed to set auto focus:', err));
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

/**
 * 点击对焦
 * @param {MediaStream} stream - 媒体流
 * @param {number} x - 点击的x坐标（0-1之间的比例）
 * @param {number} y - 点击的y坐标（0-1之间的比例）
 */
export const focusAtPoint = async (stream, x, y) => {
  const track = stream.getVideoTracks()[0];
  if (!track || !track.getCapabilities) return;

  const capabilities = track.getCapabilities();
  
  // 检查是否支持点对焦
  if (capabilities.focusDistance && capabilities.focusDistance.max > 0) {
    try {
      await track.applyConstraints({
        advanced: [
          { focusMode: 'manual' },
          { focusDistance: capabilities.focusDistance.min }
        ]
      });
      
      // 延迟后恢复自动对焦
      setTimeout(() => {
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          track.applyConstraints({
            advanced: [{ focusMode: 'continuous' }]
          }).catch(err => console.log('Failed to restore continuous focus:', err));
        }
      }, 1000);
    } catch (err) {
      console.log('Failed to focus at point:', err);
    }
  }
};

/**
 * 设置摄像头缩放
 * @param {MediaStream} stream - 媒体流
 * @param {number} zoom - 缩放值
 */
export const setCameraZoom = async (stream, zoom) => {
  const track = stream.getVideoTracks()[0];
  if (!track || !track.getCapabilities) return;

  const capabilities = track.getCapabilities();
  
  if (capabilities.zoom) {
    const clampedZoom = Math.max(capabilities.zoom.min, Math.min(capabilities.zoom.max, zoom));
    try {
      await track.applyConstraints({
        advanced: [{ zoom: clampedZoom }]
      });
    } catch (err) {
      console.log('Failed to set zoom:', err);
    }
  }
};

/**
 * 获取摄像头缩放范围
 * @param {MediaStream} stream - 媒体流
 * @returns {Object|null} 缩放范围信息
 */
export const getCameraZoomRange = (stream) => {
  const track = stream.getVideoTracks()[0];
  if (!track || !track.getCapabilities) return null;

  const capabilities = track.getCapabilities();
  
  if (capabilities.zoom) {
    return {
      min: capabilities.zoom.min,
      max: capabilities.zoom.max,
      step: capabilities.zoom.step || 0.1
    };
  }
  
  return null;
};

/**
 * 获取当前摄像头设置
 * @param {MediaStream} stream - 媒体流
 * @returns {Object|null} 当前设置
 */
export const getCameraSettings = (stream) => {
  const track = stream.getVideoTracks()[0];
  if (!track || !track.getSettings) return null;

  return track.getSettings();
};

/**
 * 设置摄像头事件监听器（增强版）
 * @param {Object} options - 配置选项
 * @param {React.RefObject} options.videoRef - video元素引用
 * @param {React.RefObject} options.streamRef - 媒体流引用
 * @param {Function} options.onFocus - 对焦回调
 * @param {Function} options.onZoom - 缩放回调
 * @returns {Function} 清理函数
 */
export const setupEnhancedCameraControls = ({
  videoRef,
  streamRef,
  onFocus,
  onZoom
}) => {
  const video = videoRef?.current;
  if (!video) return () => {};

  let lastDistance = null;
  let zooming = false;
  let currentZoom = 1;
  let zoomRange = null;

  const setupZoom = () => {
    if (!streamRef?.current) return;
    zoomRange = getCameraZoomRange(streamRef.current);
    if (zoomRange) {
      const settings = getCameraSettings(streamRef.current);
      currentZoom = settings?.zoom || 1;
    }
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      zooming = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDistance = Math.sqrt(dx * dx + dy * dy);
      setupZoom();
    }
  };

  const onTouchMove = (e) => {
    if (zooming && e.touches.length === 2 && streamRef?.current && zoomRange) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      const delta = (newDistance - lastDistance) / 200; // 降低缩放灵敏度
      const newZoom = Math.max(zoomRange.min, Math.min(zoomRange.max, currentZoom + delta));
      
      setCameraZoom(streamRef.current, newZoom);
      currentZoom = newZoom;
      onZoom?.(newZoom);
    }
  };

  const onTouchEnd = () => {
    zooming = false;
    lastDistance = null;
  };

  const onClick = async (e) => {
    if (!streamRef?.current) return;
    
    // 计算点击位置（相对于视频元素的比例）
    const rect = video.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // 执行对焦
    await focusAtPoint(streamRef.current, x, y);
    onFocus?.({ x, y });
  };

  // 延迟绑定事件，确保摄像头已启动
  const bindEvents = () => {
    if (video && streamRef?.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities();
        if (capabilities.zoom || (capabilities.focusMode && capabilities.focusMode.length > 0)) {
          video.addEventListener('touchstart', onTouchStart, { passive: false });
          video.addEventListener('touchmove', onTouchMove, { passive: false });
          video.addEventListener('touchend', onTouchEnd, { passive: false });
          video.addEventListener('click', onClick);
          return true;
        }
      }
    }
    return false;
  };

  // 尝试绑定事件
  let bound = bindEvents();
  if (!bound) {
    // 如果摄像头还没准备好，延迟重试
    const retryInterval = setInterval(() => {
      bound = bindEvents();
      if (bound) {
        clearInterval(retryInterval);
      }
    }, 500);
  }

  // 返回清理函数
  return () => {
    if (video) {
      video.removeEventListener('touchstart', onTouchStart);
      video.removeEventListener('touchmove', onTouchMove);
      video.removeEventListener('touchend', onTouchEnd);
      video.removeEventListener('click', onClick);
    }
  };
}; 