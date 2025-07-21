import React from "react";
import ModalWrapper from "../../../components/common/ModalWrapper";
import PuzzleSelectCard from "../../../components/puzzles/PuzzleSelectCard";

export default function PuzzleSelectModal({ open, onClose, puzzleList, onSelect, selectedPuzzle }) {
  return (
    <ModalWrapper open={open} onClose={onClose}>
      <div style={{padding: 0, minWidth: 340, maxWidth: 480}}>
        {/* Header */}
        <div style={{display: "flex", alignItems: "center", padding: "20px 24px 0 24px"}}>
          <button onClick={onClose} style={{marginRight: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer'}}>&larr;</button>
          <span style={{fontWeight: 700, fontSize: 20, flex: 1}}>Magic Garden</span>
          <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: 28, cursor: 'pointer'}}>&times;</button>
        </div>
        {/* List */}
        <div style={{padding: "16px 16px 80px 16px"}}>
          {puzzleList.map((puzzle, idx) => (
            <PuzzleSelectCard
              key={idx}
              puzzle={puzzle}
              selected={selectedPuzzle && selectedPuzzle.id === puzzle.id}
              onSelect={() => onSelect(puzzle)}
            />
          ))}
        </div>
        {/* Bottom Button */}
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0, background: "#F3F3EC",
          padding: "16px 0", display: "flex", justifyContent: "center", zIndex: 1002
        }}>
          <button style={{
            width: 320, height: 48, borderRadius: 16, background: "#BFCDB3",
            color: "#22221B", fontWeight: 700, fontSize: 18, border: "none"
          }}>
            Select puzzle
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
} 