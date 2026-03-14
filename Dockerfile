FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y git git-lfs && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# If .git exists, pull LFS files
RUN if [ -d .git ]; then git lfs install && git lfs pull; fi

RUN npm ci && npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "dist", "-s", "-l", "3000"]
