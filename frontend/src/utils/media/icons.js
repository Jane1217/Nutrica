// 图标资源导入
export const icons = {
  // 箭头图标
  arrowBack: '/assets/back.svg',
  arrowLeft: '/assets/arrow-left.svg',
  arrowForward: '/assets/forward.svg',
  
  // 导航图标
  menu: '/assets/Menu.svg',
  logo: '/assets/logo.svg',
  add: '/assets/add.svg',
  
  // 关闭图标
  close: '/assets/material-symbols_close-rounded.svg',
  closeBlack: '/assets/mingcute_close-fill-black.svg',
  closeRounded: '/assets/material-symbols_close-rounded.svg',
  closeFill: '/assets/mingcute_close-fill.svg',
  closeFillBlack: '/assets/mingcute_close-fill-black.svg',
  
  // 功能图标
  home: '/assets/material-symbols_home-rounded.svg',
  account: '/assets/mdi_account.svg',
  camera: '/assets/basil_camera-solid.svg',
  scan: '/assets/ph_scan-fill.svg',
  message: '/assets/mynaui_message-solid.svg',
  inputBox: '/assets/streamline-plump_input-box-solid.svg',
  achievement: '/assets/fluent_collections-empty-16-filled.svg',
  help: '/assets/help.svg',
  puzzleGrid: '/assets/puzzles/grid.svg',
  addAlt: '/assets/add (1).svg',
  collection: '/assets/fluent_collections-empty-16-filled.svg',
  scanFrame: '/assets/scan-icon.svg',
  heroFrame: '/assets/Frame 268.png',
  collectionsIcon: '/assets/fluent_collections-20-filled.svg',
  card1: '/assets/card.png',
  card2: '/assets/card (1).png',
  cameraIcon: '/assets/basil_camera-solid (1).svg',
  bottomSheet: '/assets/Bottom Sheet 1.png',
  scannerCamera: '/assets/Scanner Camera 1.png',
  imagePixel: '/assets/fluent-mdl2_image-pixel.svg',
  frame265: '/assets/Frame 265.png',
  trophy: '/assets/material-symbols_trophy-rounded.svg',
  group170: '/assets/Group 170.png',
  vector6: '/assets/Vector 6.png',
};

// 获取图标URL的辅助函数
export const getIconUrl = (iconName) => {
  return icons[iconName] || '';
};

 