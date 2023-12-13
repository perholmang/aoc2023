import { file } from 'bun';

const parser = {
    groups: (await file('input.txt').text())
        .split('\n\n')
        .map((group) => group.split('\n')),
};

function rows_hash(input: string[]): number[] {
    const hashes = [] as number[];
    for (let i = 0; i < input.length; i++) {
        let hash = 0;
        for (let j = 0; j < input[i].length; j++) {
            hash += input[i][j] === '#' ? 1 << j : 0;
        }
        hashes.push(hash);
    }

    return hashes;
}

function count_bits(n: number): number {
    let total = 0;

    while (n) {
        n = n & (n - 1);
        total = total + 1;
    }

    return total;
}

function cols_hash(input: string[]): number[] {
    const hashes = [] as number[];

    for (let col = 0; col < input[0].length; col++) {
        let hash = 0;
        let str = '';
        for (let row = 0; row < input.length; row++) {
            hash += input[row][col] === '#' ? 1 << row : 0;
            str += input[row][col];
        }

        hashes.push(hash);
    }

    return hashes;
}

function check_part(lst: number[]) {
    let l = 0;
    let r = lst.length;
    let wrongBits = 0;

    while (l < r) {
        const diff = Math.abs(lst[l] ^ lst[r - 1]);
        wrongBits += count_bits(diff);
        l++;
        r--;
    }

    return wrongBits;
}

function find_longest_match(hashes: number[], smudges = 0): [number, number] {
    let n = hashes.length;
    let longest = 0;
    let idx = 0;

    for (let k = 2; k < n; k += 2) {
        if (check_part(hashes.slice(0, k)) === smudges) {
            idx = 0;
            longest = k;
        }
        if (check_part(hashes.slice(n - k, n)) === smudges) {
            idx = n - k;
            longest = k;
        }
    }

    return [idx, longest];
}

function vertical_reflection(input: string[], smudges = 0) {
    const hashes = cols_hash(input);
    const match = find_longest_match(hashes, smudges);

    if (!match[1]) {
        return null;
    }
    return match[0] + match[1] / 2;
}

function horizontal_reflection(input: string[], smudges = 0) {
    const hashes = rows_hash(input);

    const match = find_longest_match(hashes, smudges);

    if (!match[1]) {
        return null;
    }

    return match[0] + match[1] / 2;
}

function main() {
    let sum = 0;
    parser.groups.forEach((group, idx) => {
        const v = vertical_reflection(
            group,
            process.env.part === 'part2' ? 1 : 0
        );
        const h = horizontal_reflection(
            group,
            process.env.part === 'part2' ? 1 : 0
        );

        if (v) {
            sum += v;
        } else if (h) {
            sum += h * 100;
        }
    });
    console.log(sum);
}

main();
