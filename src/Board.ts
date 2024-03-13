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

	GetPatternSize(patternData: string) {
		const lines = patternData.split('\n');

		for (const line of lines) {
			if (line.startsWith('x')) {
				const width = parseInt(line.split('=')[1].split(',')[0]);
				const height = parseInt(line.split('=')[2].split(',')[0]);
				if (width && !isNaN(width) && height && !isNaN(height)) return { width, height };
			}
		}

		return null;
	}

	ImportPattern(patternData: string, { x, y }: CellCoordinates) {
		const patternSize = this.GetPatternSize(patternData);
		if (!patternSize) throw new Error('Invalid Pattern');

		let fullString = '';
		patternData.split('\n').forEach(l => {
			if (!l.startsWith('#') && !l.startsWith('x')) fullString += l.trim();
		});

		let currentCount = '';
		const numbers = '0123456789';
		let currentIndexX = 0;
		let currentIndexY = 0;
		for (let chr of fullString) {
			if (numbers.includes(chr)) currentCount += chr;
			else if (chr == 'b' || chr == 'o') {
				const iter = currentCount ? parseInt(currentCount) : 1;
				for (let i = 0; i < iter; i++) {
					this.board[currentIndexX + x][currentIndexY + y] = chr == 'o';
					currentIndexX++;
				}
				currentCount = '';
			} else if (chr == '$') {
				currentIndexY += currentCount ? parseInt(currentCount) : 1;
				currentIndexX = 0;
				currentCount = '';
			} else if (chr == '!') {
				break;
			} else {
				throw new Error('Invlid Pattern : Char ' + chr + ' not recognised');
			}
		}
	}

	ExportPattern(start: CellCoordinates, end: CellCoordinates, patternName: string) {
		let result = '';
		result += `#N ${patternName || 'pattern'}\n`;

		result += `x = ${end.x - start.x + 1}, y = ${end.y - start.y + 1}, rule = B3/S23\n`;

		let currentCount = 1;
		let currentChr = '';

		for (let y = start.y; y <= end.y; y++) {
			for (let x = start.x; x <= end.x; x++) {
				let chr = this.board[x][y] ? 'o' : 'b';
				if (currentChr == chr) currentCount++;
				else {
					result += (currentCount > 1 ? currentCount.toString() : '') + currentChr;
					currentCount = 1;
					currentChr = chr;
				}
			}
			if (currentChr == '$') currentCount++;
			else {
				result += (currentCount > 1 ? currentCount.toString() : '') + currentChr;
				currentCount = 1;
				currentChr = '$';
			}
		}

		return result;
	}
}
