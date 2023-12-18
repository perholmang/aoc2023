import { file } from 'bun';

type Direction = 'U' | 'D' | 'L' | 'R';
type Instruction = [Direction, number, string];

const parser = {
    lines: (await file('input.txt').text()).split('\n').map((line: string) => {
        const m = line.match(/([RDLU])\s(\d+)\s(\(.+\))+/);
        if (!m) throw new Error(`Invalid line: ${line}`);
        return [m[1], parseInt(m[2]), m[3]] as Instruction;
    }),
};

const lines = parser.lines;

function build_path(lines: Instruction[], decode_hex: boolean = false) {
    let pos: [number, number] = [0, 0];
    const path: [number, number][] = [[0, 0]];
    for (let i = 0; i < lines.length; i++) {
        let direction = lines[i][0];
        let distance = lines[i][1];
        if (decode_hex) {
            const parsed = parse_hex(lines[i][2]);
            direction = parsed[0];
            distance = parsed[1];
        }

        switch (direction) {
            case 'U':
                pos[1] += distance;
                break;
            case 'D':
                pos[1] -= distance;
                break;
            case 'L':
                pos[0] -= distance;
                break;
            case 'R':
                pos[0] += distance;
                break;
            default:
                throw new Error('invalid');
        }

        path.push([pos[0], pos[1]]);
    }
    return path;
}

function hex2dec(hex: string) {
    return parseInt(hex, 16);
}

function parse_hex(hex: string): [Direction, number] {
    const distance = parseInt(hex.substring(2, 7), 16);
    const direction = 'RDLU'.charAt(+hex.charAt(7)) as Direction;

    return [direction, distance];
}

function shoelace(paths: [number, number][]) {
    let sum = 0;
    for (let i = 0; i < paths.length - 1; i++) {
        const a = paths[i][1] * paths[i + 1][0];
        const b = paths[i][0] * paths[i + 1][1];
        sum += a - b;
    }
    return sum / 2;
}

function perimeter(path: [number, number][]) {
    let perimeter = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const f = path[i];
        const t = path[i + 1];
        if (f[0] === t[0]) {
            perimeter += Math.abs(f[1] - t[1]);
        } else {
            perimeter += Math.abs(f[0] - t[0]);
        }
    }
    return perimeter;
}

if (process.env.part === 'part1') {
    // picks theorem!
    const path = build_path(lines);
    console.log(shoelace(path) + perimeter(path) / 2 + 1);
} else if (process.env.part === 'part2') {
    const path = build_path(lines, true);
    console.log(shoelace(path) + perimeter(path) / 2 + 1);
}
