import html2canvas from 'html2canvas';

export async function domToImageBase64(dom, options = {}) {
  if (!dom) return '';
  const canvas = await html2canvas(dom, {
    backgroundColor: null,
    useCORS: true,
    scale: window.devicePixelRatio || 2,
    ...options
  });
  return canvas.toDataURL('image/png');
} 