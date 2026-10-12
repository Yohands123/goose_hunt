FROM rust:1.75-slim AS build
WORKDIR /src
COPY engine/ .
RUN cargo build --release --bin goose-engine
FROM debian:bookworm-slim
COPY --from=build /src/target/release/goose-engine /usr/local/bin/goose-engine
COPY data/kwc.json /data/kwc.json
ENV MAP_DATA=/data/kwc.json PORT=7070
EXPOSE 7070
CMD ["goose-engine"]
