// 生成分享链接
export function getShareLink({ userId, puzzleName, nickname }) {
  let BASE_URL = '';
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      BASE_URL = 'https://localhost:3000';
    } else {
      BASE_URL = 'https://nutrica.app';
    }
  }
  const params = [`nickname=${encodeURIComponent(nickname || '')}`];
  const paramStr = `?${params.join('&')}`;
  return userId ? `${BASE_URL}/share/${userId}/${puzzleName.toLowerCase()}${paramStr}` : '';
}

// 复制到剪贴板
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // fallback
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
} 