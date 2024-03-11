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
	isPlaying: Boolean
	interval = 0
	gamePad: HTMLDivElement | null = null
	constructor(board: Board, canvas: HTMLCanvasElement, settings: GameSettings) {
		this.canvas = canvas;
		this.settings = settings;
		this.board = board;
		this.isPlaying = false

		this.InitCanvas();
		this.DrawBoard()
	}

	Start() {
		this.isPlaying = true
		this.DrawBoard();

		if (this.gamePad) (this.gamePad.getElementsByClassName("play-btn")[0] as HTMLImageElement).src = "/pause.svg"

		this.interval = setInterval(() => {
			this.board.Forward();
			this.DrawBoard();
		}, 1000 / this.settings.ticks);
	}

	Stop() {
		if (this.gamePad) (this.gamePad.getElementsByClassName("play-btn")[0] as HTMLImageElement).src = "/play.svg"

		this.isPlaying = false
		clearInterval(this.interval)
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

	InitGamepad() {
		const gamepad = document.createElement("div")
		gamepad.className = "gamepad"

		const title = document.createElement("p")
		title.className = "title"
		title.innerText = "Settings"

		const playBtn = document.createElement("img")
		playBtn.className = "play-btn"
		playBtn.src = "./play.svg"
		playBtn.addEventListener("click", () => {
			if (this.isPlaying) {
				this.Stop()
				playBtn.src = "./play.svg"
			} else {
				this.Start()
				playBtn.src = "./pause.svg"
			}
		})

		const tickDiv = document.createElement("div")
		tickDiv.className = "ticks-div"
		const tickText = document.createElement("p")
		tickText.innerText = "ticks/s"
		const tickBox = document.createElement("input")
		tickBox.type = "number"
		tickBox.value = this.settings.ticks.toString()
		tickBox.addEventListener("input", () => {
			const newValue = parseInt(tickBox.value)
			if (!isNaN(newValue) && newValue > 0) {
				tickBox.classList.remove("invalid")
				this.settings.ticks = newValue
				this.Stop()
				this.Start()
			} else {
				tickBox.classList.add("invalid")
			}
		})

		const resetBtn = document.createElement("p")
		resetBtn.innerText = "Reset"
		resetBtn.className = "reset-btn"
		resetBtn.addEventListener("click", () => {
			this.Stop()
			this.settings.ticks = 10
			tickBox.value = "10"
			this.board = new Board(this.board.width, this.board.height)
			this.DrawBoard()
		})

		tickDiv.append(tickBox, tickText)
		gamepad.append(title, playBtn, tickDiv, resetBtn)

		document.getElementById("app")?.appendChild(gamepad)
	}
}
