import { file } from 'bun';

function unwrap(values: number[][], backwards: boolean): number {
    const iter = values.reverse();
    let prev = 0;
    for (let i = 0; i < iter.length; i++) {
        prev = backwards
            ? iter[i][0] - prev
            : iter[i][iter[i].length - 1] + prev;
    }
    return prev;
}

function predict(values: number[], backwards: boolean): number {
    let next: number[] = values.slice();
    let sets: number[][] = [];

    while (true) {
        const diffs: number[] = [];
        sets.push(next);
        for (let i = 0; i < next.length - 1; i++) {
            diffs.push(next[i + 1] - next[i]);
        }
        if (new Set(diffs).size === 1 && diffs[0] === 0) {
            return unwrap(sets, backwards);
        } else {
        }
        next = diffs.slice();
    }
}

const parser = {
    lines: (await file('input.txt').text()).split('\n'),

    getNumberSeries(): number[][] {
        return this.lines.map((line) => {
            return line.split(' ').map((n) => parseInt(n));
        });
    },
};

if (process.env.part === 'part1') {
    const values = parser.getNumberSeries();

    console.log(
        values.reduce((acc, value) => {
            return acc + predict(value, false);
        }, 0)
    );
} else {
    const values = parser.getNumberSeries();
    console.log(
        values.reduce((acc, value) => {
            return acc + predict(value, true);
        }, 0)
    );
}
