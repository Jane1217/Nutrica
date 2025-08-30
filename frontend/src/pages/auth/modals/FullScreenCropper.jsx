import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// 将裁剪区域转换为blob
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, crop, zoom) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 设置输出尺寸为240x240（提高清晰度）
  const outputSize = 240;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // 启用图像平滑
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 计算裁剪区域
  const cropX = crop.x;
  const cropY = crop.y;
  const cropWidth = crop.width;
  const cropHeight = crop.height;

  // 绘制裁剪后的图片
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

export default function FullScreenCropper({ imageUrl, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // 裁剪完成后预览
  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 确认裁剪
  const handleCropConfirm = async () => {
    if (imageUrl && croppedAreaPixels) {
      try {
        const blob = await getCroppedImg(imageUrl, croppedAreaPixels, zoom);
        const croppedImageUrl = URL.createObjectURL(blob);
        onCropComplete(croppedImageUrl, blob);
      } catch (error) {
        console.error('Failed to crop image:', error);
        // 如果裁剪失败，使用原图
        onCropComplete(imageUrl, null);
      }
    } else {
      onCropComplete(imageUrl, null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部操作栏 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)'
      }}>
        <button
          onClick={onCancel}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        </button>
        

        
        <button
          onClick={handleCropConfirm}
          style={{
            background: '#2A4E14',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Done
        </button>
      </div>

      {/* 裁剪区域 */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={true}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteCallback}
          style={{
            containerStyle: {
              width: '100%',
              height: '100%',
              backgroundColor: '#000'
            },
            cropAreaStyle: {
              border: '2px solid #fff',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }
          }}
        />
      </div>

      {/* 底部提示 */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: '14px',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.5)',
        padding: '8px 16px',
        borderRadius: '20px'
      }}>
        Pinch to zoom • Drag to move
      </div>
    </div>
  );
} 