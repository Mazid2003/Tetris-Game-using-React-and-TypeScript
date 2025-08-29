// App.tsx
import "./index.css";
import GameBoard from "./components/GameBoard";
import Scoreboard from "./components/Scoreboard";
import Controls from "./components/Controls";
import useTetris from "./hooks/useTetris";

export default function App() {
  const t = useTetris();

  return (
    <div className="app">
      <aside className="left">
        <Scoreboard
          score={t.score}
          lines={t.lines}
          level={t.level}
          nextPiece={t.nextPiece}
        />
      </aside>

      <main className="center">
        <div className="board-wrapper">
          <GameBoard
            board={t.board}
            current={t.current}
            colors={t.colors}
            ROWS={t.ROWS}
            COLS={t.COLS}
            scale={28}
            isRunning={t.isRunning}
            gameOver={t.gameOver}
          />
        </div>
      </main>

      <aside className="right">
        <Controls
          start={t.start}
          pause={t.pause}
          resume={t.resume}
          moveLeft={t.moveLeft}
          moveRight={t.moveRight}
          rotatePiece={t.rotatePiece}
          softDrop={t.softDrop}
          hardDrop={t.hardDrop}
          isRunning={t.isRunning}
        />
      </aside>
    </div>
  );
}
