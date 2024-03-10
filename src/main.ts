import { Board } from './Board';
import { GameManager, GameSettings } from './GameManager';
import './style.css';

const canvas = document.createElement('canvas');
document.getElementById('app')?.appendChild(canvas);

const board = new Board(50, 50);

const settings: GameSettings = {
	canvasSize: { width: 500, height: 500 },
	cellColor: 'blue',
	ticks: 0.5,
};

const gameManager = new GameManager(board, canvas, settings);

board.SetCell({ x: 2, y: 1 }, true);
board.SetCell({ x: 2, y: 2 }, true);
board.SetCell({ x: 2, y: 3 }, true);

board.SetCell({ x: 7, y: 8 }, true);
board.SetCell({ x: 8, y: 9 }, true);
board.SetCell({ x: 6, y: 10 }, true);
board.SetCell({ x: 7, y: 10 }, true);
board.SetCell({ x: 8, y: 10 }, true);

gameManager.Start();
