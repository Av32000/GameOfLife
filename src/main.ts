import { Board } from './Board';
import { GameManager } from './GameManager';
import './style.css';

const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.getElementById('app')?.appendChild(canvas);

const board = new Board(50, 50);
const gameManager = new GameManager(board, canvas, { cellColor: 'blue', ticks: 2 });

board.SetCell({ x: 2, y: 1 }, true);
board.SetCell({ x: 2, y: 2 }, true);
board.SetCell({ x: 2, y: 3 }, true);

gameManager.Start();
