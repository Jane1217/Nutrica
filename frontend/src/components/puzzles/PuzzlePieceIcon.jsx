import React from "react";

export default function PuzzlePieceIcon({ got }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: got ? "#c6e6b7" : "#f3e3e3",
        opacity: got ? 1 : 0.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #eee",
      }}
    >
      <img
        src="/assets/puzzle grid.svg"
        alt="puzzle"
        style={{ width: 32, height: 32, objectFit: "contain" }}
      />
    </div>
  );
} 