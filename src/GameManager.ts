import { Board } from './Board';

type GameSettings = {
	ticks: number;
	cellColor: string;
};

export class GameManager {
	canvas: HTMLCanvasElement;
	settings: GameSettings;
	board: Board;
	constructor(board: Board, canvas: HTMLCanvasElement, settings: GameSettings) {
		this.canvas = canvas;
		this.settings = settings;
		this.board = board;
	}

	Start() {
		this.DrawBoard();
		setInterval(() => {
			this.board.Forward();
			this.DrawBoard();
		}, 1000 / this.settings.ticks);
	}

	DrawBoard() {
		const context = this.canvas.getContext('2d');

		if (!context) throw new Error('Invalid Context');

		const canvasWidth = this.canvas.width;
		const canvasHeight = this.canvas.height;
		const boardWidth = this.board.width;
		const boardHeight = this.board.height;

		const cellWidth = canvasWidth / boardWidth;
		const cellHeight = canvasHeight / boardHeight;

		this.ClearBoard();
		context.strokeStyle = 'lightgray';
		context.lineWidth = 1;

		for (let x = 0; x < boardWidth; x++) {
			for (let y = 0; y < boardHeight; y++) {
				context.fillStyle = this.board.GetCell({ x, y }) ? this.settings.cellColor : 'white';
				context.fillRect(cellWidth * x, cellHeight * y, cellWidth, cellHeight);
				context.strokeRect(cellWidth * x, cellHeight * y, cellWidth, cellHeight);
			}
		}
	}

	ClearBoard() {
		const context = this.canvas.getContext('2d');

		if (context) {
			context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}
}
