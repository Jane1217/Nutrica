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

  const activeStream = streamRef?.current;
  if (activeStream?.getTracks().some(track => track.readyState === 'live')) {
    return activeStream;
  }
  
  try {
    // 依次尝试从高到低的约束：部分设备/浏览器不满足 1080p 或后置摄像头时
    // 会抛 OverconstrainedError，这时降级而不是直接失败。
    // Device-specific focus and zoom constraints are applied only after the
    // browser confirms support via getCapabilities().
    const constraintSets = [
      { video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: { facingMode } },
      { video: true }
    ];

    let stream = null;
    let lastError = null;
    for (const constraints of constraintSets) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (err) {
        lastError = err;
        // 权限被拒绝/不支持时降级没有意义
        if (!['OverconstrainedError', 'NotFoundError', 'ConstraintNotSatisfiedError'].includes(err?.name)) {
          throw err;
        }
      }
    }
    if (!stream) throw lastError;
    
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
    // 权限错误要交给调用方显示"没有摄像头权限"的提示
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      throw error;
    }
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
  // 尝试设置连续对焦
  if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
    track.applyConstraints({
      advanced: [{ focusMode: 'continuous' }]
    }).catch(() => {});
  }
  
  // 尝试设置自动对焦
  if (capabilities.focusMode && capabilities.focusMode.includes('auto')) {
    track.applyConstraints({
      advanced: [{ focusMode: 'auto' }]
    }).catch(() => {});
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
  // 立即设置状态为false
  setCameraActive?.(false);
  
  // video 上挂载的流可能和 streamRef 不是同一个，一并停止
  const attachedStream = videoRef?.current?.srcObject;
  if (attachedStream?.getTracks) {
    attachedStream.getTracks().forEach(track => track.stop());
  }

  // 立即清理video元素
  if (videoRef?.current) {
    videoRef.current.pause();
    videoRef.current.srcObject = null;
    videoRef.current.removeAttribute('src');
    videoRef.current.load();
  }
  
  // 停止所有媒体流
  if (streamRef?.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
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
  // Never request a new stream while cleaning up: doing so can trigger a second
  // permission prompt and leave the camera indicator active on mobile browsers.
  if (videoRef?.current) {
    videoRef.current.pause();
    videoRef.current.srcObject = null;
  }
  
  if (streamRef?.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }
  setCameraActive?.(false);
};

/**
 * 把屏幕上的取景框映射为视频帧里的像素区域。
 * 视频以 object-fit: cover 显示：按较大的缩放比铺满并居中裁剪。
 * 水平/垂直必须使用同一个缩放比，且要减去被裁掉的偏移量，
 * 否则截取区域会和屏幕上的取景框错位。
 * @param {{width: number, height: number}} video 视频原始分辨率
 * @param {{left: number, top: number, width: number, height: number}} videoRect <video> 元素在屏幕上的矩形
 * @param {{left: number, top: number, width: number, height: number}} frameRect 取景框在屏幕上的矩形
 * @returns {{x: number, y: number, width: number, height: number}|null} 视频像素坐标；视频未就绪时返回 null
 */
export const computeCoverCrop = (video, videoRect, frameRect) => {
  const vw = video.width;
  const vh = video.height;
  if (!vw || !vh || !videoRect.width || !videoRect.height) return null;

  const scale = Math.max(videoRect.width / vw, videoRect.height / vh);
  const offsetX = (videoRect.width - vw * scale) / 2;
  const offsetY = (videoRect.height - vh * scale) / 2;

  let x = (frameRect.left - videoRect.left - offsetX) / scale;
  let y = (frameRect.top - videoRect.top - offsetY) / scale;
  let width = frameRect.width / scale;
  let height = frameRect.height / scale;

  // 限制在视频范围内
  x = Math.max(0, Math.min(x, vw - 1));
  y = Math.max(0, Math.min(y, vh - 1));
  width = Math.max(1, Math.min(width, vw - x));
  height = Math.max(1, Math.min(height, vh - y));

  return { x, y, width, height };
};

/**
 * 截取视频帧
 * @param {HTMLVideoElement} video - 视频元素
 * @param {HTMLElement} frameElement - 截取框元素
 * @returns {HTMLCanvasElement} 截取的canvas元素
 */
export const captureVideoFrame = (video, frameElement) => {
  const crop = computeCoverCrop(
    { width: video.videoWidth, height: video.videoHeight },
    video.getBoundingClientRect(),
    frameElement.getBoundingClientRect()
  );
  if (!crop) {
    throw new Error('Video is not ready');
  }

  // 创建canvas只截取指定区域
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

  return canvas;
};

/**
 * 把截取的画面压缩成适合上传的 JPEG。
 * 原图可能是 1080p 的 0.95 质量 JPEG（几MB），既慢又可能超过服务端/Vercel 的请求体上限；
 * 标签文字在最长边 1600px、质量 0.9 时仍然清晰可读。
 * @param {HTMLCanvasElement} canvas
 * @param {{ maxDimension?: number, quality?: number }} [options]
 * @returns {Promise<Blob|null>}
 */
export const canvasToJpegBlob = (canvas, { maxDimension = 1600, quality = 0.9 } = {}) => {
  let target = canvas;
  const longest = Math.max(canvas.width, canvas.height);
  if (longest > maxDimension) {
    const ratio = maxDimension / longest;
    target = document.createElement('canvas');
    target.width = Math.max(1, Math.round(canvas.width * ratio));
    target.height = Math.max(1, Math.round(canvas.height * ratio));
    const ctx = target.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, target.width, target.height);
  }
  return new Promise(resolve => target.toBlob(resolve, 'image/jpeg', quality));
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
          }).catch(() => {});
        }
      }, 1000);
    } catch {
      // Focusing is an optional capability; leave the camera usable if unsupported.
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
    } catch {
      // Zoom is an optional capability; leave the camera usable if unsupported.
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
  let retryInterval = null;
  if (!bound) {
    // 摄像头还没准备好时延迟重试：有次数上限，并且清理函数一定会清除它。
    // 之前没有清除，桌面摄像头（没有对焦/缩放能力）离开页面后会永远每500ms轮询。
    let attempts = 0;
    retryInterval = setInterval(() => {
      attempts += 1;
      bound = bindEvents();
      if (bound || attempts >= 20) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
    }, 500);
  }

  // 返回清理函数
  return () => {
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
    if (video) {
      video.removeEventListener('touchstart', onTouchStart);
      video.removeEventListener('touchmove', onTouchMove);
      video.removeEventListener('touchend', onTouchEnd);
      video.removeEventListener('click', onClick);
    }
  };
};
