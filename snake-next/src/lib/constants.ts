import { Direction } from "./types";

export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 20;
export const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE;
export const INITIAL_SPEED = 100;
export const MIN_SPEED = 40;
export const SCORE_PER_FOOD = 10;
export const INITIAL_SNAKE_LENGTH = 3;

/** Colors used by the Canvas 2D rendering context. */
export const COLORS = {
  snake: "#22c55e",
  snakeHead: "#4ade80",
  food: "#ef4444",
  border: "#06b6d4",
  score: "#eab308",
  background: "#0f172a",
  grid: "#1e293b",
};

export const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> =
  {
    UP: { dx: 0, dy: -1 },
    DOWN: { dx: 0, dy: 1 },
    LEFT: { dx: -1, dy: 0 },
    RIGHT: { dx: 1, dy: 0 },
  };

export const OPPOSITES: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};
