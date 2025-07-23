//渲染所有 puzzle 分类（如 Magic Garden），每个分类下渲染 PuzzleCollectionCard。
//默认从 puzzleCategories（@puzzlesData.js）获取所有分类和 puzzle 数据。
import React from "react";
import PuzzleCollectionCard from "./PuzzleCollectionCard";
import { puzzleCategories } from '../../data/puzzles';

export default function PuzzleList({ puzzleList = puzzleCategories }) {
  return (
    <div>
      {puzzleList.map((category, idx) => (
        <PuzzleCollectionCard
          key={category.id || idx}
          category={category}
        />
      ))}
    </div>
  );
} 