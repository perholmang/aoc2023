import fs from 'fs';

type Race = { time: number; distance: number };

function read(file: string, singleRace = false): Race[] {
    const contents = fs.readFileSync(file, 'utf8').split('\n');
    const timesStr = contents[0].split(':')[1].trim();
    const distancesStr = contents[1].split(':')[1].trim();

    if (singleRace) {
        const time = parseInt(timesStr.replace(/\s+/g, '').trim(), 10);
        const distance = parseInt(distancesStr.replace(/\s+/g, '').trim(), 10);
        return [{ time, distance }];
    }

    function splitAndParse(input: string): number[] {
        return input
            .replace(/\s+/g, ' ')
            .split(' ')
            .map((t) => parseInt(t.trim(), 10));
    }

    const times = splitAndParse(timesStr);
    const distances = splitAndParse(distancesStr);

    const races = times.reduce<Race[]>((acc, curr, i) => {
        return [...acc, { time: curr, distance: distances[i] }];
    }, []);

    return races;
}

function calculateDistance(race: Race, gasTime: number): number {
    return (race.time - gasTime) * gasTime;
}
function waysToBeatRace(race: Race): number {
    let timesNotWorking = 0;

    // from start
    for (let j = 1; j < race.time; j++) {
        const distance = calculateDistance(race, j);
        if (distance <= race.distance) {
            timesNotWorking++;
        } else {
            break;
        }
    }

    // from end
    for (let j = race.time - 1; j > 1; j--) {
        const distance = calculateDistance(race, j);
        if (distance <= race.distance) {
            timesNotWorking++;
        } else {
            break;
        }
    }
    return race.time - timesNotWorking;
}

function part1() {
    const races = read('input.txt');
    return races
        .map((race) => waysToBeatRace(race))
        .reduce((acc, curr) => acc * curr, 1);
}

function part2() {
    const race = read('input.txt', true)[0];

    return waysToBeatRace(race);
}

if (process.env.part === 'part1') {
    console.log(part1());
} else {
    console.log(part2());
}
