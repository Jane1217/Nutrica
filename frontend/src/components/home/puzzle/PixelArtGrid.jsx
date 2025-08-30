import React from "react";
import styles from '../../home/puzzle/PixelArtGrid.module.css';

/**
 * @param {Array} pixelMap 24x24二维数组，每个元素为{color, nutrient}
 * @param {Object} progress 进度对象，如{1: 0.7, 2: 0.5, 3: 1.0}
 * @param {boolean} showGrid 是否显示网格线
 * @param {boolean} showUnfinishedBlocks 是否显示未完成像素的底色和网格线
 */
export default function PixelArtGrid({ pixelMap, progress = {}, showGrid = true, showUnfinishedBlocks = true }) {
  // 如果 pixelMap 为空，生成默认 24x24 灰色占位
  const safePixelMap = pixelMap && Array.isArray(pixelMap) && pixelMap.length === 24
    ? pixelMap
    : Array.from({ length: 24 }, () =>
        Array.from({ length: 24 }, () => ({
          color: '#FCFCF8',
          nutrient: 0
        }))
      );

  // 统计每种营养素的像素索引，按从下至上、从左至右的顺序
  const nutrientPixels = {};
  for (let y = 23; y >= 0; y--) { // 从下至上
    for (let x = 0; x < 24; x++) { // 从左至右
      const pix = safePixelMap[y][x];
      if (!pix.nutrient) continue;
      if (!nutrientPixels[pix.nutrient]) nutrientPixels[pix.nutrient] = [];
      nutrientPixels[pix.nutrient].push({ x, y });
    }
  }
  
  // 计算每种营养素要填色的像素数量
  const fillCounts = {};
  Object.keys(nutrientPixels).forEach(n => {
    fillCounts[n] = Math.round(nutrientPixels[n].length * (progress[n] || 0));
  });

  // 生成24x24像素块
  return (
    <div
      className={styles.pixelGrid}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(24, 1fr)",
        gridTemplateRows: "repeat(24, 1fr)",
        width: 264, // 修改：从384px改为264px，适配容器大小
        height: 264, // 修改：从384px改为264px，适配容器大小
        border: showGrid ? "1px solid #ccc" : "none",
        background: "#fff"
      }}
    >
      {safePixelMap.map((row, y) =>
        row.map((pix, x) => {
          // 如果有pixelMap数据，按进度显示；否则按默认逻辑
          const shouldShowProgress = pixelMap && Array.isArray(pixelMap) && pixelMap.length === 24;
          
          if (shouldShowProgress) {
            // 按营养进度显示
            const idx = nutrientPixels[pix.nutrient]?.findIndex(p => p.x === x && p.y === y);
            const isFilled = idx > -1 && idx < fillCounts[pix.nutrient];
            
            return (
              <div
                key={x + "-" + y}
                className={showGrid ? styles.pixelWithGrid : styles.pixel}
                style={{
                  background: !isFilled && !showUnfinishedBlocks
                    ? "#FCFCF8"
                    : (pix.nutrient === 0 ? "#FCFCF8" : pix.color),
                  border: showGrid ? "0.5px solid var(--Brand-Outline, #DBE2D0)" : "none",
                  position: "relative"
                }}
              >
                {/* 未完成部分用倾斜网格线覆盖，但底层颜色仍然显示 */}
                {showUnfinishedBlocks && !isFilled && pix.nutrient !== 0 && (
                  <>
                    {/* grid.svg 网格线在底色之上 */}
                    <div 
                      style={{
                        position: 'absolute',
                        left: 0, top: 0, right: 0, bottom: 0,
                        backgroundImage: 'url(/assets/puzzles/grid.svg)',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    />
                    {/* 半透明遮罩在最上层 */}
                    <div 
                      style={{
                        position: 'absolute',
                        left: 0, top: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(231, 231, 213, 0.60)',
                        opacity: 0.5,
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    />
                  </>
                )}
              </div>
            );
          } else {
            // 默认逻辑（无pixelMap时）
            const idx = nutrientPixels[pix.nutrient]?.findIndex(p => p.x === x && p.y === y);
            const isFilled = idx > -1 && idx < fillCounts[pix.nutrient];
            return (
              <div
                key={x + "-" + y}
                className={showGrid ? styles.pixelWithGrid : styles.pixel}
                style={{
                  background: isFilled ? pix.color : "var(--Brand-Off-White, #FCFCF8)",
                  border: "0.5px solid var(--Brand-Outline, #DBE2D0)",
                  position: "relative"
                }}
              >
                {/* 未完成部分可加斜线遮罩 */}
                {!isFilled && pix.nutrient !== 0 && (
                  <div className={styles.incompleteMask} />
                )}
              </div>
            );
          }
        })
      )}
    </div>
  );
} 