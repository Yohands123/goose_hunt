FROM node:22-slim AS build
WORKDIR /app
COPY data/kwc.json data/kwc.json
COPY web/package.json web/package-lock.json web/
RUN cd web && npm ci
COPY web web
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_TELEMETRY_DISABLED=1
RUN cd web && npm run build
FROM node:22-slim
WORKDIR /app
COPY --from=build /app/web/.next/standalone ./
COPY --from=build /app/web/.next/static ./.next/static
COPY --from=build /app/web/public ./public
ENV PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
