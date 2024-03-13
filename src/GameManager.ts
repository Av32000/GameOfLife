import { Board } from './Board';

export type GameSettings = {
	canvasSize: { width: number; height: number };
	ticks: number;
	cellColor: string;
	importCellColor: string;
};

export class GameManager {
	canvas: HTMLCanvasElement;
	settings: GameSettings;
	board: Board;
	isPlaying: Boolean;
	interval = 0;
	gamePad: HTMLDivElement | null = null;

	currentImport: string;
	importCoord: { x: number; y: number };
	exportCoordStart: { x: number; y: number };
	exportCoordEnd: { x: number; y: number };

	constructor(board: Board, canvas: HTMLCanvasElement, settings: GameSettings, initCanvas = true) {
		this.canvas = canvas;
		this.settings = settings;
		this.board = board;
		this.isPlaying = false;
		this.currentImport = '';
		this.importCoord = { x: 0, y: 0 };
		this.exportCoordStart = { x: 0, y: 0 };
		this.exportCoordEnd = { x: 1, y: 1 };

		if (initCanvas) {
			this.InitCanvas();
			this.DrawBoard();
		}
	}

	Start() {
		this.isPlaying = true;
		this.DrawBoard();

		if (this.gamePad)
			(this.gamePad.getElementsByClassName('play-btn')[0] as HTMLImageElement).src = './pause.svg';

		this.interval = setInterval(() => {
			this.board.Forward();
			this.DrawBoard();
		}, 1000 / this.settings.ticks);
	}

	Stop() {
		if (this.gamePad)
			(this.gamePad.getElementsByClassName('play-btn')[0] as HTMLImageElement).src = './play.svg';

		this.isPlaying = false;
		clearInterval(this.interval);
	}

	DrawBoard() {
		const context = this.canvas.getContext('2d');
		const importSize = this.currentImport ? this.board.GetPatternSize(this.currentImport) : null;

		// Color Snippets
		let hex2rgb = (c: string) =>
			`${c.match(/\w\w/g)?.map(x => (isNaN(parseInt(x, 16)) ? 0 : parseInt(x, 16)))}`;
		let rgb2hex = (c: string) =>
			'#' +
			c
				.match(/\d+/g)
				?.map(x => (+x).toString(16).padStart(2))
				.join(``);
		const overlayColors = (c1: string, c2: string, alpha: number) =>
			rgb2hex(
				`rgb(${Math.round(
					parseInt(hex2rgb(c2).split(',')[0]) * alpha +
						parseInt(hex2rgb(c1).split(',')[0]) * (1 - alpha),
				)},${Math.round(
					parseInt(hex2rgb(c2).split(',')[1]) * alpha +
						parseInt(hex2rgb(c1).split(',')[1]) * (1 - alpha),
				)},${Math.round(
					parseInt(hex2rgb(c2).split(',')[2]) * alpha +
						parseInt(hex2rgb(c1).split(',')[2]) * (1 - alpha),
				)})`,
			);

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
				if (
					(importSize &&
						x >= this.importCoord.x &&
						x < this.importCoord.x + importSize.width &&
						y >= this.importCoord.y &&
						y < this.importCoord.y + importSize.height) ||
					(!(document.querySelector('.export-div') as HTMLInputElement).classList.contains(
						'hidden',
					) &&
						x >= this.exportCoordStart.x &&
						x <= this.exportCoordEnd.x &&
						y >= this.exportCoordStart.y &&
						y <= this.exportCoordEnd.y)
				) {
					context.fillStyle = this.board.GetCell({ x, y })
						? overlayColors(this.settings.cellColor, this.settings.importCellColor, 0.6)
						: this.settings.importCellColor;
				}
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

		let mouseDown = false;
		let mouseX: number;
		let mouseY: number;

		this.canvas.addEventListener('mousedown', event => {
			mouseDown = true;

			const handleClick = () => {
				const boundingRect = this.canvas.getBoundingClientRect();
				const offsetX = mouseX - boundingRect.left;
				const offsetY = mouseY - boundingRect.top;

				const x = Math.floor((offsetX * this.board.width) / this.canvas.width);
				const y = Math.floor((offsetY * this.board.height) / this.canvas.width);

				this.board.SetCell({ x, y }, event.button == 0);
				this.DrawBoard();
			};

			handleClick();

			const interval = setInterval(() => {
				if (mouseDown) {
					handleClick();
				} else {
					clearInterval(interval);
				}
			}, 50);
		});

		this.canvas.addEventListener('mouseup', () => {
			mouseDown = false;
		});

		this.canvas.addEventListener('contextmenu', e => e.preventDefault());

		document.addEventListener('mousemove', event => {
			mouseX = event.clientX;
			mouseY = event.clientY;
		});
	}

	InitGamepad() {
		const playBtn = document.querySelector('.gamepad .play-btn') as HTMLImageElement;
		playBtn.addEventListener('click', () => {
			if (this.isPlaying) {
				this.Stop();
				playBtn.src = './play.svg';
			} else {
				this.Start();
				playBtn.src = './pause.svg';
			}
		});

		const tickBox = document.querySelector('.gamepad .ticks-div input') as HTMLInputElement;
		tickBox.value = this.settings.ticks.toString();
		tickBox.addEventListener('input', () => {
			const newValue = parseInt(tickBox.value);
			if (!isNaN(newValue) && newValue > 0) {
				tickBox.classList.remove('invalid');
				this.settings.ticks = newValue;
				if (this.isPlaying) {
					this.Stop();
					this.Start();
				}
			} else {
				tickBox.classList.add('invalid');
			}
		});

		const boardXBox = document.querySelector('.gamepad .board-div #board-x') as HTMLInputElement;
		const boardYBox = document.querySelector('.gamepad .board-div #board-y') as HTMLInputElement;
		boardXBox.value = this.board.width.toString();
		boardXBox.addEventListener('input', () => {
			const newValue = parseInt(boardXBox.value);
			if (!isNaN(newValue) && newValue > 0) {
				boardXBox.classList.remove('invalid');
				this.board.width = newValue;
				this.board.ResetBoard();
				this.DrawBoard();
				if (this.isPlaying) {
					this.Stop();
					this.Start();
				}
			} else {
				boardXBox.classList.add('invalid');
			}
		});

		boardYBox.value = this.board.height.toString();
		boardYBox.addEventListener('input', () => {
			const newValue = parseInt(boardYBox.value);
			if (!isNaN(newValue) && newValue > 0) {
				boardYBox.classList.remove('invalid');
				this.board.height = newValue;
				this.board.ResetBoard();
				this.DrawBoard();
				if (this.isPlaying) {
					this.Stop();
					this.Start();
				}
			} else {
				boardYBox.classList.add('invalid');
			}
		});

		const cellColorBox = document.querySelector('.gamepad .color-div input') as HTMLInputElement;
		cellColorBox.value = this.settings.cellColor;
		cellColorBox.addEventListener('change', () => {
			this.settings.cellColor = cellColorBox.value;
			this.DrawBoard();
		});

		const importBtn = document.querySelector(
			'.gamepad .files-div .import-btn',
		) as HTMLParagraphElement;
		const exportBtn = document.querySelector(
			'.gamepad .files-div .export-btn',
		) as HTMLParagraphElement;
		importBtn.addEventListener('click', () => {
			(document.querySelector('.import-div') as HTMLDivElement).classList.remove('hidden');
		});
		exportBtn.addEventListener('click', () => {
			(document.querySelector('.export-div') as HTMLDivElement).classList.remove('hidden');
			this.DrawBoard();
		});

		const resetBtn = document.querySelector('.gamepad .reset-btn') as HTMLParagraphElement;
		resetBtn.addEventListener('click', () => {
			this.Stop();
			playBtn.src = './play.svg';
			this.settings.ticks = 10;
			tickBox.value = '10';
			this.board = new Board(this.board.width, this.board.height);
			this.DrawBoard();
		});
	}

	InitImportDiv() {
		const importDiv = document.querySelector('.import-div') as HTMLDivElement;
		const coordXInput = document.querySelector('.import-div .coord #coord-x') as HTMLInputElement;
		const coordYInput = document.querySelector('.import-div .coord #coord-y') as HTMLInputElement;

		coordXInput.value = this.importCoord.x.toString();
		coordXInput.min = '0';
		coordXInput.addEventListener('input', () => {
			const newValue = parseInt(coordXInput.value);
			const patternSize = this.board.GetPatternSize(this.currentImport) || { width: 0, height: 0 };

			if (!isNaN(newValue) && newValue >= 0 && newValue <= this.board.width - patternSize.width) {
				coordXInput.classList.remove('invalid');
				this.importCoord.x = newValue;
				this.DrawBoard();
			} else {
				coordXInput.classList.add('invalid');
			}
		});

		coordYInput.value = this.importCoord.y.toString();
		coordYInput.min = '0';
		coordYInput.addEventListener('input', () => {
			const newValue = parseInt(coordYInput.value);
			const patternSize = this.board.GetPatternSize(this.currentImport) || { width: 0, height: 0 };

			if (!isNaN(newValue) && newValue >= 0 && newValue <= this.board.height - patternSize.height) {
				coordYInput.classList.remove('invalid');
				this.importCoord.y = newValue;
				this.DrawBoard();
			} else {
				coordYInput.classList.add('invalid');
			}
		});

		const closeBtn = document.querySelector('.import-div .close-btn') as HTMLParagraphElement;
		closeBtn.addEventListener('click', () => {
			this.importCoord = { x: 0, y: 0 };
			this.currentImport = '';
			coordXInput.value = '0';
			coordYInput.value = '0';
			importInput.value = '';
			importDiv.classList.add('hidden');
			this.DrawBoard();
		});

		const importInput = document.querySelector('.import-div #file') as HTMLInputElement;
		importInput.addEventListener('change', () => {
			if (!importInput.files) return;
			const file = importInput.files[0];

			if (file) {
				const reader = new FileReader();

				reader.onload = event => {
					if (!event.target) return;
					this.currentImport = event.target.result as string;
					coordXInput.value = '0';
					coordYInput.value = '0';
					this.DrawBoard();
				};

				reader.readAsText(file);
			}
		});

		const importBtn = document.querySelector('.import-div .import-btn') as HTMLParagraphElement;
		importBtn.addEventListener('click', () => {
			if (this.currentImport) {
				this.board.ImportPattern(this.currentImport, {
					x: this.importCoord.x,
					y: this.importCoord.y,
				});
				this.importCoord = { x: 0, y: 0 };
				this.currentImport = '';
				coordXInput.value = '0';
				coordYInput.value = '0';
				importInput.value = '';
				importDiv.classList.add('hidden');
				this.DrawBoard();
			}
		});
	}

	InitExportDiv() {
		const exportDiv = document.querySelector('.export-div') as HTMLDivElement;
		const coordXInputStart = document.querySelector(
			'.export-div .start-coord #coord-x',
		) as HTMLInputElement;
		const coordYInputStart = document.querySelector(
			'.export-div .start-coord #coord-y',
		) as HTMLInputElement;
		const coordXInputEnd = document.querySelector(
			'.export-div .end-coord #coord-x',
		) as HTMLInputElement;
		const coordYInputEnd = document.querySelector(
			'.export-div .end-coord #coord-y',
		) as HTMLInputElement;

		let exportName = '';

		coordXInputStart.value = this.exportCoordStart.x.toString();
		coordXInputStart.min = '0';
		coordXInputStart.max = this.board.width.toString();
		coordXInputStart.addEventListener('input', () => {
			const newValue = parseInt(coordXInputStart.value);
			if (!isNaN(newValue) && newValue >= 0 && newValue < this.exportCoordEnd.x) {
				coordXInputStart.classList.remove('invalid');
				this.exportCoordStart.x = newValue;
				this.DrawBoard();
			} else {
				coordXInputStart.classList.add('invalid');
			}
		});

		coordYInputStart.value = this.exportCoordStart.y.toString();
		coordYInputStart.min = '0';
		coordYInputStart.max = this.board.height.toString();
		coordYInputStart.addEventListener('input', () => {
			const newValue = parseInt(coordYInputStart.value);
			if (!isNaN(newValue) && newValue >= 0 && newValue < this.exportCoordEnd.y) {
				coordYInputStart.classList.remove('invalid');
				this.exportCoordStart.y = newValue;
				this.DrawBoard();
			} else {
				coordYInputStart.classList.add('invalid');
			}
		});

		coordXInputEnd.value = this.exportCoordEnd.x.toString();
		coordXInputEnd.min = '0';
		coordXInputEnd.max = this.board.width.toString();
		coordXInputEnd.addEventListener('input', () => {
			const newValue = parseInt(coordXInputEnd.value);
			if (!isNaN(newValue) && newValue >= 0 && newValue < this.board.width) {
				coordXInputEnd.classList.remove('invalid');
				this.exportCoordEnd.x = newValue;
				this.DrawBoard();
			} else {
				coordXInputEnd.classList.add('invalid');
			}
		});

		coordYInputEnd.value = this.exportCoordEnd.y.toString();
		coordYInputEnd.min = '0';
		coordYInputEnd.max = this.board.height.toString();
		coordYInputEnd.addEventListener('input', () => {
			const newValue = parseInt(coordYInputEnd.value);
			if (!isNaN(newValue) && newValue >= 0 && newValue < this.board.height) {
				coordYInputEnd.classList.remove('invalid');
				this.exportCoordEnd.y = newValue;
				this.DrawBoard();
			} else {
				coordYInputEnd.classList.add('invalid');
			}
		});

		const closeBtn = document.querySelector('.export-div .close-btn') as HTMLParagraphElement;
		closeBtn.addEventListener('click', () => {
			this.exportCoordStart = { x: 0, y: 0 };
			this.exportCoordEnd = { x: 1, y: 1 };
			coordXInputStart.value = '0';
			coordYInputStart.value = '0';
			coordXInputEnd.value = '1';
			coordYInputEnd.value = '1';
			exportName = '';
			exportInput.value = '';
			exportDiv.classList.add('hidden');
			this.DrawBoard();
		});

		const exportInput = document.querySelector(
			'.export-div .export-name-div #export-name',
		) as HTMLInputElement;
		exportInput.addEventListener('change', () => {
			exportName = exportInput.value;
		});

		const exportBtn = document.querySelector('.export-div .export-btn') as HTMLParagraphElement;
		exportBtn.addEventListener('click', () => {
			var blob = new Blob(
				[this.board.ExportPattern(this.exportCoordStart, this.exportCoordEnd, exportName)],
				{
					type: 'text/plain',
				},
			);
			var downloadLink = document.createElement('a');
			downloadLink.href = URL.createObjectURL(blob);
			downloadLink.download = (exportName || 'pattern') + '.rle';
			downloadLink.style.display = 'none';
			document.body.appendChild(downloadLink);
			downloadLink.click();
			downloadLink.remove();

			this.exportCoordStart = { x: 0, y: 0 };
			this.exportCoordEnd = { x: 1, y: 1 };
			coordXInputStart.value = '0';
			coordYInputStart.value = '0';
			coordXInputEnd.value = '1';
			coordYInputEnd.value = '1';
			exportName = '';
			exportInput.value = '';
			exportDiv.classList.add('hidden');
			this.DrawBoard();
		});
	}
}
