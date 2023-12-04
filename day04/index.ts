import fs from 'fs';

function intersect(a: number[], b: number[]) {
    return a.filter((n) => b.includes(n));
}

function parseNumberString(input: string): number[] {
    return input
        .trim()
        .split(' ')
        .flatMap((n) => {
            if (!n.trim().length) {
                return [];
            }
            return parseInt(n.trim());
        });
}

function parseGame(line: string): [number[], number[]] {
    const contents = line.split(': ')[1];
    const [winning, own] = contents.split(' | ');

    const winningNumbers = parseNumberString(winning);
    const ownNumbers = parseNumberString(own);

    return [winningNumbers, ownNumbers];
}

function part1() {
    const matchesPerGame = parseFile('input.txt');
    const sum = matchesPerGame.reduce((total, curr) => {
        const points = curr > 0 ? Math.pow(2, curr - 1) : 0;
        return total + points;
    }, 0);
    return sum;
}

function part2() {
    const memo = new Map<number, number[]>();
    const matchesPerGame = parseFile('input.txt');
    const gamesToProcess = matchesPerGame.map((n, i) => i).reverse();
    let totalCards = 0;

    while (gamesToProcess.length) {
        const gameIndex = gamesToProcess.pop()!;
        const gamePoints = matchesPerGame[gameIndex];

        if (memo.get(gameIndex)) {
            gamesToProcess.push(...memo.get(gameIndex)!);
        } else {
            const ticketsToAdd: number[] = [];

            for (let i = gameIndex + 1; i < gameIndex + gamePoints + 1; i++) {
                if (i <= matchesPerGame.length) {
                    ticketsToAdd.push(i);
                    if (matchesPerGame[i] > 0) gamesToProcess.push(i);
                    else totalCards += 1;
                }
            }
            memo.set(gameIndex, ticketsToAdd);
        }

        totalCards += 1;
    }

    return totalCards;
}

function parseFile(filename: string): number[] {
    const contents = fs.readFileSync(filename, 'utf8');

    const pointsPerGame = contents.split('\n').map((line: string) => {
        const [winningNumbers, ownNumbers] = parseGame(line);
        const matching = intersect(ownNumbers, winningNumbers);
        return matching.length;
    });
    return pointsPerGame;
}

if (process.argv[2] === 'part1') {
    console.log(part1());
} else {
    console.log(part2());
}
