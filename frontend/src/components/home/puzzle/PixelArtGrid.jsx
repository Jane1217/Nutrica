import React from "react";
import styles from '../../home/puzzle/PixelArtGrid.module.css';

/**
 * @param {Array} pixelMap 24x24二维数组，每个元素为{color, nutrient}
 * @param {Object} progress 进度对象，如{1: 0.7, 2: 0.5, 3: 1.0}
 * @param {boolean} showGrid 是否显示网格线
 */
export default function PixelArtGrid({ pixelMap, progress = {}, showGrid = true }) {
  // 如果 pixelMap 为空，生成默认 24x24 灰色占位
  const safePixelMap = pixelMap && Array.isArray(pixelMap) && pixelMap.length === 24
    ? pixelMap
    : Array.from({ length: 24 }, () =>
        Array.from({ length: 24 }, () => ({
          color: '#e0e0e0',
          nutrient: 0
        }))
      );

  // 统计每种营养素的像素索引
  const nutrientPixels = {};
  safePixelMap.forEach((row, y) =>
    row.forEach((pix, x) => {
      if (!pix.nutrient) return;
      if (!nutrientPixels[pix.nutrient]) nutrientPixels[pix.nutrient] = [];
      nutrientPixels[pix.nutrient].push({ x, y });
    })
  );
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
        width: 384, // 16px*24
        height: 384,
        border: "1px solid #ccc",
        background: "#fff"
      }}
    >
      {safePixelMap.map((row, y) =>
        row.map((pix, x) => {
          // 该营养素的像素序号
          const idx = nutrientPixels[pix.nutrient]?.findIndex(p => p.x === x && p.y === y);
          const isFilled = idx > -1 && idx < fillCounts[pix.nutrient];
          return (
            <div
              key={x + "-" + y}
              className={showGrid ? styles.pixelWithGrid : styles.pixel}
              style={{
                background: isFilled ? pix.color : "var(--Brand-Off-White, #FCFCF8)",
                border: !isFilled ? "0.5px solid var(--Brand-Outline, #DBE2D0)" : undefined,
                position: "relative"
              }}
            >
              {/* 未完成部分可加斜线遮罩 */}
              {!isFilled && pix.nutrient !== 0 && (
                <div className={styles.incompleteMask} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
} 