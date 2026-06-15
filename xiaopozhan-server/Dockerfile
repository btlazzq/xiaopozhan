FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

RUN test -f seed-assets/music/mp3/intro.mp3 \
  && echo "seed-assets OK: $(ls seed-assets/music/mp3 | wc -l) mp3 files" \
  || (echo "FATAL: seed-assets missing" && ls -laR seed-assets 2>/dev/null; exit 1)

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "run", "start:deploy"]
