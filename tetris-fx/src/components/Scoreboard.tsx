// Scoreboard.tsx
import type { Piece } from "../types";

type Props = {
  score: number;
  lines: number;
  level: number;
  nextPiece: Piece | null;
};

export default function Scoreboard({ score, lines, level, nextPiece }: Props) {
  return (
    <div className="scoreboard">
      <h2>CYBER TETRIS FX</h2>
      <div className="stat">
        <span>Score</span>
        <strong>{score}</strong>
      </div>
      <div className="stat">
        <span>Lines</span>
        <strong>{lines}</strong>
      </div>
      <div className="stat">
        <span>Level</span>
        <strong>{level}</strong>
      </div>

      <div className="next">
        <div className="label">Next</div>
        <div className="next-preview">
          <MiniPreview piece={nextPiece} />
        </div>
      </div>
    </div>
  );
}

function MiniPreview({ piece }: { piece: Piece | null }) {
  if (!piece) return <div className="mini-empty" />;
  const shape = piece.shape;
  return (
    <div className="mini-grid" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 18px)` }}>
      {shape.flat().map((v: number, i: number) => (
        <div key={i} className={`cell ${v ? "filled" : ""}`} />
      ))}
    </div>
  );
}
