export async function domToImageBase64(dom, options = {}) {
  if (!dom) return '';
  // 219KB库：只在真正生成分享图片时才下载，而不是随页面一起加载
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(dom, {
    backgroundColor: null,
    useCORS: true,
    scale: window.devicePixelRatio || 2,
    ...options
  });
  return canvas.toDataURL('image/png');
} 