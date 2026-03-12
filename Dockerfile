FROM oven/bun:latest
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

COPY . .

RUN bun run build

EXPOSE 8080

CMD ["PATH="$HOME/.volta/tools/image/node/22.21.0/bin:$PATH"", "astro", "dev"]
