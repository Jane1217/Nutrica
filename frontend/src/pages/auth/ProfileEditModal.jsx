import React, { useState, useRef } from 'react';
import ModalWrapper from '../../components/ModalWrapper';
import InputField from '../../components/auth/InputField';
import Cropper from 'react-easy-crop';
import { supabase } from '../../supabaseClient';

function getCroppedImg(imageSrc, croppedAreaPixels) {
  // 返回Promise<Blob>，用于上传
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    };
  });
}

export default function ProfileEditModal({ open, onClose, userInfo = {}, onSave }) {
  const [firstName, setFirstName] = useState(userInfo.name || '');
  const [lastName, setLastName] = useState(userInfo.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState(userInfo.avatarUrl || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [localImage, setLocalImage] = useState(null); // 本地预览用
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    setFirstName(userInfo.name || '');
    setLastName(userInfo.lastName || '');
    setAvatarUrl(userInfo.avatarUrl || null);
    setLocalImage(null);
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
    if (onSave) onSave({ name: firstName, lastName, avatarUrl });
    onClose && onClose();
  };

  // 处理头像上传
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalImage(url); // 只用于裁剪预览
      setShowCropper(true);
    }
  };

  // 裁剪完成后预览
  const onCropComplete = React.useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 确认裁剪并上传
  const handleCropConfirm = async () => {
    if (!localImage || !croppedAreaPixels) return;
    setUploading(true);

    // 调试输出
    console.log('bucket:', 'avatars');
    const { data: userData } = await supabase.auth.getUser();
    console.log('user:', userData);
    console.log('is authenticated:', !!userData?.user);

    const blob = await getCroppedImg(localImage, croppedAreaPixels);
    const fileName = `avatar_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
    console.log('upload result:', data, error);
    if (error) {
      alert('上传失败: ' + error.message);
      setUploading(false);
      return;
    }
    // 获取公开URL
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const url = publicUrlData.publicUrl;
    setAvatarUrl(url);
    setLocalImage(null);
    setShowCropper(false);
    setUploading(false);
    // 写入user_metadata
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({ data: { ...user.user_metadata, avatarUrl: url } });
      if (typeof onAvatarUpdated === 'function') onAvatarUpdated();
    }
  };

  // 重新选择图片时允许覆盖原有头像
  const handleReSelect = () => {
    setLocalImage(null);
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // 不再setAvatarUrl，avatarUrl只由上传成功后设置
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
              {showCropper && localImage ? (
                <div style={{width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', position: 'absolute', left: 0, top: 0, background: '#905021'}}>
                  <Cropper
                    image={localImage}
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
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
              ) : (
                avatarText
              )}
              <div style={{
                position: 'absolute',
                right: -12,
                top: -12,
                display: 'flex',
                width: 36,
                height: 36,
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
          {localImage && showCropper && (
            <div style={{marginTop: 12, display: 'flex', gap: 12}}>
              <button type="button" className="h5" style={{background: '#2A4E14', color: '#fff', border: 'none', borderRadius: 24, padding: '8px 24px', fontSize: 16, cursor: 'pointer'}} onClick={handleCropConfirm} disabled={uploading}>{uploading ? 'Uploading...' : 'Crop'}</button>
              <button type="button" className="h5" style={{background: '#eee', color: '#222', border: 'none', borderRadius: 24, padding: '8px 24px', fontSize: 16, cursor: 'pointer'}} onClick={handleReSelect} disabled={uploading}>Reselect</button>
            </div>
          )}
          <div style={{color: '#bbb', fontSize: 18, marginTop: 8, marginBottom: 8}}>Delete</div>
        </div>
        <div style={{padding: '0 24px', width: 360, maxWidth: '90vw', margin: '0 auto'}}>
          <InputField label="First Name" value={firstName} onChange={setFirstName} required />
          <InputField label="Last Name (Optional)" value={lastName} onChange={setLastName} />
        </div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 24}}>
          <button type="submit" className="h5" style={{width: 240, height: 64, borderRadius: 32, background: '#2A4E14', color: '#fff', border: 'none', fontSize: 22, fontWeight: 500, cursor: 'pointer'}}>Save</button>
        </div>
      </form>
    </ModalWrapper>
  );
} 