// Controls.tsx
//import React from "react";

type Props = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotatePiece: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  isRunning: boolean;
};

export default function Controls({
  start,
  pause,
  resume,
  moveLeft,
  moveRight,
  rotatePiece,
  softDrop,
  hardDrop,
  isRunning,
}: Props) {
  return (
    <div className="controls">
      <div className="buttons">
        <button className="btn" onClick={() => start()}>
          Start
        </button>
        <button
          className="btn"
          onClick={() => {
            isRunning ? pause() : resume();
          }}
        >
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button
          className="btn"
          onClick={() => {
            start();
          }}
        >
          Restart
        </button>
      </div>

      <div className="kbd">
        <p>
          <strong>Controls</strong>
        </p>
        <p>← → : Move</p>
        <p>↑ : Rotate</p>
        <p>↓ : Soft Drop</p>
        <p>Space : Hard Drop</p>
        <p>P : Pause</p>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button className="btn" onClick={moveLeft}>
          ←
        </button>
        <button className="btn" onClick={moveRight}>
          →
        </button>
        <button className="btn" onClick={rotatePiece}>
          ⤾
        </button>
        <button className="btn" onClick={softDrop}>
          ↓
        </button>
        <button className="btn" onClick={hardDrop}>
          ⏬
        </button>
      </div>
    </div>
  );
}
