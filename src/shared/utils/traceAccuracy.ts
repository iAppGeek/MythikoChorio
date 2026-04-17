import type { Point, Stroke } from './skiaPathBuilder';
import { CANVAS_SIZE } from '../../data/alphabet/letterData';

const GRID = 20;
const CELL = CANVAS_SIZE / GRID;

type Grid = boolean[][];

function makeGrid(): Grid {
  return Array.from({ length: GRID }, () => new Array<boolean>(GRID).fill(false));
}

function markSegment(grid: Grid, a: Point, b: Point): void {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (CELL * 0.5));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const col = Math.floor((a.x + (b.x - a.x) * t) / CELL);
    const row = Math.floor((a.y + (b.y - a.y) * t) / CELL);
    if (col >= 0 && col < GRID && row >= 0 && row < GRID) {
      grid[row][col] = true;
    }
  }
}

function gridFromStrokes(strokes: Stroke[]): Grid {
  const grid = makeGrid();
  for (const stroke of strokes) {
    for (let i = 0; i < stroke.length - 1; i++) {
      markSegment(grid, stroke[i], stroke[i + 1]);
    }
  }
  return grid;
}

/**
 * Returns accuracy as 0–100 (intersection-over-template).
 * A user who covers all template cells scores 100.
 * Scribbling outside the letter doesn't inflate the score.
 */
export function calculateTraceAccuracy(
  templateStrokes: Stroke[],
  userStrokes: Stroke[],
): number {
  const template = gridFromStrokes(templateStrokes);
  const user = gridFromStrokes(userStrokes);

  let total = 0;
  let covered = 0;

  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (template[r][c]) {
        total++;
        if (user[r][c]) covered++;
      }
    }
  }

  if (total === 0) return 0;
  return Math.round((covered / total) * 100);
}

export function scoreToStars(score: number): 1 | 2 | 3 {
  if (score >= 80) return 3;
  if (score >= 50) return 2;
  return 1;
}
