// src/hooks/useTetris.ts
import { useEffect, useRef, useState, useCallback } from "react";
import type { Board, Piece, Point, TetrominoKey } from "../types";

/**
 * Tetris hook
 * - supports standard 7 tetrominoes + special "B" block (single 2x1 block in your code)
 * - difficulty increases with lines: every 10 lines -> level up -> drop speed increases
 * - returns state + action handlers for UI components
 */

const ROWS = 20;
const COLS = 10;
const START_SPEED = 700; // ms per drop at level 1
const MIN_SPEED = 90; // minimum ms per drop (cap)

const COLORS = [
  "#00000000", // 0 - empty
  "#00f0f0", // 1 I - cyan
  "#f0f000", // 2 O - yellow
  "#a000f0", // 3 T - purple
  "#f0a000", // 4 L - orange
  "#0000f0", // 5 J - blue
  "#00f000", // 6 S - green
  "#f00000", // 7 Z - red
  "#ff6aff", // 8 B - special
];

/** Tetromino shapes (matrix values: 0 or 1) */
const TETROMINOES: Record<TetrominoKey, number[][]> = {
  I: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  B: [
    [1, 0],
    [1, 0],
  ], // example special 2x2 vertical block (color index 8)
};

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece(): Piece {
  const keys: TetrominoKey[] = ["I", "O", "T", "L", "J", "S", "Z", "B"];
  const kind = keys[Math.floor(Math.random() * keys.length)];
  const shape = TETROMINOES[kind].map((r) => r.slice());
  const colorIndex = { I: 1, O: 2, T: 3, L: 4, J: 5, S: 6, Z: 7, B: 8 }[kind]!;
  const x = Math.floor((COLS - shape[0].length) / 2);
  return {
    shape,
    x,
    y: -shape.length,
    kind,
    colorIndex,
    id: `${Date.now()}-${Math.random()}`,
  };
}

function rotateMatrix(matrix: number[][]) {
  const N = matrix.length;
  const result = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      result[c][N - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

/** Drop interval by level (simple exponential/linear mix) */
function dropIntervalForLevel(level: number) {
  // Example curve: START_SPEED - 60*(level-1) but bounded by MIN_SPEED
  const interval = Math.max(MIN_SPEED, START_SPEED - (level - 1) * 60);
  return interval;
}

export default function useTetris() {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [current, setCurrent] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece>(() => randomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // mutable drop interval (ms)
  const dropIntervalRef = useRef<number>(dropIntervalForLevel(1));

  // spawn piece (place at top). If immediate collision -> game over
  const spawnPiece = useCallback(
    (piece?: Piece) => {
      const p = piece ?? nextPiece ?? randomPiece();
      const placed = { ...p, x: Math.floor((COLS - p.shape[0].length) / 2), y: -p.shape.length };
      setCurrent(placed);
      setNextPiece(randomPiece());

      // if immediate collision with top rows, mark game over
      setTimeout(() => {
        // use a microtask / next tick to ensure board has latest value
        setBoard((b) => {
          if (collide(b, placed, { x: placed.x, y: placed.y })) {
            setGameOver(true);
            setIsRunning(false);
          }
          return b;
        });
      }, 0);
    },
    [nextPiece]
  );

  const collide = (boardState: Board, piece: Piece, pos: Point) => {
    const { shape } = piece;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const x = pos.x + c;
          const y = pos.y + r;
          if (x < 0 || x >= COLS || y >= ROWS) return true;
          if (y >= 0 && boardState[y][x]) return true;
        }
      }
    }
    return false;
  };

  const mergePiece = (boardState: Board, piece: Piece) => {
    const newB = boardState.map((row) => row.slice());
    piece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const x = piece.x + c;
          const y = piece.y + r;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) newB[y][x] = piece.colorIndex;
        }
      });
    });
    return newB;
  };

  const clearLines = (boardState: Board) => {
    const cleared: number[] = [];
    const newB: Board = [];
    for (let r = 0; r < ROWS; r++) {
      if (boardState[r].every((cell) => cell !== 0)) {
        cleared.push(r);
      } else {
        newB.push(boardState[r]);
      }
    }
    const linesCleared = cleared.length;
    for (let i = 0; i < linesCleared; i++) newB.unshift(new Array(COLS).fill(0));
    return { board: newB, linesCleared };
  };

  const lockPiece = useCallback(
    (piece: Piece) => {
      setBoard((prev) => {
        const merged = mergePiece(prev, piece);
        const { board: afterClear, linesCleared } = clearLines(merged);

        if (linesCleared > 0) {
          // scoring: standard-like
          const pointsByClears = [0, 100, 300, 500, 800];
          const points = pointsByClears[linesCleared] ?? linesCleared * 200;
          setScore((s) => s + points * level);
          setLines((l) => l + linesCleared);
        }

        return afterClear;
      });

      // spawn next piece after locking
      spawnPiece();
    },
    [level, spawnPiece]
  );

  // movement helpers
  const move = useCallback(
    (dx: number) => {
      if (!current) return;
      const p = { ...current, x: current.x + dx };
      if (!collide(board, p, { x: p.x, y: p.y })) setCurrent(p);
    },
    [current, board]
  );

  const softDrop = useCallback(() => {
    if (!current) return;
    const p = { ...current, y: current.y + 1 };
    if (collide(board, p, { x: p.x, y: p.y })) {
      // cannot move down -> lock or game over
      if (current.y < 0) {
        setGameOver(true);
        setIsRunning(false);
      } else {
        lockPiece(current);
      }
    } else {
      setCurrent(p);
    }
  }, [current, board, lockPiece]);

  const hardDrop = useCallback(() => {
    if (!current) return;
    let dropY = current.y;
    while (true) {
      const p = { ...current, y: dropY + 1 };
      if (collide(board, p, { x: p.x, y: p.y })) break;
      dropY++;
    }
    setCurrent({ ...current, y: dropY });
    lockPiece({ ...current, y: dropY });
  }, [current, board, lockPiece]);

  const rotate = useCallback(() => {
    if (!current) return;
    const rotated = rotateMatrix(current.shape);
    const p = { ...current, shape: rotated };
    // simple wall kick attempts
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      const candidate = { ...p, x: current.x + k };
      if (!collide(board, candidate, { x: candidate.x, y: candidate.y })) {
        setCurrent(candidate);
        return;
      }
    }
  }, [current, board]);

  // main tick using requestAnimationFrame but based on dropIntervalRef
  useEffect(() => {
    if (!isRunning) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const elapsed = now - last;
      if (elapsed > dropIntervalRef.current) {
        last = now;
        softDrop();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, softDrop]);

  // public actions
  const start = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsRunning(true);
    dropIntervalRef.current = dropIntervalForLevel(1);
    setNextPiece(randomPiece());
    spawnPiece(randomPiece());
  }, [spawnPiece]);

  // update drop interval when level changes (difficulty progression)
  useEffect(() => {
    dropIntervalRef.current = dropIntervalForLevel(level);
  }, [level]);

  // advance level based on lines cleared (every 10 lines)
  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      // dropIntervalRef updated by level effect
    }
  }, [lines, level]);

  // keyboard listeners
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isRunning || gameOver) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        softDrop();
      } else if (e.key === " ") {
        e.preventDefault();
        hardDrop();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        rotate();
      } else if (e.key === "p" || e.key === "P") {
        setIsRunning((r) => !r);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, gameOver, move, softDrop, rotate, hardDrop]);

  return {
    board,
    current,
    nextPiece,
    score,
    lines,
    level,
    isRunning,
    gameOver,
    colors: COLORS,
    ROWS,
    COLS,
    start,
    pause: () => setIsRunning(false),
    resume: () => {
      if (!gameOver) setIsRunning(true);
    },
    moveLeft: () => move(-1),
    moveRight: () => move(1),
    rotatePiece: () => rotate(),
    softDrop,
    hardDrop,
    setBoard,
    spawnPiece,
  };
}
