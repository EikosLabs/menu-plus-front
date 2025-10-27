# -----------------------------------------------------------------------------
# Dockerfile for Menu Plus Frontend (Astro + React) - Production Build
# -----------------------------------------------------------------------------
# This Dockerfile builds and runs the Astro frontend in production mode.
# Removes all console.log and comments during build.
# -----------------------------------------------------------------------------

# ----- Base image -------------------------------------------------------------
FROM node:18-alpine AS base

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

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose Astro server port
EXPOSE 4321

# Run the production server
CMD ["node", "./dist/server/entry.mjs"]
