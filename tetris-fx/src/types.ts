export type Cell = number; // 0 = empty, >0 = color index
export type Board = Cell[][];
export type Point = { x: number; y: number };

export type TetrominoKey = "I" | "O" | "T" | "L" | "J" | "S" | "Z" | "B"; // B = bomb/powerup optional

export interface Piece {
  shape: number[][];
  x: number;
  y: number;
  kind: TetrominoKey;
  colorIndex: number;
  id?: string;
}
