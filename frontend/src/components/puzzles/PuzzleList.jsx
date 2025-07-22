import React from "react";
import PuzzleCollectionCard from "./PuzzleCollectionCard";
import { puzzleCategories } from "../../data/puzzlesData";

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