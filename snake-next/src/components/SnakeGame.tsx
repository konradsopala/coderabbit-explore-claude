"use client";

import { useEffect, useRef } from "react";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  CELL_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
} from "@/lib/constants";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dprRef = useRef(1);
  const isCanvasInitialized = useRef(false);
  const { snake, food, score, gameState, renderTick } = useSnakeGame();

  // One-time canvas setup for high-DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isCanvasInitialized.current) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    isCanvasInitialized.current = true;
  }, []);

  // Render loop — draws every frame without touching canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, CANVAS_WIDTH - 3, CANVAS_HEIGHT - 3);

    // Food
    if (food) {
      ctx.fillStyle = COLORS.food;
      ctx.beginPath();
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Snake
    snake.forEach((segment, index) => {
      const isHead = index === snake.length - 1;
      ctx.fillStyle = isHead ? COLORS.snakeHead : COLORS.snake;
      roundedRect(
        ctx,
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        4,
      );
    });

    // IDLE overlay
    if (gameState === "IDLE") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px monospace";
      ctx.fillText("SNAKE", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px monospace";
      ctx.fillText(
        "Press Space to Start",
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 20,
      );
    }

    // Game Over overlay
    if (gameState === "GAME_OVER") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px monospace";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.fillStyle = COLORS.score;
      ctx.font = "22px monospace";
      ctx.fillText(
        `Score: ${score}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 5,
      );

      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px monospace";
      ctx.fillText(
        "Press R to Restart",
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 50,
      );
    }
  }, [snake, food, score, gameState, renderTick]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="font-mono text-xl font-bold text-game-score">
        Score: {score}
      </div>
      <canvas
        ref={canvasRef}
        className="w-[600px] h-[400px] rounded border-2 border-game-border"
      />
      <div className="text-sm font-mono text-slate-400">
        Arrow Keys / WASD to move
      </div>
    </div>
  );
}
