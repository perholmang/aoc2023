import { file } from 'bun';

type Box = { label: string; fl: number }[];

const parser = {
    sequence: (await file('input.txt').text()).split(','),
};

function hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i);
        hash *= 17;
        hash = hash % 256;
    }
    return hash;
}

const re = /(.+)(-|=)(.*)/;

if (process.env.part === 'part1') {
    let sum = 0;
    parser.sequence.forEach((step) => {
        sum += hash(step);
    });
    console.log(sum);
} else {
    const boxes: Box[] = [];

    for (let i = 0; i < parser.sequence.length; i++) {
        const step = parser.sequence[i];
        const [_, label, op, fl] = step.match(re);
        const boxNumber = hash(label);
        if (op === '-') {
            if (!boxes[boxNumber]) {
                continue;
            }
            let box = boxes[boxNumber];
            boxes[boxNumber] = box.filter((b) => b.label !== label);
        } else if (op === '=') {
            boxes[boxNumber] = boxes[boxNumber] || [];
            const lensIdx = boxes[boxNumber].findIndex((b) => b.label === label);
            if (lensIdx >= 0) {
                boxes[boxNumber][lensIdx] = { label, fl: parseInt(fl) };
            } else {
                boxes[boxNumber].push({ label, fl: parseInt(fl) });
            }
        }
    }

    let sum = 0;
    for (let i = 0; i < boxes.length; i++) {
        if (!boxes[i]) continue;
        for (let j = 0; j < boxes[i].length; j++) {
            const power = (i + 1) * (j + 1) * boxes[i][j].fl;
            sum += power;
        }
    }
    console.log(sum);
}
