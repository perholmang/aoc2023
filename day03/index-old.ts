import fs from 'fs';

function isNumber(char: string) {
    return !isNaN(parseInt(char));
}

class Schematic {
    private escapedSymbols: string;
    indexToNumberMap: Map<number, number>;

    constructor(private cells: string[], private rows: number, private cols: number, symbols: string) {
        this.escapedSymbols = symbols
            .split('')
            .map((s) => '\\' + s)
            .join('');
    }

    idx(row: number, col: number) {
        return row * this.cols + col;
    }

    getCell(row: number, col: number) {
        return this.cells[row][col];
    }

    getNeighbours(row: number, col: number) {
        const neighbours: string[] = [];

        for (let i = -1; i <= 1; i++) {
            const neighbourRow = row + i;
            if (neighbourRow < 0 || neighbourRow >= this.rows) continue;

            for (let j = -1; j <= 1; j++) {
                const neighbourCol = col + j;
                if (neighbourCol < 0 || neighbourCol >= this.cols) continue;

                if (i === 0 && j === 0) continue;

                neighbours.push(this.getCell(neighbourRow, neighbourCol));
            }
        }

        return neighbours.join('');
    }

    getNeighbourIndices(row: number, col: number) {
        const neighbours: number[] = [];

        for (let i = -1; i <= 1; i++) {
            const neighbourRow = row + i;
            if (neighbourRow < 0 || neighbourRow >= this.rows) continue;

            for (let j = -1; j <= 1; j++) {
                const neighbourCol = col + j;
                if (neighbourCol < 0 || neighbourCol >= this.cols) continue;

                if (i === 0 && j === 0) continue;

                neighbours.push(neighbourRow * this.cols + neighbourCol);
            }
        }

        return neighbours;
    }

    cellSeesSymbol(row: number, col: number) {
        const regexp = new RegExp(`[${this.escapedSymbols}]`);
        return this.getNeighbours(row, col).match(regexp);
    }

    getGearRatio() {}

    buildNumberMap() {
        let currentNumber: string = '';
        const numbers: number[] = [];

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const currentCell = this.getCell(i, j);
                if (isNumber(currentCell)) {
                    currentNumber += currentCell;

                    if (j === this.cols - 1) {
                        numbers.push(parseInt(currentNumber));
                        currentNumber = '';
                    }
                } else {
                    if (currentNumber.length > 0) {
                        numbers.push(parseInt(currentNumber));
                    }
                    currentNumber = '';
                }
            }
        }
    }

    buildNumbersMap() {
        const re = /(\d+)/g;
        const map = new Map<number, number>();

        for (let i = 0; i < this.rows; i++) {
            const matches = /r/.exec(this.cells[i]);
            let match;
            while ((match = re.exec(this.cells[i])) != null) {
                const n = parseInt(match[0]);
                for (let j = match.index; j < match.index + match[0].length; j++) {
                    map.set(i * this.cols + j, n);
                }
            }

            this.indexToNumberMap = map;
        }
    }

    getGears() {
        this.buildNumbersMap();
        let gearRatios: number[] = [];

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const currentCell = this.getCell(i, j);
                if (currentCell === '*') {
                    const neighbours = this.getNeighbourIndices(i, j);

                    for (let k = 0; k < neighbours.length; k++) {}
                    /*const numbers = new Set();
                    for (let k = 0; k < neighbours.length; k++) {
                        const idx = neighbours[k];

                        if (this.indexToNumberMap.has(idx)) {
                            numbers.add(this.indexToNumberMap.get(idx));
                        }
                    }
                    if (numbers.size === 2) {
                        const arr = <number[]>Array.from(numbers);
                        gearRatios.push(arr[0] * arr[1]);
                    }*/
                }
            }
        }

        console.log(gearRatios.reduce((acc, curr) => acc + curr, 0));
    }

    getPartNumbers() {
        let currentNumber: string = '';
        const partNumbers: number[] = [];
        let hasSeenSymbol = false;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const currentCell = this.getCell(i, j);
                if (isNumber(currentCell)) {
                    currentNumber += currentCell;

                    if (hasSeenSymbol || this.cellSeesSymbol(i, j)) {
                        hasSeenSymbol = true;
                    }
                    if (j === this.cols - 1 && hasSeenSymbol) {
                        partNumbers.push(parseInt(currentNumber));
                        currentNumber = '';
                        hasSeenSymbol = false;
                    }
                } else {
                    if (currentNumber.length > 0 && hasSeenSymbol) {
                        partNumbers.push(parseInt(currentNumber));
                    }
                    hasSeenSymbol = false;
                    currentNumber = '';
                }
            }
        }

        return partNumbers;
    }
}

function buildSchematic(filename: string) {
    const lines = fs.readFileSync(filename, 'utf8').trim().split('\n');

    const symbols = Array.from(new Set(lines.join('').replace(/[0-9\.]+/g, '')).values()).join('');

    const rows = lines.length;
    const cols = lines[0].length;

    return new Schematic(lines, rows, cols, symbols);
}

const schematic = buildSchematic('input.txt');
schematic.buildNumbersMap();
schematic.getGears();
/*const numbers = schematic.getPartNumbers();
const sum = numbers.reduce((acc, curr) => acc + curr, 0);

console.log(numbers);
//console.log(numbers.slice(20, 40));
console.log(sum);
*/
