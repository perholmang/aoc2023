import fs from 'fs';

const numbers: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
};

function isNumber(char: string): boolean {
    return char >= '0' && char <= '9';
}

function toNumber(number: any): number {
    if (isNumber(number)) {
        return parseInt(number);
    }
    return numbers[number];
}

function getDigit(line: string, parseWords: boolean, last: boolean): number {
    const re = new RegExp(
        `${last ? '.*' : ''}([0-9]${
            parseWords ? '|' + Object.keys(numbers).join('|') : ''
        })`
    );
    const match = line.match(re)![1];
    return Number.isInteger(match) ? parseInt(match) : toNumber(match);
}

function getCalibrationValue(line: string, parseWords: boolean): number {
    return parseInt(
        `${getDigit(line, parseWords, false)}${getDigit(
            line,
            parseWords,
            true
        )}`,
        10
    );
}

const input = fs.readFileSync('input.txt', 'utf-8');
let value = 0;
const parseWords = process.env.part === 'part2';
input.split('\n').forEach((line, i) => {
    value += getCalibrationValue(line, parseWords);
});
console.log(value);
