# Stage 1: Build dependency and build step
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package definition files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the Nuxt application
RUN npm run build

# Stage 2: Final runner stage
FROM node:24-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

# Expose port 8080 for Google Cloud Run
EXPOSE 8080

# Copy the build output from the builder stage
COPY --from=builder /app/.output ./.output

CMD ["node", ".output/server/index.mjs"]
