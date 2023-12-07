import { file } from 'bun';

const CARDS = '23456789TJQKA';

type Hand = {
    cards: string;
    type: HandType;
    bid: number;
};

const HandTypes = [
    'highcard',
    'pair',
    'twopair',
    'threeofakind',
    'fullhouse',
    'fourofakind',
    'fiveofakind',
] as const;

type HandType = (typeof HandTypes)[number];

function getHandType(hand: string, jokersAreWild = false): HandType {
    const map = new Map<string, number>();
    const numJokers = jokersAreWild ? (hand.match(/J/g) || []).length : 0;
    hand.split('').forEach((card) => {
        map.set(card, (map.get(card) ?? 0) + 1);
    });

    switch (map.size) {
        case 1:
            return 'fiveofakind';
        case 2:
            // fullhouse or four of a kind
            if (numJokers) return 'fiveofakind';
            const first = map.get(Array.from(map.keys())[0]);
            return first === 2 || first === 3 ? 'fullhouse' : 'fourofakind';
        case 3:
            if (numJokers === 2) return 'fourofakind';
            // twopair or three of a kind
            for (let i = 0; i < map.size; i++) {
                const value = map.get(Array.from(map.keys())[i]);
                if (value === 2) {
                    return numJokers ? 'fullhouse' : 'twopair';
                } else if (value === 3) {
                    return numJokers ? 'fourofakind' : 'threeofakind';
                }
            }
        case 4:
            return numJokers ? 'threeofakind' : 'pair';
        case 5:
            return numJokers ? 'pair' : 'highcard';
    }

    throw Error('Unknown hand type ' + hand);
}

function cmpStrongestCard(a: string, b: string, valueArr): number {
    for (let i = 0; i < a.length; i++) {
        if (valueArr.indexOf(a[i]) === valueArr.indexOf(b[i])) {
            continue;
        }
        return valueArr.indexOf(a[i]) - valueArr.indexOf(b[i]);
    }
    return 0;
}

function buildSortFn(jokersAreWild = false) {
    return function sortFn(a: Hand, b: Hand): number {
        const aRank = HandTypes.indexOf(a.type);
        const bRank = HandTypes.indexOf(b.type);

        return a.type === b.type
            ? cmpStrongestCard(
                  a.cards,
                  b.cards,
                  jokersAreWild ? 'J' + CARDS.replace('J', '') : CARDS
              )
            : aRank - bRank;
    };
}

const parser = {
    lines: (await file('input.txt').text()).split('\n'),

    getHands(jokersAreWild: boolean) {
        const hands = this.lines.map((line) => {
            const [cards, bid] = line.split(' ');
            const type = getHandType(cards, jokersAreWild);
            return { type, cards, bid: parseInt(bid) };
        });

        hands.sort(buildSortFn(jokersAreWild));

        return hands;
    },
};

function calculateTotalWinnings(jokersAreWild: boolean) {
    return parser.getHands(jokersAreWild).reduce((acc, hand, i) => {
        return acc + (i + 1) * hand.bid;
    }, 0);
}

if (process.env.part === 'part1') {
    console.log(calculateTotalWinnings(false));
} else {
    console.log(calculateTotalWinnings(true));
}
