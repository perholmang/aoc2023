import { file } from 'bun';

const parser = {
    lines: (await file('input.txt').text()).split('\n').map((line) => line.split('')) as string[][],
};

type HorizontalDirection = 'east' | 'west';
type VerticalDirection = 'north' | 'south';

function tilt_horizontal(board: string[][], direction: HorizontalDirection): string[][] {
    const nRows = board.length;
    const nCols = board[0].length;
    const output = direction === 'east' ? board.map((row) => row.reverse()) : board.slice();

    for (let row = 0; row < nRows; row++) {
        for (let col = 1; col < nCols; col++) {
            if (board[row][col] === 'O') {
                let newCol = col;
                while (newCol >= 1 && board[row][newCol - 1] === '.') {
                    newCol--;
                }

                if (newCol !== col) {
                    output[row][newCol] = board[row][col];
                    output[row][col] = '.';
                }
            }
        }
    }

    return direction === 'east' ? output.map((row) => row.reverse()) : output;
}

function tilt_vertical(board: string[][], direction: VerticalDirection) {
    const nRows = board.length;
    const nCols = board[0].length;
    const output = direction === 'south' ? board.reverse() : board.slice();

    for (let row = 1; row < nRows; row++) {
        for (let col = 0; col < nCols; col++) {
            if (board[row][col] === 'O') {
                let newRow = row;
                while (newRow >= 1 && board[newRow - 1][col] === '.') {
                    newRow--;
                }

                if (newRow !== row) {
                    output[newRow][col] = board[row][col];
                    output[row][col] = '.';
                }
            }
        }
    }

    return direction === 'south' ? output.reverse() : output;
}

function total_load(board: string[][]): number {
    return board.reduce((acc, line, idx) => acc + line.filter((c) => c === 'O').length * (board.length - idx), 0);
}

function cycle(board: string[][]) {
    return tilt_horizontal(tilt_vertical(tilt_horizontal(tilt_vertical(board, 'north'), 'west'), 'south'), 'east');
}

function clone(board: string[][]) {
    return board.map((line) => line.slice());
}

if (process.env.part === 'part1') {
    console.log(total_load(tilt_vertical(parser.lines, 'north')));
} else if (process.env.part === 'part2') {
    const cache = new Map<string, number>();
    let cycled = clone(parser.lines);

    let cycleLength = 0;
    let idx = 0;
    while (!cycleLength) {
        cycled = cycle(cycled);
        const key = cycled.map((line) => line.join('')).join('\n');
        if (cache.has(key)) {
            cycleLength = idx - cache.get(key)!;
        } else {
            cache.set(key, idx);
        }
        idx++;
    }

    const offset = idx - 1 - cycleLength;
    const index = (1000000000 - offset) % cycleLength;

    cycled = clone(parser.lines);
    for (let i = 0; i < idx + index - 1; i++) {
        cycled = cycle(cycled);
    }
    console.log(total_load(cycled));
}
