import React from "react";
import PuzzleCollectionCard from "./PuzzleCollectionCard";

export default function PuzzleList({ puzzleList }) {
  return (
    <div>
      {puzzleList.map((puzzle, idx) => (
        <PuzzleCollectionCard key={idx} puzzle={puzzle} />
      ))}
    </div>
  );
} 