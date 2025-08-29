// GameBoard.tsx
import { useEffect, useRef } from "react";
import type { Piece } from "../types";

type Props = {
  board: number[][];
  current: Piece | null;
  colors: string[];
  ROWS: number;
  COLS: number;
  scale?: number;
  isRunning: boolean;
  gameOver: boolean;
};

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
}

function drawBoardBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#0f0f17");
  g.addColorStop(1, "#071026");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#ffffff";
  for (let x = 0; x <= w; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export default function GameBoard({
  board,
  current,
  colors,
  ROWS,
  COLS,
  scale = 28,
  isRunning,
  gameOver,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const width = COLS * scale;
    const height = ROWS * scale;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    let raf = 0;
    const render = () => {
      drawBoardBackground(ctx, width, height);

      // draw settled blocks
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = board[r][c];
          if (cell) {
            const x = c * scale,
              y = r * scale;
            ctx.shadowColor = colors[cell];
            ctx.shadowBlur = 14;
            drawCell(ctx, x + 2, y + 2, scale - 4, colors[cell]);
            ctx.shadowBlur = 0;
          }
        }
      }

      // draw current piece
      if (current) {
        current.shape.forEach((row, r) => {
          row.forEach((val, c) => {
            if (val) {
              const x = (current.x + c) * scale;
              const y = (current.y + r) * scale;
              ctx.save();
              ctx.shadowColor = colors[current.colorIndex];
              ctx.shadowBlur = 18;
              drawCell(ctx, x + 2, y + 2, scale - 4, colors[current.colorIndex]);
              ctx.restore();
            }
          });
        });
      }

      // overlay UI when paused or game over
      if (!isRunning && !gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(width * 0.15, height * 0.4, width * 0.7, height * 0.18);
        ctx.fillStyle = "#fff";
        ctx.font = "18px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Paused - Press P to resume", width / 2, height * 0.48);
      }
      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#fff";
        ctx.font = "32px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", width / 2, height / 2 - 10);
        ctx.font = "14px Inter, sans-serif";
        ctx.fillText("Press Start to play again", width / 2, height / 2 + 20);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [board, current, colors, ROWS, COLS, scale, isRunning, gameOver]);

  return (
    <div className="game-canvas" style={{ width: COLS * scale, height: ROWS * scale }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
