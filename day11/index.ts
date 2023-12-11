import { file } from 'bun';
import Heap from 'heap';

type Universe = {
    width: number;
    height: number;
    stars: [number, number][];
    data: string[];
    emptyRows: number[];
    emptyCols: number[];
};

const parser = {
    lines: (await file('input.txt').text()).split('\n'),

    getUniverse(): Universe {
        const width = this.lines[0].length;
        const height = this.lines.length;

        const emptyRows: number[] = [];
        const nonEmptyCols: number[] = [];
        const allCols = new Set<number>();

        this.lines.forEach((line, row) => {
            let emptyRow = true;
            line.split('').forEach((char, col) => {
                allCols.add(col);
                if (char !== '.' && !nonEmptyCols.includes(col)) {
                    nonEmptyCols.push(col);
                }
                if (char !== '.') {
                    emptyRow = false;
                }
            });
            if (emptyRow) {
                emptyRows.push(row);
            }
        });

        return {
            width,
            height,
            data: this.lines,
            stars: this.getStars(this.lines),
            emptyRows,
            emptyCols: Array.from(allCols).filter(
                (col) => !nonEmptyCols.includes(col)
            ),
        };
    },
    getStars(data: string[]): [number, number][] {
        const stars: [number, number][] = [];
        data.forEach((line, row) => {
            return line.split('').forEach((char, col) => {
                if (char === '#') {
                    stars.push([row, col]);
                }
            });
        });
        return stars;
    },
};

function stepsBetween(
    a: [number, number],
    b: [number, number],
    universe: Universe,
    expansionSize: number
): number {
    let [y1, x1] = a;
    let [y2, x2] = b;

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);

    let extraSteps = 0;

    for (let x = Math.min(x1, x2); x < Math.max(x1, x2); x++) {
        if (universe.emptyCols.includes(x)) extraSteps += expansionSize;
    }

    for (let y = Math.min(y1, y2); y < Math.max(y1, y2); y++) {
        if (universe.emptyRows.includes(y)) extraSteps += expansionSize;
    }

    return dx + dy + extraSteps;
}

function main() {
    const universe = parser.getUniverse();
    const stars = universe.stars;
    let expansionSize = process.env.part === 'part1' ? 1 : 1_000_000 - 1;
    let sum = 0;

    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const distance = stepsBetween(
                stars[i],
                stars[j],
                universe,
                expansionSize
            );
            sum += distance;
        }
    }
    console.log(sum);
}

main();
