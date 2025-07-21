import React from "react";

export default function PuzzleSelectCard({ puzzle, selected, onSelect }) {
  return (
    <div style={{
      background: puzzle.bgColor || '#FFB279',
      borderRadius: 20,
      border: selected ? "3px solid #477E2D" : "2px solid #22221B",
      padding: 20,
      marginBottom: 16,
      display: "flex",
      alignItems: "flex-start",
      position: "relative",
      boxShadow: selected ? '0 0 0 2px #BFCDB3' : undefined
    }}>
      <div style={{flex: 1}}>
        <div style={{fontWeight: 700, fontSize: 22, marginBottom: 8}}>Carrot</div>
        <div style={{fontSize: 15, color: "#22221B", marginBottom: 16}}>
          Bright, balanced, and well-fed. That’s the carrot energy we love to see.
        </div>
        {puzzle.inCollection && (
          <div style={{
            display: "inline-flex", alignItems: "center", background: "#fff",
            borderRadius: 20, border: "1.5px solid #BFCDB3", padding: "4px 12px", fontSize: 15, color: "#477E2D"
          }}>
            <span style={{fontSize: 18, marginRight: 6}}>✔</span> In your collection
          </div>
        )}
      </div>
      <img src={puzzle.img} alt="carrot" style={{width: 64, height: 64, marginLeft: 16}} />
      <button
        onClick={onSelect}
        style={{
          position: "absolute", right: 20, bottom: 20, width: 40, height: 40,
          borderRadius: "50%", background: "#fff", border: "2px solid #BFCDB3", fontSize: 24, color: "#22221B", cursor: 'pointer'
        }}
      >+</button>
    </div>
  );
}
