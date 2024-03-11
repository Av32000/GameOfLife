import { Board } from './Board';
import { GameManager, GameSettings } from './GameManager';
import './style.css';

function Init() {
	const canvas = document.createElement('canvas');
	document.getElementById('app')?.appendChild(canvas);

	const board = new Board(50, 50);

	const settings: GameSettings = {
		canvasSize: { width: window.innerWidth, height: window.innerWidth },
		cellColor: 'blue',
		ticks: 1,
	};

	const gameManager = new GameManager(board, canvas, settings);
	gameManager.InitGamepad()
}

Init()