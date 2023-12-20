import { file } from 'bun';

type ModuleType = 'flipflop' | 'conjunction';
type Pulse = 'high' | 'low';
type PulseEvent = { source: string; target: string; pulse: Pulse };

function gcd(a: number, b: number): number {
    if (b === 0) return a;
    return gcd(b, a % b);
}

function lcm(a: number, b: number): number {
    return (a * b) / gcd(a, b);
}

class Module {
    private memory: string | Record<string, Pulse>;

    constructor(public name, private type: ModuleType, public targets: string[]) {
        if (type === 'flipflop') {
            this.memory = 'off';
        }
    }

    init_memory(inputs: string[]) {
        if (this.type === 'conjunction') {
            this.memory = inputs.reduce((a, c) => ({ ...a, [c]: 'low' }), {});
        }
    }

    receive(source: string, pulse: Pulse): PulseEvent[] {
        if (this.type === 'flipflop' && pulse === 'low') {
            this.memory = this.memory === 'on' ? 'off' : 'on'; // flip
            let type: Pulse = this.memory === 'on' ? 'high' : 'low';
            return this.targets.map((d) => ({
                source: this.name,
                target: d,
                pulse: type,
            }));
        } else if (this.type === 'conjunction') {
            this.memory[source] = pulse;
            let type: Pulse = Object.values(this.memory).every((p) => p === 'high') ? 'low' : 'high';
            return this.targets.map((d) => ({
                source: this.name,
                target: d,
                pulse: type,
            }));
        }
        return [];
    }
}

function inputs_for(name: string, modules: Record<string, Module>): string[] {
    return Object.values(modules)
        .filter((m) => m.targets.includes(name))
        .map((m) => m.name)
        .filter((n) => n !== name);
}

async function parse() {
    const modules: Record<string, Module> = {};
    const initial_targets: string[] = [];
    const initialize_later: string[] = [];

    (await file('input.txt').text()).split('\n').forEach((line) => {
        const [name, targets] = line.split(' -> ');
        if (name === 'broadcaster') {
            initial_targets.push(...targets.split(', '));
        } else if (name.startsWith('%')) {
            modules[name.substring(1)] = new Module(name.substring(1), 'flipflop', targets.split(', '));
        } else if (name.startsWith('&')) {
            modules[name.substring(1)] = new Module(name.substring(1), 'conjunction', targets.split(', '));
            initialize_later.push(name.substring(1));
        }
    });

    initialize_later.forEach((name) => {
        modules[name].init_memory(inputs_for(name, modules));
    });

    return { initial_targets, modules };
}

if (process.env.part === 'part1') {
    let high = 0,
        low = 0;

    const q: PulseEvent[] = [];
    const { initial_targets, modules } = await parse();

    for (let i = 0; i < 1000; i++) {
        low += 1; // button
        initial_targets.forEach((t) => q.push({ source: 'broadcaster', target: t, pulse: 'low' }));
        while (q.length) {
            const next = q.shift()!;
            if (next.pulse === 'high') high += 1;
            else low += 1;

            const module = modules[next.target];

            if (module) {
                const events = module.receive(next.source, next.pulse);
                q.push(...events);
            }
        }
    }

    console.log(high * low);
} else if (process.env.part === 'part2') {
    const { initial_targets, modules } = await parse();
    const q: PulseEvent[] = [];
    let button_presses = 0;

    const [feeds_to_rx] = Object.values(modules)
        .filter((m) => m.targets.includes('rx'))
        .map((m) => m.name);

    const feeds_to_feeds_to_rx = Object.values(modules)
        .filter((m) => m.targets.includes(feeds_to_rx))
        .map((m) => m.name);

    const seen = feeds_to_feeds_to_rx.reduce((a, c) => {
        return { ...a, [c]: 0 };
    }, {});

    const cycles: Record<string, number> = {};

    while (true) {
        button_presses += 1;
        initial_targets.forEach((t) => q.push({ source: 'broadcaster', target: t, pulse: 'low' }));
        while (q.length) {
            const next = q.shift()!;
            const module = modules[next.target];

            if (module) {
                if (module.name === feeds_to_rx && next.pulse === 'high') {
                    seen[next.source] += 1;

                    if (!(next.source in cycles)) {
                        cycles[next.source] = button_presses;
                    }

                    if (Object.values(seen).every((v) => v)) {
                        console.log(Object.values(cycles).reduce(lcm));
                        process.exit(0);
                    }
                }
                const events = module.receive(next.source, next.pulse);
                q.push(...events);
            }
        }
    }
}
