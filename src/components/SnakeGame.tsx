import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const SPEED = 100; // ms per move

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastMoveTime = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [shake, setShake] = useState(false);

  const gameState = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    direction: { x: 0, y: -1 },
    nextDirection: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    particles: [] as Particle[],
    gameOver: false,
    paused: true,
    score: 0
  });

  const generateFood = (snake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
    }
    return newFood;
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: Math.random() * 30 + 20,
        color
      });
    }
    gameState.current.particles.push(...newParticles);
  };

  const resetGame = () => {
    gameState.current = {
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      direction: { x: 0, y: -1 },
      nextDirection: { x: 0, y: -1 },
      food: generateFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]),
      particles: [],
      gameOver: false,
      paused: false,
      score: 0
    };
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setShake(false);
    lastMoveTime.current = performance.now();
  };

  const triggerGameOver = () => {
    gameState.current.gameOver = true;
    setIsGameOver(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    if (gameState.current.score > highScore) {
      setHighScore(gameState.current.score);
    }
  };

  const update = (time: number) => {
    if (!lastFrameTime.current) lastFrameTime.current = time;
    const deltaTime = time - lastFrameTime.current;
    lastFrameTime.current = time;

    const state = gameState.current;

    // Update particles
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
    });
    state.particles = state.particles.filter(p => p.life < p.maxLife);

    if (!state.paused && !state.gameOver) {
      if (time - lastMoveTime.current > SPEED) {
        lastMoveTime.current = time;
        state.direction = state.nextDirection;

        const head = { ...state.snake[0] };
        head.x += state.direction.x;
        head.y += state.direction.y;

        // Collisions
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || 
            state.snake.some(s => s.x === head.x && s.y === head.y)) {
          triggerGameOver();
        } else {
          state.snake.unshift(head);
          if (head.x === state.food.x && head.y === state.food.y) {
            state.score += 10;
            setScore(state.score);
            spawnParticles(head.x, head.y, '#FF00FF');
            state.food = generateFood(state.snake);
          } else {
            state.snake.pop();
          }
        }
      }
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#FF00FF';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF00FF';
    ctx.fillRect(state.food.x * CELL_SIZE + 2, state.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Draw Snake
    state.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF';
      ctx.shadowBlur = index === 0 ? 20 : 10;
      ctx.shadowColor = '#00FFFF';
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    // Draw Particles
    state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = p.color;
      ctx.globalAlpha = 1 - (p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const state = gameState.current;

      if (e.key === ' ' && state.gameOver) {
        resetGame();
        return;
      }

      if (e.key === ' ' && !state.gameOver) {
        state.paused = !state.paused;
        setIsPaused(state.paused);
        return;
      }

      if (state.paused) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (state.direction.y !== 1) state.nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (state.direction.y !== -1) state.nextDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (state.direction.x !== 1) state.nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (state.direction.x !== -1) state.nextDirection = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`flex flex-col items-center w-full max-w-md mx-auto p-4 border-2 border-[#00ffff] bg-black relative ${shake ? 'shake' : ''}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-4 font-mono text-2xl">
        <div className="flex flex-col">
          <span className="text-[#ff00ff]">SCORE</span>
          <span className="text-[#00ffff]">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#ff00ff]">HI-SCORE</span>
          <span className="text-[#00ffff]">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative border-2 border-[#ff00ff] w-full aspect-square bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="w-full h-full block"
        />

        {/* Overlays */}
        {(isGameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 font-mono">
            {isGameOver ? (
              <>
                <h2 className="text-4xl text-[#ff00ff] mb-2 glitch-text">SYSTEM FAILURE</h2>
                <p className="text-[#00ffff] mb-6 text-xl">SCORE: {score.toString().padStart(4, '0')}</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-colors uppercase text-xl cursor-pointer"
                >
                  REBOOT
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl text-[#00ffff] mb-6 glitch-text">AWAITING INPUT</h2>
                <button 
                  onClick={() => {
                    gameState.current.paused = false;
                    setIsPaused(false);
                  }}
                  className="px-6 py-2 border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black transition-colors uppercase text-xl cursor-pointer"
                >
                  INITIALIZE
                </button>
                <p className="mt-6 text-[#00ffff]/50 text-sm">WASD / ARROWS TO OVERRIDE</p>
                <p className="text-[#00ffff]/50 text-sm mt-1">SPACE TO HALT</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
