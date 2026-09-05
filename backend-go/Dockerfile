# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o kua-api ./main.go

# Runtime stage — minimal image
FROM alpine:3.19

WORKDIR /app
COPY --from=builder /app/kua-api .

EXPOSE 8080

CMD ["./kua-api"]
