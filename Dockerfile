# -----------------------------------------------------------------------------
# Dockerfile for Menu Plus Frontend (Astro + React)
# -----------------------------------------------------------------------------
# This Dockerfile builds and runs the Astro frontend in a lightweight container.
# It is intended for development or simple deployments where running the Astro
# dev server is sufficient.  For production SSR, you should add an appropriate
# Astro adapter (e.g. @astrojs/node) and replace the CMD with the built output.
# -----------------------------------------------------------------------------

# ----- Base image -------------------------------------------------------------
# Use a small, secure Node image.
FROM node:18-alpine AS base

# ----- Dependencies layer -----------------------------------------------------
# Install dependencies separately to leverage Docker layer caching.
FROM base AS deps
WORKDIR /app

# Copy only package manifests first (leverages cache if package.json unchanged)
COPY package.json package-lock.json ./

# Install production dependencies (omit dev dependencies for smaller image).
# If you need dev dependencies (e.g. for tailwind in dev), remove --omit=prod.
RUN npm ci --omit=dev

# ----- Builder layer ----------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# (Optional) Build the project for production.
# NOTE: The project currently runs with `output: "server"` and *no* adapter.
# If you add an adapter, uncomment the build command and adjust the runtime.
# RUN npm run build

# ----- Runtime layer ----------------------------------------------------------
FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules and source code into runtime layer
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose Astro dev server port
EXPOSE 4321

# By default, run the Astro dev server and bind to all interfaces.
# For production, change to: `node ./dist/server/entry.mjs` (after building)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
