"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Direction, GameState, Position } from "@/lib/types";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_SPEED,
  MIN_SPEED,
  SCORE_PER_FOOD,
  INITIAL_SNAKE_LENGTH,
  DIRECTION_VECTORS,
  OPPOSITES,
} from "@/lib/constants";

function createInitialSnake(): Position[] {
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);
  const snake: Position[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: centerX - INITIAL_SNAKE_LENGTH + 1 + i, y: centerY });
  }
  return snake;
}

function placeFood(snake: Position[]): Position | null {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const free: Position[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

function getSpeed(score: number): number {
  return Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(score / 2));
}

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [score, setScore] = useState(0);
  const [renderTick, setRenderTick] = useState(0);

  const snakeRef = useRef<Position[]>(createInitialSnake());
  const foodRef = useRef<Position | null>(null);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>("IDLE");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (gameStateRef.current !== "PLAYING") return;

    const snake = snakeRef.current;
    const dir = nextDirectionRef.current;

    // Apply direction change (prevent reversal)
    if (OPPOSITES[dir] !== directionRef.current) {
      directionRef.current = dir;
    }

    const currentDir = directionRef.current;
    const { dx, dy } = DIRECTION_VECTORS[currentDir];
    const head = snake[snake.length - 1];
    const newHead: Position = { x: head.x + dx, y: head.y + dy };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_WIDTH ||
      newHead.y < 0 ||
      newHead.y >= GRID_HEIGHT
    ) {
      setGameState("GAME_OVER");
      gameStateRef.current = "GAME_OVER";
      stopLoop();
      setRenderTick((t) => t + 1);
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      setGameState("GAME_OVER");
      gameStateRef.current = "GAME_OVER";
      stopLoop();
      setRenderTick((t) => t + 1);
      return;
    }

    snake.push(newHead);

    // Food check
    const food = foodRef.current;
    if (food && newHead.x === food.x && newHead.y === food.y) {
      const newScore = scoreRef.current + SCORE_PER_FOOD;
      scoreRef.current = newScore;
      setScore(newScore);

      const newFood = placeFood(snake);
      foodRef.current = newFood;

      if (newFood === null) {
        // Board full — win!
        setGameState("GAME_OVER");
        gameStateRef.current = "GAME_OVER";
        stopLoop();
        setRenderTick((t) => t + 1);
        return;
      }

      // Adjust speed
      const newSpeed = getSpeed(newScore);
      stopLoop();
      intervalRef.current = setInterval(tick, newSpeed);
    } else {
      snake.shift();
    }

    setRenderTick((t) => t + 1);
  }, [stopLoop]);

  const startGame = useCallback(() => {
    snakeRef.current = createInitialSnake();
    foodRef.current = placeFood(snakeRef.current);
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
    gameStateRef.current = "PLAYING";

    stopLoop();
    intervalRef.current = setInterval(tick, INITIAL_SPEED);
    setRenderTick((t) => t + 1);
  }, [tick, stopLoop]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const state = gameStateRef.current;

      if (state === "IDLE" && e.key === " ") {
        e.preventDefault();
        startGame();
        return;
      }

      if (state === "GAME_OVER" && e.key.toLowerCase() === "r") {
        startGame();
        return;
      }

      if (state !== "PLAYING") return;

      let newDir: Direction | null = null;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          newDir = "UP";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          newDir = "DOWN";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          newDir = "LEFT";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          newDir = "RIGHT";
          break;
      }

      if (newDir && OPPOSITES[newDir] !== directionRef.current) {
        e.preventDefault();
        nextDirectionRef.current = newDir;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [startGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  // Place initial food
  useEffect(() => {
    if (!foodRef.current) {
      foodRef.current = placeFood(snakeRef.current);
      setRenderTick((t) => t + 1);
    }
  }, []);

  // Return immutable snapshots so consumers cannot mutate internal state.
  // Memoized by renderTick so a new snapshot is only created when the game
  // state actually changes (i.e., after each tick or state transition).
  const snakeSnapshot = useMemo(
    () => snakeRef.current.map((p) => ({ ...p })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderTick],
  );

  const foodSnapshot = useMemo(
    () => (foodRef.current ? { ...foodRef.current } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderTick],
  );

  return {
    snake: snakeSnapshot,
    food: foodSnapshot,
    score,
    gameState,
    renderTick,
    startGame,
  };
}
