import React, { useState, useRef } from 'react';
import ModalWrapper from '../../components/ModalWrapper';
import InputField from '../../components/auth/InputField';
import Cropper from 'react-easy-crop';
import { supabase } from '../../supabaseClient';

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

export default function ProfileEditModal({ open, onClose, userInfo = {}, onSave }) {
  const [firstName, setFirstName] = useState(userInfo.name || '');
  const [lastName, setLastName] = useState(userInfo.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedUrl, setCroppedUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  React.useEffect(() => {
    setFirstName(userInfo.name || '');
    setLastName(userInfo.lastName || '');
    setAvatarUrl(null);
    setCroppedUrl(userInfo.avatarUrl || null); // 优先显示已有的头像
    setShowCropper(false);
  }, [userInfo, open]);

  const getAvatarText = () => {
    if (firstName && firstName[0]) {
      return firstName[0].toUpperCase();
    }
    if (userInfo?.email && userInfo.email[0]) {
      return userInfo.email[0].toUpperCase();
    }
    return 'U';
  };
  const avatarText = getAvatarText();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName) return;
    
    let finalAvatarUrl = croppedUrl;
    
    // 如果有裁剪的图片，上传到Supabase Storage
    if (croppedUrl && croppedAreaPixels && avatarUrl) {
      setUploading(true);
      try {
        const blob = await getCroppedImg(avatarUrl, croppedAreaPixels, zoom);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // 先删除用户原有的头像文件
        if (userInfo.avatarUrl) {
          try {
            // 从URL中提取文件名
            const urlParts = userInfo.avatarUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            if (fileName && fileName.startsWith('avatar_')) {
              const { error: deleteError } = await supabase.storage
                .from('avatars')
                .remove([fileName]);
              
              if (deleteError) {
                console.error('删除旧头像失败:', deleteError);
              } else {
                console.log('旧头像已删除:', fileName);
              }
            }
          } catch (error) {
            console.error('删除旧头像时出错:', error);
          }
        }
        
        const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('上传头像失败:', error);
        } else {
          // 获取公共URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
          
          // 将头像URL保存到user_metadata
          const { error: updateError } = await supabase.auth.updateUser({
            data: { avatarUrl: publicUrl }
          });
          
          if (updateError) {
            console.error('保存头像URL到用户信息失败:', updateError);
          }
        }
      } catch (error) {
        console.error('处理头像失败:', error);
      } finally {
        setUploading(false);
      }
    }
    
    if (onSave) onSave({ name: firstName, lastName, avatarUrl: finalAvatarUrl });
    onClose && onClose();
  };

  // 处理头像上传
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setShowCropper(true);
    }
  };

  // 裁剪完成后预览
  const onCropComplete = React.useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 确认裁剪
  const handleCropConfirm = async () => {
    if (avatarUrl && croppedAreaPixels) {
      try {
        // 使用croppedAreaPixels而不是crop，因为croppedAreaPixels包含实际的像素坐标
        const blob = await getCroppedImg(avatarUrl, croppedAreaPixels, zoom);
        const croppedImageUrl = URL.createObjectURL(blob);
        setCroppedUrl(croppedImageUrl);
      } catch (error) {
        console.error('裁剪图片失败:', error);
        // 如果裁剪失败，使用原图
        setCroppedUrl(avatarUrl);
      }
    } else {
      setCroppedUrl(avatarUrl);
    }
    setShowCropper(false);
  };

  // 重新选择图片
  const handleReSelect = () => {
    setAvatarUrl(null);
    setCroppedUrl(null);
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 删除头像
  const handleDeleteAvatar = async () => {
    if (!croppedUrl && !userInfo.avatarUrl) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // 删除Supabase Storage中的头像文件
      if (userInfo.avatarUrl) {
        try {
          const urlParts = userInfo.avatarUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          if (fileName && fileName.startsWith('avatar_')) {
            const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove([fileName]);
            
            if (deleteError) {
              console.error('删除头像文件失败:', deleteError);
            }
          }
        } catch (error) {
          console.error('删除头像文件时出错:', error);
        }
      }
      
      // 从user_metadata中删除avatarUrl
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatarUrl: null }
      });
      
      if (updateError) {
        console.error('删除头像URL失败:', updateError);
      } else {
        // 清除本地状态
        setCroppedUrl(null);
        setAvatarUrl(null);
        setShowCropper(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // 通知父组件更新
        if (onSave) onSave({ name: firstName, lastName, avatarUrl: null });
      }
    } catch (error) {
      console.error('删除头像失败:', error);
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{padding: 0, background: 'transparent'}}>
        <div style={{position: 'relative', marginBottom: 0}}>
          <div className="h1" style={{ marginBottom: 0, textAlign: 'left', padding: '24px 0 0 24px' }}>Edit Profile</div>
          <button type="button" onClick={onClose} style={{position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', cursor: 'pointer', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{fontSize: 32, color: '#222'}}>&times;</span>
          </button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0 16px 0'}}>
          <label style={{cursor: 'pointer', position: 'relative', display: 'inline-block'}}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display: 'none'}} onChange={handleAvatarChange} />
            <div style={{width: 120, height: 120, flexShrink: 0, aspectRatio: '1/1', borderRadius: '50%', background: '#905021', color: '#fff', fontSize: 56, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible'}}>
              {avatarUrl && showCropper ? (
                <div style={{width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', position: 'absolute', left: 0, top: 0, background: '#905021'}}>
                  <Cropper
                    image={avatarUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{containerStyle: {borderRadius: '50%'}}}
                  />
                </div>
              ) : croppedUrl ? (
                <img src={croppedUrl} alt="avatar" style={{
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '50%',
                  imageRendering: 'high-quality'
                }} />
              ) : (
                avatarText
              )}
              <div style={{
                position: 'absolute',
                right: -8,
                top: -8,
                display: 'flex',
                width: 24,
                height: 24,
                padding: 8,
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                aspectRatio: '1/1',
                borderRadius: 999,
                border: '1px solid #CDD3C4',
                background: '#FFF',
                zIndex: 10
              }}>
                {/* 20x20黑色相机图标 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="none" style={{width: 20, height: 20, flexShrink: 0, aspectRatio: '1/1'}}>
                  <g clipPath="url(#clip0_565_5686)">
                    <path d="M8.00052 10.1334C9.17873 10.1334 10.1339 9.17824 10.1339 8.00003C10.1339 6.82182 9.17873 5.8667 8.00052 5.8667C6.82231 5.8667 5.86719 6.82182 5.86719 8.00003C5.86719 9.17824 6.82231 10.1334 8.00052 10.1334Z" fill="black"/>
                    <path d="M6.00065 1.3335L4.78065 2.66683H2.66732C1.93398 2.66683 1.33398 3.26683 1.33398 4.00016V12.0002C1.33398 12.7335 1.93398 13.3335 2.66732 13.3335H13.334C14.0673 13.3335 14.6673 12.7335 14.6673 12.0002V4.00016C14.6673 3.26683 14.0673 2.66683 13.334 2.66683H11.2207L10.0007 1.3335H6.00065ZM8.00065 11.3335C6.16065 11.3335 4.66732 9.84016 4.66732 8.00016C4.66732 6.16016 6.16065 4.66683 8.00065 4.66683C9.84065 4.66683 11.334 6.16016 11.334 8.00016C11.334 9.84016 9.84065 11.3335 8.00065 11.3335Z" fill="black"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_565_5686">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </label>
          {avatarUrl && showCropper && (
            <div style={{marginTop: 12, display: 'flex', gap: 12}}>
              <button type="button" className="h5" style={{background: '#2A4E14', color: '#fff', border: 'none', borderRadius: 24, padding: '8px 24px', fontSize: 16, cursor: 'pointer'}} onClick={handleCropConfirm}>Crop</button>
              <button type="button" className="h5" style={{background: '#eee', color: '#222', border: 'none', borderRadius: 24, padding: '8px 24px', fontSize: 16, cursor: 'pointer'}} onClick={handleReSelect}>Reselect</button>
            </div>
          )}
          <div className="h5" style={{
            color: (croppedUrl || userInfo.avatarUrl) ? '#22221B' : '#bbb', 
            marginTop: 8, 
            marginBottom: 8,
            cursor: (croppedUrl || userInfo.avatarUrl) ? 'pointer' : 'default'
          }} onClick={handleDeleteAvatar}>
            Delete
          </div>
        </div>
        <div style={{padding: '0 24px', width: 360, maxWidth: '90vw', margin: '0 auto'}}>
          <InputField label=" First Name (Nickname)" value={firstName} onChange={setFirstName} required />
          <div style={{height: 24}}></div>
          <InputField label=" Last Name (Optional)" value={lastName} onChange={setLastName} />
        </div>
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <button type="submit" className="h5" disabled={uploading} style={{
            display: 'flex',
            width: 200,
            height: 80,
            padding: '13px 21px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            borderRadius: 36,
            background: uploading ? '#ccc' : '#2A4E14',
            color: '#fff',
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}>
            {uploading ? 'Uploading...' : 'Save'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}