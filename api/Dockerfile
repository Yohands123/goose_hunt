FROM node:22-slim
WORKDIR /app
COPY data/kwc.json data/kwc.json
COPY web/package.json web/package.json
COPY web/src/game web/src/game
COPY api/package.json api/package-lock.json api/
RUN cd api && npm ci --omit=dev
COPY api/src api/src
WORKDIR /app/api
ENV PORT=8080
EXPOSE 8080
CMD ["npx", "tsx", "src/server.ts"]
