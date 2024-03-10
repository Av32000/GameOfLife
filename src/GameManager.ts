import { Board } from './Board';

export type GameSettings = {
	canvasSize: { width: number; height: number };
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

		this.InitCanvas();
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

	InitCanvas() {
		this.canvas.width = this.settings.canvasSize.width;
		this.canvas.height = this.settings.canvasSize.height;

		this.canvas.addEventListener('click', event => {
			const boundingRect = this.canvas.getBoundingClientRect();
			const offsetX = event.clientX - boundingRect.left;
			const offsetY = event.clientY - boundingRect.top;

			const x = Math.floor((offsetX * this.board.width) / this.canvas.width);
			const y = Math.floor((offsetY * this.board.height) / this.canvas.width);

			this.board.SetCell({ x, y }, true);
			this.DrawBoard();
		});

		this.canvas.addEventListener('contextmenu', event => {
			event.preventDefault();

			const boundingRect = this.canvas.getBoundingClientRect();
			const offsetX = event.clientX - boundingRect.left;
			const offsetY = event.clientY - boundingRect.top;

			const x = Math.floor((offsetX * this.board.width) / this.canvas.width);
			const y = Math.floor((offsetY * this.board.height) / this.canvas.width);

			this.board.SetCell({ x, y }, false);
			this.DrawBoard();
		});
	}
}
