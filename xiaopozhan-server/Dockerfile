# 使用完整 bookworm 镜像，自带 g++/make，避免 slim 上 apt-get 失败
FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

RUN test -f seed-assets/music/mp3/intro.mp3 \
  && echo "seed-assets OK: $(ls seed-assets/music/mp3 | wc -l) mp3 files" \
  || (echo "FATAL: seed-assets missing in build context" && exit 1)

# 构建时烘焙数据库与 uploads，运行时复制到 Volume
RUN node server/seed.js \
  && node server/sync-frontend.js --force \
  && test -f uploads/frontend-sync/intro.mp3 \
  && echo "baked uploads OK"

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "run", "start:deploy"]
