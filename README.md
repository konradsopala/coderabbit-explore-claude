# Snake

Classic Snake game in two flavors: a Python terminal version and a Next.js browser version.

## Terminal Version (Python)

### Requirements

- Python 3.6+
- No external dependencies

### How to Run

```bash
python3 snake.py
```

### Controls

| Key              | Action     |
|------------------|------------|
| Arrow keys / WASD | Move       |
| Q                | Quit       |
| R                | Restart (after game over) |

## Browser Version (Next.js)

### Requirements

- Node.js 18+

### How to Run

```bash
cd snake-next
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Controls

| Key              | Action     |
|------------------|------------|
| Arrow keys / WASD | Move       |
| Space            | Start game |
| R                | Restart (after game over) |

## Gameplay

- Eat the food to grow your snake and earn points (+10 each).
- The snake speeds up as your score increases.
- Avoid hitting the walls or your own tail.
