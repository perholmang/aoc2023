FROM oven/bun:latest

COPY package.json bun.lockb ./

RUN  bun install --production

COPY index.ts ./
COPY input.txt ./

CMD bun index.ts