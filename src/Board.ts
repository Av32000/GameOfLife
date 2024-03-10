type CellCoordinates = { x: number; y: number };

export class Board {
	width: number;
	height: number;
	board: Array<Boolean>[];
	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.board = [];

		this.ResetBoard();
	}

	ResetBoard() {
		this.board = [];
		for (let x = 0; x < this.width; x++) {
			this.board.push([]);
			for (let y = 0; y < this.height; y++) {
				this.board[x].push(false);
			}
		}
	}

	SetCell({ x, y }: CellCoordinates, state: boolean) {
		if (this.board[x] != null && this.board[x][y] != null) {
			this.board[x][y] = state;
		} else {
			throw new Error(`Invalid Coordinates : {${x};${y}}`);
		}
	}

	GetCell({ x, y }: CellCoordinates) {
		if (this.board[x] != null && this.board[x][y] != null) {
			return this.board[x][y];
		} else {
			throw new Error(`Invalid Coordinates : {${x};${y}}`);
		}
	}

	Forward() {
		const newBoard: Array<Boolean>[] = [];
		for (let x = 0; x < this.width; x++) {
			newBoard.push([]);
			for (let y = 0; y < this.height; y++) {
				const isAlive = this.board[x][y];
				const neighboursCount = this.GetNeighboursCount({ x, y });

				newBoard[x].push(neighboursCount == 3 || (isAlive && neighboursCount == 2));
			}
		}

		this.board = newBoard;
	}

	GetNeighboursCount({ x, y }: CellCoordinates) {
		let result = 0;
		if (y - 1 >= 0) {
			if (x - 1 >= 0 && this.board[x - 1][y - 1]) result++;
			if (this.board[x][y - 1]) result++;
			if (x + 1 < this.width && this.board[x + 1][y - 1]) result++;
		}

		if (x - 1 >= 0 && this.board[x - 1][y]) result++;
		if (x + 1 < this.width && this.board[x + 1][y]) result++;

		if (y + 1 < this.height) {
			if (x - 1 >= 0 && this.board[x - 1][y + 1]) result++;
			if (this.board[x][y + 1]) result++;
			if (x + 1 < this.width && this.board[x + 1][y + 1]) result++;
		}

		return result;
	}
}
