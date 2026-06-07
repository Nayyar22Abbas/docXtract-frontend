# Stage 1: Build the Next.js app
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Install pnpm (faster than npm)
RUN npm install -g pnpm

# Copy only dependency files first (to leverage Docker cache)
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN pnpm run build

# Stage 2: Run the optimized app
FROM node:18-slim AS runner

WORKDIR /app

# Install pnpm (needed to run)
RUN npm install -g pnpm

# Copy built files from builder
COPY --from=builder /app ./

# Expose Next.js default port
EXPOSE 3000

# Start Next.js in production mode
CMD ["pnpm", "start"]

