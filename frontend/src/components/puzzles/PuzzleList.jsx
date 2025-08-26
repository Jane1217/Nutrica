//渲染所有 puzzle 分类（如 Magic Garden），每个分类下渲染 PuzzleCollectionCard。
//默认从 puzzleCategories（@puzzlesData.js）获取所有分类和 puzzle 数据。
import React from "react";
import PuzzleSynthesisCard from "./PuzzleSynthesisCard";
import PuzzleCollectionCard from "./PuzzleCollectionCard";
import { puzzleCategories } from '../../data/puzzles';

export default function PuzzleList({ puzzleList = puzzleCategories, onCardClick }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      width: '100%' // 只保留宽度设置
    }}>
      {puzzleList.map((category, idx) => {
        // 根据type属性决定渲染哪个组件
        if (category.type === 'synthesis') {
          return (
            <div key={category.id || idx} onClick={() => onCardClick && onCardClick(category)} style={{ cursor: 'pointer', width: '100%' }}>
              <PuzzleSynthesisCard
                category={category}
              />
            </div>
          );
        } else {
          // 默认使用collection类型
          return (
            <div key={category.id || idx} onClick={() => onCardClick && onCardClick(category)} style={{ cursor: 'pointer', width: '100%' }}>
              <PuzzleCollectionCard
                category={category}
              />
            </div>
          );
        }
      })}
    </div>
  );
} 