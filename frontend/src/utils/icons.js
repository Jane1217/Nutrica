// 图标资源导入
export const icons = {
  // 箭头图标
  arrowBack: '/assets/Arrow-back-ios.svg',
  arrowLeft: '/assets/arrow-left.svg',
  arrowForward: '/assets/Arrow forward.svg',
  
  // 关闭图标
  close: '/assets/mingcute_close-fill.svg',
  closeBlack: '/assets/mingcute_close-fill-black.svg',
  closeRounded: '/assets/material-symbols_close-rounded.svg',
  
  // 功能图标
  home: '/assets/material-symbols_home-rounded.svg',
  account: '/assets/mdi_account.svg',
  camera: '/assets/basil_camera-solid.svg',
  scan: '/assets/ph_scan-fill.svg',
  message: '/assets/mynaui_message-solid.svg',
  inputBox: '/assets/streamline-plump_input-box-solid.svg',
  achievement: '/assets/fluent_collections-empty-16-filled.svg',
  frame: '/assets/Frame 79.svg',
};

// 获取图标URL的辅助函数
export const getIconUrl = (iconName) => {
  return icons[iconName] || '';
}; 