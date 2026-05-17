'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const COLS = 10;
const ROWS = 20;
const CELL = 28;

type Cell = number; // 0 = empty, 1..7 = piece index
type Board = Cell[][];

const SHAPES: number[][][][] = [
  // I
  [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  // O
  [[[1, 1], [1, 1]]],
  // T
  [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  // S
  [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
  ],
  // Z
  [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ],
  // J
  [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]],
  ],
  // L
  [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]],
  ],
];

// Palette de roses (index 1..7)
const COLORS = [
  'transparent',
  '#ff7ab8', // I - rose vif
  '#ffb3d9', // O - rose pâle
  '#ff4fa3', // T - rose magenta
  '#ff9ec7', // S - rose pastel
  '#e91e63', // Z - rose foncé
  '#ffc1e3', // J - rose poudré
  '#f06292', // L - rose framboise
];

type Piece = {
  type: number; // 0..6
  rot: number;
  x: number;
  y: number;
};

const emptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));

const randomPiece = (): Piece => {
  const type = Math.floor(Math.random() * SHAPES.length);
  const shape = SHAPES[type][0];
  return {
    type,
    rot: 0,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
  };
};

const getShape = (p: Piece) => SHAPES[p.type][p.rot % SHAPES[p.type].length];

const collides = (board: Board, p: Piece): boolean => {
  const shape = getShape(p);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const x = p.x + c;
      const y = p.y + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
  }
  return false;
};

const merge = (board: Board, p: Piece): Board => {
  const next = board.map((row) => [...row]);
  const shape = getShape(p);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const y = p.y + r;
        const x = p.x + c;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          next[y][x] = p.type + 1;
        }
      }
    }
  }
  return next;
};

const clearLines = (board: Board): { board: Board; cleared: number } => {
  const remaining = board.filter((row) => row.some((c) => c === 0));
  const cleared = ROWS - remaining.length;
  const newRows = Array.from({ length: cleared }, () => Array<Cell>(COLS).fill(0));
  return { board: [...newRows, ...remaining], cleared };
};

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);

  const boardRef = useRef<Board>(emptyBoard());
  const pieceRef = useRef<Piece>(randomPiece());
  const nextRef = useRef<Piece>(randomPiece());
  const dropAccumRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fond
    ctx.fillStyle = '#1a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grille
    ctx.strokeStyle = 'rgba(255, 122, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    const drawCell = (x: number, y: number, colorIdx: number) => {
      if (!colorIdx) return;
      const px = x * CELL;
      const py = y * CELL;
      ctx.fillStyle = COLORS[colorIdx];
      ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      // reflet
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(px + 2, py + 2, CELL - 4, 4);
      // bord
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 1.5, py + 1.5, CELL - 3, CELL - 3);
    };

    // Board
    const board = boardRef.current;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x]) drawCell(x, y, board[y][x]);
      }
    }

    // Ghost piece
    const p = pieceRef.current;
    const ghost: Piece = { ...p };
    while (!collides(board, { ...ghost, y: ghost.y + 1 })) {
      ghost.y++;
    }
    const ghostShape = getShape(ghost);
    ctx.fillStyle = 'rgba(255, 122, 184, 0.18)';
    for (let r = 0; r < ghostShape.length; r++) {
      for (let c = 0; c < ghostShape[r].length; c++) {
        if (ghostShape[r][c]) {
          const x = ghost.x + c;
          const y = ghost.y + r;
          if (y >= 0) {
            ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
          }
        }
      }
    }

    // Piece active
    const shape = getShape(p);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          drawCell(p.x + c, p.y + r, p.type + 1);
        }
      }
    }
  }, []);

  const drawNext = useCallback(() => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const p = nextRef.current;
    const shape = SHAPES[p.type][0];
    const w = shape[0].length;
    const h = shape.length;
    const cell = 20;
    const offX = (canvas.width - w * cell) / 2;
    const offY = (canvas.height - h * cell) / 2;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        if (shape[r][c]) {
          const px = offX + c * cell;
          const py = offY + r * cell;
          ctx.fillStyle = COLORS[p.type + 1];
          ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(px + 2, py + 2, cell - 4, 3);
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.strokeRect(px + 1.5, py + 1.5, cell - 3, cell - 3);
        }
      }
    }
  }, []);

  const spawn = useCallback(() => {
    pieceRef.current = nextRef.current;
    nextRef.current = randomPiece();
    if (collides(boardRef.current, pieceRef.current)) {
      gameOverRef.current = true;
      setGameOver(true);
    }
  }, []);

  const lockPiece = useCallback(() => {
    const merged = merge(boardRef.current, pieceRef.current);
    const { board: cleared, cleared: count } = clearLines(merged);
    boardRef.current = cleared;
    if (count > 0) {
      const points = [0, 40, 100, 300, 1200][count] * levelRef.current;
      scoreRef.current += points;
      linesRef.current += count;
      const newLevel = Math.floor(linesRef.current / 10) + 1;
      levelRef.current = newLevel;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(newLevel);
    }
    spawn();
  }, [spawn]);

  const tryMove = useCallback((dx: number, dy: number) => {
    const next = { ...pieceRef.current, x: pieceRef.current.x + dx, y: pieceRef.current.y + dy };
    if (!collides(boardRef.current, next)) {
      pieceRef.current = next;
      return true;
    }
    return false;
  }, []);

  const rotate = useCallback(() => {
    const p = pieceRef.current;
    const rotations = SHAPES[p.type].length;
    const next = { ...p, rot: (p.rot + 1) % rotations };
    // wall kicks simples
    for (const dx of [0, -1, 1, -2, 2]) {
      const candidate = { ...next, x: next.x + dx };
      if (!collides(boardRef.current, candidate)) {
        pieceRef.current = candidate;
        return;
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    let dropped = 0;
    while (tryMove(0, 1)) dropped++;
    scoreRef.current += dropped * 2;
    setScore(scoreRef.current);
    lockPiece();
  }, [tryMove, lockPiece]);

  const softDrop = useCallback(() => {
    if (tryMove(0, 1)) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      lockPiece();
    }
  }, [tryMove, lockPiece]);

  const togglePause = useCallback(() => {
    if (!started || gameOverRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, [started]);

  const reset = useCallback(() => {
    boardRef.current = emptyBoard();
    pieceRef.current = randomPiece();
    nextRef.current = randomPiece();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    gameOverRef.current = false;
    pausedRef.current = false;
    dropAccumRef.current = 0;
    lastTsRef.current = null;
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
    setStarted(true);
  }, []);

  // Boucle de jeu
  useEffect(() => {
    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;

      if (!gameOverRef.current && !pausedRef.current && started) {
        dropAccumRef.current += delta;
        const interval = Math.max(80, 800 - (levelRef.current - 1) * 70);
        if (dropAccumRef.current >= interval) {
          dropAccumRef.current = 0;
          if (!tryMove(0, 1)) {
            lockPiece();
          }
        }
      }
      drawBoard();
      drawNext();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tryMove, lockPiece, drawBoard, drawNext, started]);

  // Clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reset();
        }
        return;
      }
      if (gameOverRef.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reset();
        }
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        return;
      }
      if (pausedRef.current) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          tryMove(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          tryMove(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryMove, softDrop, rotate, hardDrop, reset, started]);

  // Contrôles tactiles : swipes sur le plateau
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let lastMoveX = 0;
    let lastMoveY = 0;
    let moved = false;

    const SWIPE_THRESHOLD = 24;
    const TAP_MAX_DIST = 14;
    const TAP_MAX_TIME = 250;
    const HARD_DROP_VELOCITY = 0.9; // px/ms

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (!started || gameOverRef.current || pausedRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      lastMoveX = startX;
      lastMoveY = startY;
      startTime = performance.now();
      moved = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (!started || gameOverRef.current || pausedRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - lastMoveX;
      const dy = t.clientY - lastMoveY;

      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        tryMove(dx > 0 ? 1 : -1, 0);
        lastMoveX = t.clientX;
        lastMoveY = t.clientY;
        moved = true;
      } else if (dy >= SWIPE_THRESHOLD) {
        softDrop();
        lastMoveY = t.clientY;
        lastMoveX = t.clientX;
        moved = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!started || gameOverRef.current || pausedRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dist = Math.hypot(dx, dy);
      const dt = performance.now() - startTime;
      const vy = dy / Math.max(dt, 1);

      if (!moved && dist < TAP_MAX_DIST && dt < TAP_MAX_TIME) {
        rotate();
      } else if (dy > 60 && vy > HARD_DROP_VELOCITY && Math.abs(dx) < Math.abs(dy)) {
        hardDrop();
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [tryMove, softDrop, rotate, hardDrop, started]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(circle at 30% 20%, #4a1535 0%, #1a0a14 40%, #0a0508 100%)',
      }}
    >
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center"
            style={{
              color: '#ff7ab8',
              textShadow: '0 0 20px rgba(255, 122, 184, 0.6)',
            }}
          >
            TETRIS
          </h1>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={COLS * CELL}
              height={ROWS * CELL}
              className="rounded-lg"
              style={{
                border: '2px solid #ff7ab8',
                boxShadow: '0 0 30px rgba(255, 122, 184, 0.5), inset 0 0 20px rgba(255, 122, 184, 0.1)',
                touchAction: 'none',
                maxWidth: '100%',
                height: 'auto',
              }}
            />
            {!started && (
              <Overlay
                title="Tetris Rose"
                subtitle="Appuyez sur Entrée ou Espace pour commencer"
                onClick={reset}
                buttonLabel="Démarrer"
              />
            )}
            {started && paused && !gameOver && (
              <Overlay title="Pause" subtitle="Appuyez sur P pour reprendre" />
            )}
            {gameOver && (
              <Overlay
                title="Game Over"
                subtitle={`Score : ${score}`}
                onClick={reset}
                buttonLabel="Rejouer"
              />
            )}
          </div>

          {/* Contrôles tactiles */}
          <div className="mt-4 w-full max-w-[280px] lg:hidden select-none">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div />
              <TouchButton onPress={rotate} label="↻" sub="Rotation" />
              <div />
              <TouchButton onPress={() => tryMove(-1, 0)} label="←" sub="Gauche" />
              <TouchButton onPress={softDrop} label="↓" sub="Bas" />
              <TouchButton onPress={() => tryMove(1, 0)} label="→" sub="Droite" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TouchButton onPress={hardDrop} label="⤓" sub="Chute" />
              <TouchButton
                onPress={started && !gameOver ? togglePause : reset}
                label={!started || gameOver ? '▶' : paused ? '▶' : '⏸'}
                sub={!started ? 'Démarrer' : gameOver ? 'Rejouer' : paused ? 'Reprendre' : 'Pause'}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-[180px]">
          <Panel label="Score" value={score} />
          <Panel label="Lignes" value={lines} />
          <Panel label="Niveau" value={level} />

          <div
            className="rounded-lg p-3"
            style={{
              background: 'rgba(255, 122, 184, 0.08)',
              border: '1px solid rgba(255, 122, 184, 0.3)',
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#ffb3d9' }}>
              Suivant
            </div>
            <canvas
              ref={nextCanvasRef}
              width={120}
              height={100}
              className="rounded mx-auto block"
              style={{ background: '#1a0a14' }}
            />
          </div>

          <div
            className="rounded-lg p-3 text-xs leading-relaxed"
            style={{
              background: 'rgba(255, 122, 184, 0.08)',
              border: '1px solid rgba(255, 122, 184, 0.3)',
              color: '#ffd1e8',
            }}
          >
            <div className="font-semibold mb-2" style={{ color: '#ff7ab8' }}>
              Clavier
            </div>
            <div>← → : Déplacer</div>
            <div>↑ / X : Rotation</div>
            <div>↓ : Descente</div>
            <div>Espace : Chute</div>
            <div>P : Pause</div>
            <div className="font-semibold mt-3 mb-2" style={{ color: '#ff7ab8' }}>
              Tactile
            </div>
            <div>Glisser ← → : Déplacer</div>
            <div>Toucher : Rotation</div>
            <div>Glisser ↓ : Descente</div>
            <div>Balayer ↓ vite : Chute</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TouchButton({
  onPress,
  label,
  sub,
}: {
  onPress: () => void;
  label: string;
  sub: string;
}) {
  const handle = (e: React.PointerEvent) => {
    e.preventDefault();
    onPress();
  };
  return (
    <button
      onPointerDown={handle}
      className="flex flex-col items-center justify-center rounded-lg py-3 active:scale-95 transition-transform touch-manipulation"
      style={{
        background: 'linear-gradient(135deg, rgba(255,122,184,0.25), rgba(255,79,163,0.25))',
        border: '1px solid rgba(255, 122, 184, 0.5)',
        color: '#fff',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span className="text-2xl leading-none">{label}</span>
      <span className="text-[10px] uppercase tracking-wider mt-1" style={{ color: '#ffd1e8' }}>
        {sub}
      </span>
    </button>
  );
}

function Panel({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: 'rgba(255, 122, 184, 0.08)',
        border: '1px solid rgba(255, 122, 184, 0.3)',
      }}
    >
      <div className="text-xs uppercase tracking-wider" style={{ color: '#ffb3d9' }}>
        {label}
      </div>
      <div className="text-2xl font-bold" style={{ color: '#ff7ab8' }}>
        {value}
      </div>
    </div>
  );
}

function Overlay({
  title,
  subtitle,
  onClick,
  buttonLabel,
}: {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  buttonLabel?: string;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
      style={{ background: 'rgba(10, 5, 8, 0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="text-3xl font-bold mb-2"
        style={{ color: '#ff7ab8', textShadow: '0 0 16px rgba(255,122,184,0.6)' }}
      >
        {title}
      </div>
      {subtitle && (
        <div className="text-sm mb-4 text-center px-4" style={{ color: '#ffd1e8' }}>
          {subtitle}
        </div>
      )}
      {onClick && buttonLabel && (
        <button
          onClick={onClick}
          className="px-6 py-2 rounded-full font-semibold transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #ff7ab8, #ff4fa3)',
            color: 'white',
            boxShadow: '0 0 20px rgba(255, 122, 184, 0.5)',
          }}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
