import { file } from 'bun';

function get_cell(cells: string[], row: number, col: number): string {
    return cells[row][col];
}

function get_neighbours(n_rows: number, n_cols: number, row: number, col: number): [number, number][] {
    const neighbours: [number, number][] = [];

    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if ((i === row && j === col) || i < 0 || i >= n_rows || j < 0 || j >= n_cols) continue;
            neighbours.push([i, j]);
        }
    }

    return neighbours;
}

function is_digit(char: string): boolean {
    return char >= '0' && char <= '9';
}

// given a cell, return the full number the cell is within, and the columns that make up the number
function expand_cell(schematic: string[], row: number, col: number): [string, number[]] {
    let numberStr = get_cell(schematic, row, col);
    let columns: number[] = [];

    for (let direction of [-1, 1]) {
        let col_idx = col;
        while (true) {
            col_idx += direction;
            const cell = get_cell(schematic, row, col_idx);
            if (!is_digit(cell)) break;
            numberStr = direction === -1 ? cell + numberStr : numberStr + cell;
            columns.push(col_idx);
        }
    }

    return [numberStr, columns];
}

// get all (expanded) neighbouring numbers of a cell
function get_nearby_numbers(cells: string[], row_size: number, row: number, col: number) {
    const neighbours = get_neighbours(row_size, col_size, row, col);
    const numbers: number[] = [];

    while (neighbours.length > 0) {
        const [row, col] = neighbours.pop()!;
        const cell = get_cell(schematic, row, col);
        if (is_digit(cell)) {
            const [full_digit, cells] = expand_cell(schematic, row, col);

            // remove cells from neighbours
            cells.forEach((c) => {
                const idx = neighbours.findIndex((n) => n[0] === row && n[1] === c);
                if (idx > -1) neighbours.splice(idx, 1);
            });
            numbers.push(parseInt(full_digit));
        }
    }

    return numbers;
}

function find_gear_ratios(cells: string[], row_size: number, col_size: number) {
    let sum = 0;
    for (let i = 0; i < row_size; i++) {
        for (let j = 0; j < col_size; j++) {
            const cell = get_cell(schematic, i, j);
            if (cell === '*') {
                const numbers = get_nearby_numbers(cells, row_size, i, j);

                if (numbers.length === 2) {
                    sum += numbers[0] * numbers[1];
                }
            }
        }
    }

    return sum;
}

function find_part_numbers(cells: string[], row_size: number, col_size: number) {
    const visited = {};
    const numbers: number[] = [];
    for (let i = 0; i < row_size; i++) {
        for (let j = 0; j < col_size; j++) {
            if (visited[`${i},${j}`]) continue;
            const cell = get_cell(schematic, i, j);

            if (cell !== '.' && !is_digit(cell)) {
                numbers.push(...get_nearby_numbers(cells, row_size, i, j));
            }
        }
    }
    return numbers.reduce((acc, curr) => acc + curr, 0);
}

const schematic = (await file('input.txt').text()).split('\n');
const row_size = schematic.length;
const col_size = schematic[0].length;

if (process.env.part === 'part1') {
    console.log(find_part_numbers(schematic, row_size, col_size));
} else if (process.env.part === 'part2') {
    console.log(find_gear_ratios(schematic, row_size, col_size));
}
