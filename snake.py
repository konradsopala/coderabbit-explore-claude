#!/usr/bin/env python3
"""Classic Snake game using curses."""

from __future__ import annotations

import curses
import random
from collections import deque

# Directions
UP = (-1, 0)
DOWN = (1, 0)
LEFT = (0, -1)
RIGHT = (0, 1)


def main(stdscr: curses.window) -> None:
    curses.curs_set(0)
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_GREEN, -1)   # snake body
    curses.init_pair(2, curses.COLOR_RED, -1)      # food
    curses.init_pair(3, curses.COLOR_YELLOW, -1)   # score
    curses.init_pair(4, curses.COLOR_CYAN, -1)     # border

    while True:
        result = game_loop(stdscr)
        if result == "quit":
            break


def game_loop(stdscr: curses.window) -> str:
    stdscr.clear()
    stdscr.nodelay(True)
    stdscr.timeout(100)

    max_y, max_x = stdscr.getmaxyx()

    # Play area (inside the border)
    min_row, max_row = 2, max_y - 2
    min_col, max_col = 1, max_x - 2

    if max_row - min_row < 5 or max_col - min_col < 10:
        stdscr.addstr(0, 0, "Terminal too small! Resize and restart.")
        stdscr.nodelay(False)
        stdscr.getch()
        return "quit"

    # Draw border
    draw_border(stdscr, max_y, max_x)

    # Initial snake in the center
    center_y = (min_row + max_row) // 2
    center_x = (min_col + max_col) // 2
    snake = deque([(center_y, center_x - 2),
                   (center_y, center_x - 1),
                   (center_y, center_x)])
    direction = RIGHT
    score = 0

    # Place first food
    food = place_food(snake, min_row, max_row, min_col, max_col)

    # Draw initial state
    for y, x in snake:
        stdscr.addch(y, x, "O", curses.color_pair(1) | curses.A_BOLD)
    stdscr.addch(food[0], food[1], "*", curses.color_pair(2) | curses.A_BOLD)
    draw_score(stdscr, score, max_x)
    stdscr.refresh()

    while True:
        key = stdscr.getch()

        if key == ord("q"):
            return "quit"

        new_dir = direction
        if key == curses.KEY_UP or key == ord("w"):
            new_dir = UP
        elif key == curses.KEY_DOWN or key == ord("s"):
            new_dir = DOWN
        elif key == curses.KEY_LEFT or key == ord("a"):
            new_dir = LEFT
        elif key == curses.KEY_RIGHT or key == ord("d"):
            new_dir = RIGHT

        # Prevent reversing into yourself
        if (new_dir[0] + direction[0], new_dir[1] + direction[1]) != (0, 0):
            direction = new_dir

        # Move snake
        head_y, head_x = snake[-1]
        new_head = (head_y + direction[0], head_x + direction[1])

        # Check wall collision
        if (new_head[0] <= min_row - 1 or new_head[0] >= max_row + 1 or
                new_head[1] <= min_col - 1 or new_head[1] >= max_col + 1):
            return game_over(stdscr, score, max_y, max_x)

        # Check self collision
        if new_head in snake:
            return game_over(stdscr, score, max_y, max_x)

        snake.append(new_head)
        stdscr.addch(new_head[0], new_head[1], "O",
                     curses.color_pair(1) | curses.A_BOLD)

        # Check food
        if new_head == food:
            score += 10
            draw_score(stdscr, score, max_x)
            food = place_food(snake, min_row, max_row, min_col, max_col)
            if food is None:
                # Board is full — you win!
                return game_over(stdscr, score, max_y, max_x, won=True)
            stdscr.addch(food[0], food[1], "*",
                         curses.color_pair(2) | curses.A_BOLD)
            # Speed up slightly
            new_timeout = max(40, 100 - score // 2)
            stdscr.timeout(new_timeout)
        else:
            tail = snake.popleft()
            stdscr.addch(tail[0], tail[1], " ")

        stdscr.refresh()


def draw_border(stdscr: curses.window, max_y: int, max_x: int) -> None:
    color = curses.color_pair(4)
    # Top and bottom
    for x in range(max_x - 1):
        stdscr.addch(1, x, curses.ACS_HLINE, color)
        stdscr.addch(max_y - 2, x, curses.ACS_HLINE, color)
    # Left and right
    for y in range(1, max_y - 1):
        stdscr.addch(y, 0, curses.ACS_VLINE, color)
        try:
            stdscr.addch(y, max_x - 1, curses.ACS_VLINE, color)
        except curses.error:
            pass  # bottom-right corner can error
    # Corners
    stdscr.addch(1, 0, curses.ACS_ULCORNER, color)
    try:
        stdscr.addch(1, max_x - 1, curses.ACS_URCORNER, color)
    except curses.error:
        pass
    stdscr.addch(max_y - 2, 0, curses.ACS_LLCORNER, color)
    try:
        stdscr.addch(max_y - 2, max_x - 1, curses.ACS_LRCORNER, color)
    except curses.error:
        pass


def draw_score(stdscr: curses.window, score: int, max_x: int) -> None:
    text = f" Score: {score} "
    x = (max_x - len(text)) // 2
    stdscr.addstr(0, x, text, curses.color_pair(3) | curses.A_BOLD)


def place_food(snake: deque, min_row: int, max_row: int,
               min_col: int, max_col: int) -> tuple[int, int] | None:
    occupied = set(snake)
    free = [(r, c) for r in range(min_row, max_row + 1)
            for c in range(min_col, max_col + 1) if (r, c) not in occupied]
    if not free:
        return None
    return random.choice(free)


def game_over(stdscr: curses.window, score: int,
              max_y: int, max_x: int, won: bool = False) -> str:
    msg = "YOU WIN!" if won else "GAME OVER"
    score_msg = f"Final Score: {score}"
    prompt = "[R]estart  [Q]uit"

    cy = max_y // 2
    stdscr.addstr(cy - 1, (max_x - len(msg)) // 2, msg, curses.A_BOLD)
    stdscr.addstr(cy, (max_x - len(score_msg)) // 2, score_msg)
    stdscr.addstr(cy + 1, (max_x - len(prompt)) // 2, prompt)
    stdscr.nodelay(False)
    stdscr.refresh()

    while True:
        key = stdscr.getch()
        if key == ord("r"):
            return "restart"
        if key == ord("q"):
            return "quit"


if __name__ == "__main__":
    curses.wrapper(main)
