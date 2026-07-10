FROM golang:1.25-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/blog-api .

FROM alpine:3.22

WORKDIR /app

RUN addgroup -S app \
  && adduser -S app -G app

COPY --from=builder /out/blog-api ./blog-api
COPY config.yml ./config.yml
COPY public ./public

RUN mkdir -p uploads \
  && chown -R app:app /app

USER app

EXPOSE 8000

CMD ["./blog-api"]
