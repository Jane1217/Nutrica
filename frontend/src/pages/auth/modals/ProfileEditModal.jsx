import React, { useState, useRef } from 'react';
import ModalWrapper from '../../../components/common/ModalWrapper';
import InputField from '../../../components/auth/InputField';
import BottomButton from '../../../components/common/BottomButton';
import FullScreenCropper from './FullScreenCropper';
import { supabase } from '../../../supabaseClient';



export default function ProfileEditModal({ open, onClose, userInfo = {}, onSave }) {
  const [firstName, setFirstName] = useState(userInfo.name || '');
  const [lastName, setLastName] = useState(userInfo.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showFullScreenCropper, setShowFullScreenCropper] = useState(false);
  const [croppedUrl, setCroppedUrl] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  React.useEffect(() => {
    setFirstName(userInfo.name || '');
    setLastName(userInfo.lastName || '');
    setAvatarUrl(null);
    setCroppedUrl(userInfo.avatarUrl || null); // 优先显示已有的头像
    setCroppedBlob(null);
    setShowFullScreenCropper(false);
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
    
    // 如果有新的头像，上传到Supabase Storage
    if (croppedUrl && croppedUrl !== userInfo.avatarUrl) {
      setUploading(true);
      try {
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
        
        // 使用保存的blob或从URL获取blob
        const blob = croppedBlob || await (await fetch(croppedUrl)).blob();
        
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
      setShowFullScreenCropper(true);
    }
  };

  // 全屏裁剪完成回调
  const handleCropComplete = (croppedImageUrl, blob) => {
    setCroppedUrl(croppedImageUrl);
    setCroppedBlob(blob);
    setShowFullScreenCropper(false);
    // 清理原始图片URL
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(null);
    }
  };

  // 取消全屏裁剪
  const handleCropCancel = () => {
    setShowFullScreenCropper(false);
    // 清理原始图片URL
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(null);
    }
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
        setCroppedBlob(null);
        setAvatarUrl(null);
        setShowFullScreenCropper(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // 通知父组件更新
        if (onSave) onSave({ name: firstName, lastName, avatarUrl: null });
      }
    } catch (error) {
      console.error('删除头像失败:', error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} onClose={onClose} size="auth">
        <form onSubmit={handleSubmit} style={{padding: 0, background: 'transparent', height: '100vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', boxSizing: 'border-box'}}>
          <div style={{position: 'relative', marginBottom: 0}}>
            <div className="h2" style={{ marginBottom: 0, textAlign: 'left', padding: '24px 0 0 24px' }}>Edit Profile</div>
            <button type="button" onClick={onClose} style={{position: 'absolute', right: 16, top: 16, display: 'flex', width: 48, height: 48, padding: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 999, border: '1px solid var(--Brand-Outline, #DBE2D0)', background: 'none', cursor: 'pointer'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{width: 20, height: 20, flexShrink: 0, aspectRatio: '1/1'}}>
                <path fillRule="evenodd" clipRule="evenodd" d="M10.008 11.8844L14.7227 16.5938C14.9729 16.8437 15.3122 16.9841 15.666 16.9841C16.0198 16.9841 16.3591 16.8437 16.6093 16.5938C16.8595 16.3439 17 16.005 17 15.6516C17 15.2982 16.8595 14.9592 16.6093 14.7093L11.8928 10L16.6084 5.29067C16.7322 5.16693 16.8304 5.02005 16.8974 4.85841C16.9644 4.69676 16.9988 4.52352 16.9988 4.34858C16.9988 4.17363 16.9642 4.00041 16.8972 3.83879C16.8301 3.67718 16.7318 3.53034 16.6079 3.40667C16.4841 3.28299 16.337 3.1849 16.1752 3.11799C16.0134 3.05108 15.8399 3.01666 15.6648 3.0167C15.4896 3.01674 15.3162 3.05124 15.1544 3.11823C14.9926 3.18522 14.8456 3.28338 14.7218 3.40711L10.008 8.11644L5.29327 3.40711C5.17031 3.27983 5.0232 3.17828 4.86053 3.10839C4.69786 3.0385 4.52288 3.00168 4.34581 3.00006C4.16874 2.99844 3.99311 3.03206 3.82919 3.09896C3.66526 3.16586 3.51632 3.2647 3.39105 3.38971C3.26577 3.51472 3.16668 3.66341 3.09955 3.82708C3.03242 3.99076 2.99859 4.16615 3.00005 4.34302C3.0015 4.51989 3.03821 4.6947 3.10802 4.85725C3.17783 5.0198 3.27936 5.16684 3.40667 5.28978L8.12316 10L3.40756 14.7102C3.28025 14.8332 3.17872 14.9802 3.10891 15.1427C3.03909 15.3053 3.00239 15.4801 3.00093 15.657C2.99948 15.8339 3.0333 16.0092 3.10044 16.1729C3.16757 16.3366 3.26666 16.4853 3.39193 16.6103C3.51721 16.7353 3.66615 16.8341 3.83008 16.901C3.994 16.9679 4.16963 17.0016 4.3467 16.9999C4.52377 16.9983 4.69875 16.9615 4.86142 16.8916C5.02409 16.8217 5.1712 16.7202 5.29416 16.5929L10.008 11.8844Z" fill="#6A6A61"/>
              </svg>
            </button>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0 16px 0'}}>
            <label style={{cursor: 'pointer', position: 'relative', display: 'inline-block'}}>
              <input ref={fileInputRef} type="file" accept="image/*" style={{display: 'none'}} onChange={handleAvatarChange} />
              <div style={{width: 120, height: 120, flexShrink: 0, aspectRatio: '1/1', borderRadius: '50%', background: '#905021', color: '#fff', fontSize: 56, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible'}}>
                {croppedUrl ? (
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
            <div className="h4" style={{
              color: (croppedUrl || userInfo.avatarUrl) ? '#22221B' : '#bbb', 
              marginTop: 8, 
              marginBottom: 8,
              cursor: (croppedUrl || userInfo.avatarUrl) ? 'pointer' : 'default'
            }} onClick={handleDeleteAvatar}>
              Delete
            </div>
          </div>
          <div style={{padding: '0 24px', width: '100%', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box'}}>
            <InputField label=" First Name (Nickname)" value={firstName} onChange={setFirstName} required />
            <div style={{height: 24}}></div>
            <InputField label=" Last Name (Optional)" value={lastName} onChange={setLastName} />
          </div>
          <BottomButton 
            type="submit"
            isLoading={uploading}
            loadingText="Uploading..."
          >
            Save
          </BottomButton>
        </form>
      </ModalWrapper>
      
      {/* 全屏裁剪组件 */}
      {showFullScreenCropper && avatarUrl && (
        <FullScreenCropper
          imageUrl={avatarUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}