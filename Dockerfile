# 仓库根目录部署（Railway Root Directory 留空时使用）
FROM node:20-bookworm

WORKDIR /app

COPY xiaopozhan-server/package.json xiaopozhan-server/package-lock.json* ./
RUN npm install --omit=dev

COPY xiaopozhan-server/ .

RUN test -f seed-assets/music/mp3/intro.mp3 \
  && echo "seed-assets OK: $(ls seed-assets/music/mp3 | wc -l) mp3 files" \
  || (echo "FATAL: seed-assets missing" && exit 1)

RUN node server/seed.js \
  && node server/sync-frontend.js --force \
  && test -f uploads/frontend-sync/intro.mp3 \
  && echo "baked uploads OK"

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "run", "start:deploy"]
