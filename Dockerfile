# -----------------------------------------------------------------------------
# Dockerfile for Menu Plus Frontend (Astro + React) - Production Build
# -----------------------------------------------------------------------------
# This Dockerfile builds and runs the Astro frontend in production mode.
# Removes all console.log and comments during build.
# -----------------------------------------------------------------------------

# ----- Base image -------------------------------------------------------------
FROM node:18-alpine AS base

# Set environment variable for increased request body size (50MB)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# ----- Dependencies layer -----------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy only package manifests first (leverages cache if package.json unchanged)
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# ----- Builder layer ----------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# Build the project for production
# This will remove console.log and comments as configured in astro.config.mjs
RUN npm run build

# ----- Runtime layer ----------------------------------------------------------
FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PUBLIC_API_URL=/api
ENV HOST=0.0.0.0
ENV PORT=4321

# Set environment variables for increased request body size
ENV INCREASED_MEMORY_LIMIT=4096
ENV MAX_PAYLOAD_SIZE=52428800

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy custom server entry point with increased limits
COPY server-with-limits.js ./dist/server/

# Expose Astro server port
EXPOSE 4321

# Run the production server with increased limits
CMD ["node", "--max-old-space-size=4096", "--max-http-header-size=16384", "./dist/server/server-with-limits.js"]
