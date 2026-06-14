FROM node:20-bookworm-slim

ENV LANG=ja_JP.UTF-8
ENV TZ=Asia/Tokyo
# npm ci 時（root）も実行時（pptruser）も同じパスを参照させる
ENV PUPPETEER_CACHE_DIR=/usr/app/.cache/puppeteer

# puppeteer が必要とするランタイムライブラリ（x86_64 / Debian 12）
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       fonts-ipafont-gothic \
       fonts-wqy-zenhei \
       fonts-thai-tlwg \
       fonts-kacst \
       fonts-freefont-ttf \
       libxss1 \
       libasound2 \
       libatk-bridge2.0-0 \
       libatk1.0-0 \
       libcairo2 \
       libcups2 \
       libdbus-1-3 \
       libdrm2 \
       libfontconfig1 \
       libgbm1 \
       libglib2.0-0 \
       libnspr4 \
       libnss3 \
       libpango-1.0-0 \
       libpangocairo-1.0-0 \
       libx11-6 \
       libx11-xcb1 \
       libxcb1 \
       libxcomposite1 \
       libxcursor1 \
       libxdamage1 \
       libxext6 \
       libxfixes3 \
       libxi6 \
       libxkbcommon0 \
       libxrandr2 \
       libxrender1 \
       libxtst6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app

# package*.json を先にコピーしてレイヤーキャッシュを活かす
COPY package*.json ./

# puppeteer が bundled Chromium を自動ダウンロード（x86_64 用）
RUN npm ci \
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads /usr/app/logs \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/app

USER pptruser

COPY --chown=pptruser:pptruser . .

# TypeScript をコンパイル + 静的アセットを build/ にコピー
RUN npm run compile \
    && cp -r src/commands/html-project build/src/commands/html-project

EXPOSE 3000

CMD ["npm", "run", "start"]
