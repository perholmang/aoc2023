import { file } from 'bun';

const parser = {
    lines: (await file('input.txt').text()).split('\n'),

    rows() {
        const rows = this.lines.map((line) => {
            const [record, groups] = line.split(' ');
            return [record, groups.split(',').map((g) => parseInt(g))];
        });

        return rows;
    },
};

const cache = {};

function hash(input: string, groups: number[]) {
    return input + groups.join(',');
}

function possibleArrangements(input: string, groups: number[]) {
    const cacheKey = hash(input, groups);
    if (cacheKey in cache) {
        return cache[cacheKey];
    }

    let sumGroups = groups.reduce((a, b) => a + b, 0);

    // base case
    if (input.length === 0 && groups.length === 0) {
        return 1;
    }

    // no input left to match groups
    if (input.length === 0) {
        return 0;
    }

    // no groups to match remaining #s
    if (groups.length === 0) {
        if (input.includes('#')) {
            return 0;
        }
        return 1;
    }

    // does the input have enough characters to satisfy the groups?
    if (input.length < sumGroups + groups.length - 1) {
        return 0;
    }

    if (input[0] === '.') {
        return possibleArrangements(input.slice(1), groups);
    }

    if (input[0] === '#') {
        const [group, ...rest] = groups;

        // contains dot? then no good
        for (let i = 0; i < group; i++) {
            if (input[i] === '.') {
                return 0;
            }
        }

        // group can't be followed by #
        if (input[group] === '#') {
            return 0;
        }

        return possibleArrangements(input.slice(group + 1), rest);
    }

    // check both . and # and cache both results
    if (input[0] === '?') {
        const lft = possibleArrangements('#' + input.slice(1), groups);
        const rgt = possibleArrangements('.' + input.slice(1), groups);

        const hashLft = hash('#' + input.slice(1), groups);
        const hashRgt = hash('.' + input.slice(1), groups);

        cache[hashLft] = lft;
        cache[hashRgt] = rgt;

        return lft + rgt;
    }
}

const rows = parser.rows();
let sum = 0;
rows.forEach(([line, groups]) => {
    const isPart2 = process.env.part === 'part2';
    const lineExpanded = `${line}?${line}?${line}?${line}?${line}`;
    const groupsExpanded = [...groups, ...groups, ...groups, ...groups, ...groups];
    sum += possibleArrangements(isPart2 ? lineExpanded : line, isPart2 ? groupsExpanded : groups);
});
console.log(sum);
