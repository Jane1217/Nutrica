import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG优化函数
function optimizeSVGFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. 移除可能导致模糊的filter
    content = content.replace(/filter="[^"]*"/g, '');
    
    // 2. 优化stroke-width，确保在移动端清晰
    content = content.replace(/stroke-width="([^"]*)"/g, (match, width) => {
      const numWidth = parseFloat(width);
      if (numWidth < 1) {
        return `stroke-width="1"`;
      }
      return match;
    });
    
    // 3. 添加移动端优化属性
    if (!content.includes('shape-rendering')) {
      content = content.replace('<svg', '<svg shape-rendering="crispEdges"');
    }
    
    if (!content.includes('image-rendering')) {
      content = content.replace('<svg', '<svg image-rendering="crisp-edges"');
    }
    
    if (!content.includes('text-rendering')) {
      content = content.replace('<svg', '<svg text-rendering="optimizeLegibility"');
    }
    
    // 4. 移除不必要的空格和换行
    content = content.replace(/>\s+</g, '><');
    
    // 5. 确保viewBox存在
    if (!content.includes('viewBox') && content.includes('width') && content.includes('height')) {
      const widthMatch = content.match(/width="([^"]*)"/);
      const heightMatch = content.match(/height="([^"]*)"/);
      if (widthMatch && heightMatch) {
        const width = widthMatch[1];
        const height = heightMatch[1];
        content = content.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
      }
    }
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 优化完成: ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`❌ 优化失败: ${path.basename(filePath)}`, error.message);
  }
}

// 批量优化SVG文件
function optimizeAllSVGs() {
  const assetsDir = path.join(__dirname, '../public/assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.error('❌ assets目录不存在');
    return;
  }
  
  const files = fs.readdirSync(assetsDir);
  const svgFiles = files.filter(file => file.endsWith('.svg'));
  
  console.log(`🔍 找到 ${svgFiles.length} 个SVG文件`);
  
  svgFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    optimizeSVGFile(filePath);
  });
  
  console.log('🎉 所有SVG文件优化完成！');
}

// 运行优化
optimizeAllSVGs();
