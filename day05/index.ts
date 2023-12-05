import fs from 'fs';

type Mapping = [number, number, number];
type ConversionMap = Record<string, { dst: string; mappings: Mapping[] }>;

function buildSeedPairs(seeds: number[]) {
    const seedPairs: number[][] = [];
    for (let i = 0; i < seeds.length; i += 2) {
        seedPairs.push([seeds[i], seeds[i + 1]]);
    }
    return seedPairs;
}

function parse() {
    const conversionMaps: ConversionMap = {};
    const reverseConversionMaps: ConversionMap = {};
    const contents = fs.readFileSync('input.txt', 'utf8').split('\n');
    const seedNumbers = contents[0]
        .split(': ')[1]
        .split(' ')
        .map((s) => parseInt(s));

    const re = /(.+)-to-(.+)\smap:\n((\d+\s?)+)/g;
    const mappings = contents.slice(1).join('\n');

    let match;
    while ((match = re.exec(mappings)) !== null) {
        const [src, dst, numbers] = match.slice(1);
        const mappings: Mapping[] = [];
        const reverseMappings: Mapping[] = [];

        const numberRows = numbers.trim().split(/\n/);
        numberRows.forEach((row) => {
            const [dstStart, srcStart, len] = row
                .split(' ')
                .map((n) => parseInt(n));

            let srcEnd = srcStart + len - 1;
            let dstEnd = dstStart + len - 1;
            mappings.push([srcStart, srcEnd, dstStart]);
            reverseMappings.push([dstStart, dstEnd, srcStart]);
        });
        conversionMaps[src] = conversionMaps[src] || {};
        conversionMaps[src] = { dst, mappings };
        reverseConversionMaps[dst] = reverseConversionMaps[dst] || {};
        reverseConversionMaps[dst] = {
            dst: src,
            mappings: reverseMappings,
        };
    }

    function lookup(
        srcType: string,
        dstType: string,
        seed: number,
        map: ConversionMap
    ) {
        let src = srcType;
        let n = seed;

        while (true) {
            if (src === dstType) {
                //memo.set(seed, n);
                return n;
            }
            let dstT = map[src];
            if (!dstT) {
                throw new Error(src + ' not found');
            }

            for (let i = 0; i < dstT.mappings.length; i++) {
                const mapping = dstT.mappings[i];

                // number is within range
                if (n >= mapping[0] && n <= mapping[1]) {
                    n = mapping[2] + (n - mapping[0]);
                    break;
                }
            }

            src = dstT.dst;
        }
    }

    function locationToSeed(location: number) {
        return lookup('location', 'seed', location, reverseConversionMaps);
    }

    function seedToLocation(seed: number) {
        return lookup('seed', 'location', seed, conversionMaps);
    }

    return { seedNumbers, seedToLocation, locationToSeed };
}

function part1() {
    const { seedNumbers, seedToLocation } = parse();

    let minLocation = Infinity;
    for (let i = 0; i < seedNumbers.length; i++) {
        const location = seedToLocation(seedNumbers[i]);
        if (location < minLocation) {
            minLocation = location;
        }
    }
    return minLocation;
}

function part2() {
    const { seedNumbers, locationToSeed } = parse();
    const seedPairs = buildSeedPairs(seedNumbers);

    function withinSeedRange(n: number) {
        for (let i = 0; i < seedPairs.length; i++) {
            const start = seedPairs[i][0];
            const end = seedPairs[i][0] + seedPairs[i][1] - 1;
            if (n >= start && n <= end) {
                return true;
            }
        }
        return false;
    }

    let seed = 0;
    let i = 0;
    while (!withinSeedRange(seed)) {
        seed = locationToSeed(i++);
    }
    return i;
}

if (process.env.part === 'part1') {
    console.log(part1());
} else {
    console.log(part2());
}
